from fastapi import APIRouter, HTTPException, Request, Depends
from app.schemas.models import AnalyzeRequest, AnalyzeResponse, FeedbackRequest
from app.services.transcript import TranscriptService
from app.services.llm import LLMService
from app.services.video_metadata import fetch_video_metadata
from app.utils.logger import logger
from app.services.supabase_client import supabase
from jose import jwt
import asyncio
import re
import os
import uuid
from datetime import datetime, timedelta, timezone

router = APIRouter()

CLERK_JWT_ISSUER = os.getenv("CLERK_JWT_ISSUER", "https://clerk.com/")
CLERK_JWT_PUBLIC_KEY = os.getenv("CLERK_JWT_PUBLIC_KEY")

# Helper to get Clerk user from JWT
def get_clerk_user(request: Request):
    auth_header = request.headers.get("authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = auth_header.split(" ", 1)[1]
    if not CLERK_JWT_PUBLIC_KEY:
        raise HTTPException(status_code=500, detail="CLERK_JWT_PUBLIC_KEY not set in environment variables")
    try:
        payload = jwt.decode(token, CLERK_JWT_PUBLIC_KEY, algorithms=["RS256"], issuer=CLERK_JWT_ISSUER)
        return payload
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid Clerk token: {e}")

def clean_section(text: str) -> str:
    text = re.sub(r"^(here (is|are)\b[^:]*:|summary:|tweet:?|key takeaway:?|takeaway:?|hashtags?:?)", "", text, flags=re.IGNORECASE).strip()
    return text.strip('"\' \n')

async def get_or_create_user(clerk_user: dict) -> dict:
    clerk_id = clerk_user["sub"]
    user_resp = supabase.table("users").select("*").eq("clerk_id", clerk_id).execute()
    if not user_resp.data:
        logger.info(f"User with clerk_id {clerk_id} not found. Creating new user.")
        user_insert = supabase.table("users").insert({
            "clerk_id": clerk_id,
            "email": clerk_user.get("email"),
        }).execute()
        return user_insert.data[0]
    else:
        logger.info(f"User with clerk_id {clerk_id} found. Retrieving existing user.")
        return user_resp.data[0]

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_video(request: AnalyzeRequest, clerk_user: dict = Depends(get_clerk_user)):
    try:
        user = await get_or_create_user(clerk_user)
        user_id = user["id"]

        # Monthly credit reset logic
        last_reset = datetime.fromisoformat(user['credits_last_reset'])
        if datetime.now(timezone.utc) - last_reset > timedelta(days=30):
            user['credits_remaining'] = 5 # Reset credits for free tier
            user['credits_last_reset'] = datetime.now(timezone.utc).isoformat()
            supabase.table('users').update({
                'credits_remaining': user['credits_remaining'],
                'credits_last_reset': user['credits_last_reset']
            }).eq('id', user_id).execute()

        # Check credits
        if user['tier'] == 'free' and user['credits_remaining'] <= 0:
            raise HTTPException(status_code=429, detail="You have exhausted your free credits for the month.")

        # Get or create video
        video_resp = supabase.table("videos").select("*").eq("youtube_url", request.youtube_url).execute()
        if not video_resp.data:
            metadata = fetch_video_metadata(request.youtube_url)
            if metadata is None:
                metadata = {}
            video_insert = supabase.table("videos").insert({
                "youtube_url": request.youtube_url,
                "title": metadata.get('title'),
                "channel_name": metadata.get('channel_name'),
                "channel_url": metadata.get('channel_url'),
                "thumbnail_url": metadata.get('thumbnail_url'),
                "duration_seconds": metadata.get('duration_seconds'),
                "published_date": metadata.get('published_date').isoformat() if metadata.get('published_date') else None
            }).execute()
            video = video_insert.data[0]
        else:
            video = video_resp.data[0]
        video_id = video["id"]
        logger.info(f"Video object before AnalyzeResponse: {video}")

        # Check for cached analysis
        analysis = None
        try:
            analysis_resp = supabase.table("video_analysis").select("*").eq("video_id", video_id).eq("user_id", user_id).single().execute()
            analysis = analysis_resp.data
        except Exception as e:
            # If the error is "no rows", treat as cache miss
            if hasattr(e, "args") and e.args and ("PGRST116" in str(e.args[0]) or "multiple (or no) rows returned" in str(e.args[0])):
                analysis = None
            else:
                # Re-raise other unexpected exceptions
                raise

        if analysis:
            return AnalyzeResponse(
                **analysis,
                title=video.get("title"),
                channel_name=video.get("channel_name"),
                thumbnail_url=video.get("thumbnail_url")
            )

        transcript = TranscriptService.fetch_transcript(request.youtube_url)
        if not transcript:
            raise HTTPException(status_code=404, detail="Transcript not found.")

        transcript_str = " ".join([entry["text"] for entry in transcript])[:12000]

        # Generate content with OpenAI
        summary_prompt = f"Summarize the following transcript in 2-3 sentences: {transcript_str}"
        takeaways_prompt = f"List 5 key takeaways from the following transcript: {transcript_str}"
        hashtags_prompt = f"Generate 5 relevant hashtags for the following transcript: {transcript_str}"
        thread_prompt = f"Write a 3-tweet Twitter thread summarizing the following transcript: {transcript_str}"

        summary_resp, takeaways_resp, hashtags_resp, thread_resp = await asyncio.gather(
            LLMService.generate_content(summary_prompt),
            LLMService.generate_content(takeaways_prompt),
            LLMService.generate_content(hashtags_prompt),
            LLMService.generate_content(thread_prompt),
        )

        summary = clean_section(summary_resp)
        key_takeaways = [clean_section(t) for t in re.split(r'^(?:\d+\.\s*|[-•*]\s*)', takeaways_resp, flags=re.MULTILINE) if clean_section(t)][:5]
        hashtags = [h for h in hashtags_resp.replace(',', ' ').split() if h.startswith('#')][:5]
        twitter_thread = [clean_section(t) for t in thread_resp.split('\n') if clean_section(t)][:3]

        # Store analysis and decrement credits
        analysis_insert = supabase.table("video_analysis").insert({
            "video_id": video_id,
            "user_id": user_id,
            "summary": summary,
            "key_takeaways": key_takeaways,
            "hashtags": hashtags,
            "twitter_thread": twitter_thread,
            "transcript": transcript
        }).execute()
        analysis = analysis_insert.data[0]

        # Decrement credits and get updated user info
        updated_user_resp = supabase.table('users').update({'credits_remaining': user['credits_remaining'] - 1}).eq('id', user_id).execute()
        updated_user = updated_user_resp.data[0]

        # Log usage
        supabase.table("user_usage").insert({
            "user_id": user_id,
            "analysis_id": analysis['id']
        }).execute()

        return AnalyzeResponse(
            **analysis,
            title=video.get("title"),
            channel_name=video.get("channel_name"),
            thumbnail_url=video.get("thumbnail_url"),
            credits_remaining=updated_user['credits_remaining']
        )

    except Exception as e:
        logger.error(f"Error in /analyze: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user_info")
async def get_user_info(clerk_user: dict = Depends(get_clerk_user)):
    try:
        user = await get_or_create_user(clerk_user)
        return {
            "tier": user["tier"],
            "credits_remaining": user["credits_remaining"]
        }
    except Exception as e:
        logger.error(f"Error in /user_info: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/feedback")
async def submit_feedback(request: FeedbackRequest, clerk_user: dict = Depends(get_clerk_user)):
    try:
        user = await get_or_create_user(clerk_user)
        supabase.table("analysis_feedback").insert({
            "analysis_id": request.analysis_id,
            "user_id": user["id"],
            "rating": request.rating,
            "comment": request.comment
        }).execute()
        return {"message": "Feedback submitted successfully"}
    except Exception as e:
        logger.error(f"Error in /feedback: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upgrade")
async def upgrade_user(clerk_user: dict = Depends(get_clerk_user)):
    try:
        user = await get_or_create_user(clerk_user)
        user_id = user["id"]

        # In a real app, you'd have a payment flow here.
        # For this example, we'll just upgrade the user directly.
        supabase.table("users").update({
            "tier": "pro",
            "credits_remaining": 1_000_000 # Effectively unlimited
        }).eq("id", user_id).execute()

        return {"message": "User upgraded to pro successfully"}
    except Exception as e:
        logger.error(f"Error in /upgrade: {e}")
        raise HTTPException(status_code=500, detail=str(e))