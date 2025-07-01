from youtube_transcript_api._api import YouTubeTranscriptApi
from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound

class TranscriptService:
    @staticmethod
    def fetch_transcript(youtube_url: str) -> list:
        # Extract video ID from URL
        import re
        match = re.search(r"(?:v=|youtu.be/)([\w-]{11})", youtube_url)
        if not match:
            raise ValueError("Invalid YouTube URL")
        video_id = match.group(1)
        try:
            transcript = YouTubeTranscriptApi.get_transcript(video_id)
            return [
                {"start": entry["start"], "text": entry["text"]}
                for entry in transcript
            ]
        except (TranscriptsDisabled, NoTranscriptFound):
            raise RuntimeError("Transcript not available for this video.")
        except Exception as e:
            raise RuntimeError(f"Error fetching transcript: {e}") 