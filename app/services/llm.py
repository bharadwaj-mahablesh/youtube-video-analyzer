import httpx
import os
import openai

OLLAMA_API_URL = os.getenv("OLLAMA_API_URL", "http://localhost:11434/api/generate")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")

class LLMService:
    @staticmethod
    async def generate_content(prompt: str, provider: str = "ollama", openai_api_key: str = None) -> str:
        if provider == "openai":
            api_key = openai_api_key or OPENAI_API_KEY
            if not api_key:
                raise RuntimeError("OPENAI_API_KEY not set in environment.")
            client = openai.AsyncOpenAI(api_key=api_key)
            response = await client.chat.completions.create(
                model=OPENAI_MODEL,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1024,
                temperature=0.7,
            )
            return response.choices[0].message.content.strip()
        else:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    OLLAMA_API_URL,
                    json={
                        "model": OLLAMA_MODEL,
                        "prompt": prompt,
                        "stream": False
                    },
                    timeout=120
                )
                response.raise_for_status()
                data = response.json()
                return data.get("response", "") 