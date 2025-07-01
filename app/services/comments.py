import yt_dlp
from app.utils.logger import logger

class CommentsService:
    @staticmethod
    def fetch_top_comments(youtube_url: str, num_comments: int = 5) -> list:
        ydl_opts = {
            'extract_flat': True,  # Only extract info, don't download
            'skip_download': True,
            'getcomments': True, # This option is crucial for comments
            'noplaylist': True, # Don't extract comments from playlists
            'max_comments': 5000, # Try to fetch up to 5000 comments
        }

        comments_data = []
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info_dict = ydl.extract_info(youtube_url, download=False)
                if 'comments' in info_dict:
                    # Sort comments by like_count in descending order
                    sorted_comments = sorted(info_dict['comments'], key=lambda x: x.get('like_count', 0), reverse=True)
                    # Take the top N comments
                    for comment in sorted_comments[:num_comments]:
                        comments_data.append({
                            "text": comment.get('text'),
                            "author": comment.get('author'),
                            "like_count": comment.get('like_count', 0),
                            "timestamp": comment.get('timestamp'),
                        })
                else:
                    logger.warning(f"No comments found for {youtube_url}")
        except Exception as e:
            logger.error(f"Error fetching comments for {youtube_url}: {e}")
        
        return comments_data