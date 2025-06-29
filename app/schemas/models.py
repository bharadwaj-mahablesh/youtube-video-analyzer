from pydantic import BaseModel
from typing import List, Optional

class AnalyzeRequest(BaseModel):
    youtube_url: str
    provider: str = "ollama"  # 'ollama' or 'openai'
    openai_api_key: Optional[str] = None

class AnalyzeResponse(BaseModel):
    summary: str
    key_takeaways: List[str]
    hashtags: List[str]
    twitter_thread: List[str] 