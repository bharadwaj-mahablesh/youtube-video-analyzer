import yt_dlp
from ..utils.logger import logger
import re
from datetime import datetime

def fetch_video_metadata(url: str) -> dict:
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        'extract_flat': True, # Only extract info, don't download
    }
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(url, download=False)
            # Extract relevant fields
            title = info_dict.get('title')
            channel_name = info_dict.get('uploader')
            channel_url = info_dict.get('uploader_url')
            thumbnail_url = info_dict.get('thumbnail')
            duration_seconds = info_dict.get('duration')
            published_date_str = info_dict.get('upload_date') # YYYYMMDD format
            published_date = None
            if published_date_str:
                try:
                    published_date = datetime.strptime(published_date_str, '%Y%m%d')
                except ValueError:
                    pass # Keep published_date as None if parsing fails

            return {
                "title": title,
                "channel_name": channel_name,
                "channel_url": channel_url,
                "thumbnail_url": thumbnail_url,
                "duration_seconds": duration_seconds,
                "published_date": published_date,
            }
    except Exception as e:
        logger.error(f"Error fetching video metadata for {url} using yt-dlp: {e}")
        # Fallback: Try to extract video ID and provide basic info
        video_id_match = re.search(r"(?:v=|youtu\.be/)([\w-]+)", url)
        video_id = video_id_match.group(1) if video_id_match else "unknown"
        fallback_metadata = {
            "title": f"YouTube Video (ID: {video_id})",
            "channel_name": "Unknown Channel",
            "channel_url": None,
            "thumbnail_url": f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg",
            "duration_seconds": None,
            "published_date": None,
        }
        logger.warning(f"Returning fallback metadata for {url}: {fallback_metadata}")
        return fallback_metadata
