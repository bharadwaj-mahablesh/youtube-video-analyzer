from pydantic import BaseModel
from typing import List

class AnalyzeRequest(BaseModel):
    youtube_url: str

class AnalyzeResponse(BaseModel):
    summary: str
    key_takeaways: List[str]
    hashtags: List[str]
    twitter_thread: List[str] 