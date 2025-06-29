from typing import Tuple, List
import re

class ContentService:
    @staticmethod
    def build_prompt(transcript: str) -> str:
        return (
            "Given the following YouTube video transcript, generate the following sections in plain text. "
            "Use these exact section headers, in this order, and nothing else:\n"
            "Short Summary:\n"
            "Detailed Takeaways:\n"
            "Hashtags:\n"
            "Twitter Thread:\n"
            "- Short Summary: 2-3 sentences summarizing the video.\n"
            "- Detailed Takeaways: For each main topic or section, provide a bolded section header and a detailed paragraph.\n"
            "- Hashtags: List exactly 5 relevant hashtags.\n"
            "- Twitter Thread: Write exactly 3 tweets, each on a new line, as if for Twitter.\n"
            f"Transcript: {transcript}"
        )

    @staticmethod
    def parse_llm_response(response: str) -> Tuple[str, List[str], List[str], List[str]]:
        import json
        # Try JSON first
        try:
            data = json.loads(response)
            return (
                data.get("short_summary", ""),
                data.get("detailed_takeaways", []),
                data.get("hashtags", []),
                data.get("twitter_thread", [])
            )
        except Exception:
            # Fallback: robust plain text/markdown parsing
            short_summary = ""
            detailed_takeaways = []
            hashtags = []
            twitter_thread = []

            # Try to extract by requested headers first
            summary_match = re.search(r"(?i)short summary[:\-\n]*([\s\S]*?)(?:detailed takeaways|hashtags|twitter thread|$)", response)
            if summary_match:
                short_summary = summary_match.group(1).strip()
            takeaways_match = re.search(r"(?i)detailed takeaways[:\-\n]*([\s\S]*?)(?:hashtags|twitter thread|$)", response)
            if takeaways_match:
                section_pattern = re.compile(r"(?:\*\*|__|^)([A-Z][^\n\r:]*)(?:\*\*|__|:)?[\n\r]+([\s\S]*?)(?=(?:\*\*|__|^)[A-Z]|$)", re.MULTILINE)
                for match in section_pattern.finditer(takeaways_match.group(1)):
                    header = match.group(1).strip()
                    content = match.group(2).strip()
                    if header and content:
                        detailed_takeaways.append(f"{header}: {content}")
                if not detailed_takeaways:
                    detailed_takeaways = [t.strip('-*• \n') for t in takeaways_match.group(1).split('\n') if t.strip()]
            # If not found, fallback to generic section extraction
            if not short_summary or not detailed_takeaways:
                # Split into blocks by double newlines or section headers
                blocks = re.split(r"\n\s*\n|(?=\*\*)", response)
                blocks = [b.strip() for b in blocks if b.strip()]
                if blocks:
                    # Use the first block as summary
                    short_summary = blocks[0]
                    # Use subsequent blocks as detailed takeaways
                    for block in blocks[1:]:
                        # If block starts with a bolded header, extract header and content
                        m = re.match(r"\*\*([^*]+)\*\*\s*(.*)", block, re.DOTALL)
                        if m:
                            header = m.group(1).strip()
                            content = m.group(2).strip()
                            if header and content:
                                detailed_takeaways.append(f"{header}: {content}")
                        else:
                            detailed_takeaways.append(block)
            # Extract hashtags
            hashtags_match = re.search(r"(?i)hashtags[:\-\n]*([\s\S]*?)(?:twitter thread|$)", response)
            if hashtags_match:
                hashtags = re.findall(r"#\w+", hashtags_match.group(1))
                if not hashtags:
                    hashtags = [h.strip('-*• \n') for h in hashtags_match.group(1).split('\n') if h.strip()]
                hashtags = [h for h in hashtags if h][:5]
            # Extract twitter thread
            thread_match = re.search(r"(?i)twitter thread[:\-\n]*([\s\S]*)", response)
            if thread_match:
                twitter_thread = [t.strip('-*• \n') for t in thread_match.group(1).split('\n') if t.strip()]
                twitter_thread = [t for t in twitter_thread if t][:3]
            # If nothing was extracted, show the whole response as summary
            if not short_summary and not detailed_takeaways and not hashtags and not twitter_thread:
                short_summary = response.strip()
            return (short_summary, detailed_takeaways, hashtags, twitter_thread) 