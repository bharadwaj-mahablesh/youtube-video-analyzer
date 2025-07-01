from pydantic import BaseModel, Field
from typing import List, Optional
import uuid

class AnalyzeRequest(BaseModel):
    youtube_url: str

class TranscriptLine(BaseModel):
    start: float
    text: str

class AnalyzeResponse(BaseModel):
    id: uuid.UUID
    summary: str
    key_takeaways: List[str]
    hashtags: List[str]
    twitter_thread: List[str]
    transcript: List[TranscriptLine]
    # Optional video metadata fields
    title: Optional[str] = None
    channel_name: Optional[str] = None
    thumbnail_url: Optional[str] = None
    credits_remaining: Optional[int] = None # Added for credit tracking

class FeedbackRequest(BaseModel):
    analysis_id: uuid.UUID
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None