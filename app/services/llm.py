import os
import openai
from typing import Optional

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")

class LLMService:
    @staticmethod
    async def generate_content(prompt: str) -> str:
        if not OPENAI_API_KEY:
            raise RuntimeError("OPENAI_API_KEY not set in environment.")
        client = openai.AsyncOpenAI(api_key=OPENAI_API_KEY)
        response = await client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1024,
            temperature=0.7,
        )
        content = getattr(response.choices[0].message, "content", None)
        if not content:
            raise RuntimeError("No content returned from OpenAI API.")
        return content.strip() 