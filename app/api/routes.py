from fastapi import APIRouter, HTTPException
from app.schemas.models import AnalyzeRequest, AnalyzeResponse
from app.services.transcript import TranscriptService
from app.services.llm import LLMService
from app.utils.logger import logger
import asyncio
import re

router = APIRouter()

async def get_llm_response(prompt: str) -> str:
    try:
        return await LLMService.generate_content(prompt)
    except Exception as e:
        logger.error(f"LLM error: {e}")
        return ""

def clean_section(text: str) -> str:
    # Remove leading meta-phrases like 'Here is ...', 'Summary:', etc.
    text = re.sub(r"^(here (is|are)\b[^:]*:|summary:|tweet:?|key takeaway:?|takeaway:?|hashtags?:?)", "", text, flags=re.IGNORECASE).strip()
    # Remove enclosing quotes or whitespace
    return text.strip('"\' \n')

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_video(request: AnalyzeRequest):
    try:
        transcript = TranscriptService.fetch_transcript(request.youtube_url)
        if not transcript:
            raise HTTPException(status_code=404, detail="Transcript not found.")

        provider = getattr(request, 'provider', 'ollama')
        openai_api_key = getattr(request, 'openai_api_key', None)

        # Truncate transcript for OpenAI to avoid context length errors
        max_chars = 12000 if provider == 'openai' else None
        transcript_to_use = transcript[:max_chars] if max_chars else transcript

        # Prompts for each section (direct, no meta-phrases)
        summary_prompt = (
            "Summarize the following YouTube video transcript in 2-3 sentences. Do not preface with any phrase, just give the summary.\n"
            f"Transcript: {transcript_to_use}"
        )
        takeaways_prompt = (
            "List 5 detailed key takeaways from the following YouTube video transcript. Do not preface with any phrase, just list them as bullet points.\n"
            f"Transcript: {transcript_to_use}"
        )
        hashtags_prompt = (
            "Generate 5 relevant hashtags for the following YouTube video transcript. Only output the hashtags separated by spaces.\n"
            f"Transcript: {transcript_to_use}"
        )
        thread_prompt = (
            "Write a 3-tweet Twitter thread summarizing the following YouTube video transcript. Only output the tweets, one per line, no preface.\n"
            f"Transcript: {transcript_to_use}"
        )

        # Run LLM calls concurrently
        summary_resp, takeaways_resp, hashtags_resp, thread_resp = await asyncio.gather(
            LLMService.generate_content(summary_prompt, provider, openai_api_key),
            LLMService.generate_content(takeaways_prompt, provider, openai_api_key),
            LLMService.generate_content(hashtags_prompt, provider, openai_api_key),
            LLMService.generate_content(thread_prompt, provider, openai_api_key),
        )

        # Parse and clean responses
        summary = clean_section(summary_resp)
        key_takeaways = [clean_section(t) for t in re.split(r'\n|\r|\d+\.\s*|•|-|\*', takeaways_resp) if clean_section(t)]
        key_takeaways = key_takeaways[:5]
        hashtags = [h for h in hashtags_resp.replace(',', ' ').split() if h.startswith('#')][:5]
        twitter_thread = [clean_section(t) for t in thread_resp.split('\n') if clean_section(t)]
        twitter_thread = twitter_thread[:3]

        return AnalyzeResponse(
            summary=summary,
            key_takeaways=key_takeaways,
            hashtags=hashtags,
            twitter_thread=twitter_thread
        )
    except HTTPException as e:
        logger.error(f"HTTP error: {e.detail}")
        raise
    except Exception as e:
        logger.error(f"Error in /analyze: {e}")
        raise HTTPException(status_code=500, detail=str(e)) 