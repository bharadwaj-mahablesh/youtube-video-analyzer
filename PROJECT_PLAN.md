# YouTube Analyzer: Project Plan

## Overview
An AI-powered application that:
- Accepts a YouTube video URL
- Fetches the transcript using `youtube-transcript-api`
- Sends the transcript to OpenAI's API (e.g., GPT-3.5-turbo)
- Generates:
  - Video summary
  - 5 key takeaways
  - 5 relevant hashtags
  - 3-tweet Twitter thread
- Presents results in a beautiful web UI

---

## Tech Stack
- **Backend**: Python (FastAPI)
- **Frontend**: Next.js (React) with Material UI
- **LLM**: OpenAI API
- **Transcript**: `youtube-transcript-api` (Python)
- **Optional**: Supabase (for future data storage, analytics, or auth)

---

## File Structure

```
youtube-analyzer/
│
├── app/                       # Backend (FastAPI)
│   ├── __init__.py
│   ├── main.py
│   ├── api/
│   │   └── routes.py
│   ├── services/
│   │   ├── transcript.py
│   │   ├── llm.py
│   │   └── content.py
│   ├── schemas/
│   │   └── models.py
│   └── utils/
│       └── logger.py
│
├── frontend/                  # Frontend (Next.js + MUI)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── InputForm.tsx
│   │   │   ├── SummaryCard.tsx
│   │   │   ├── TakeawaysList.tsx
│   │   │   ├── Hashtags.tsx
│   │   │   └── TwitterThread.tsx
│   │   ├── pages/
│   │   │   └── index.tsx
│   │   ├── App.tsx
│   │   ├── api.ts
│   │   └── index.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── requirements.txt
├── README.md
└── .env.example
```

---

## Backend Modules
- **main.py**: FastAPI app setup
- **api/routes.py**: API endpoints (e.g., `/analyze`)
- **services/transcript.py**: Fetch YouTube transcript
- **services/llm.py**: Interact with OpenAI API
- **services/content.py**: Format LLM output
- **schemas/models.py**: Pydantic models
- **utils/logger.py**: Logging

## Frontend Modules
- **InputForm.tsx**: URL input
- **SummaryCard.tsx**: Video summary
- **TakeawaysList.tsx**: Key takeaways
- **Hashtags.tsx**: Hashtags (copyable)
- **TwitterThread.tsx**: Twitter thread (styled)
- **api.ts**: API helper
- **pages/index.tsx**: Main page

---

## API Design
- **POST /analyze**
  - **Request**: `{ "youtube_url": "..." }`
  - **Response**:
    ```json
    {
      "summary": "...",
      "key_takeaways": ["...", "...", "...", "...", "..."],
      "hashtags": ["...", "...", "...", "...", "..."],
      "twitter_thread": ["tweet 1", "tweet 2", "tweet 3"]
    }
    ```

---

## Future: Supabase Integration (Optional)
- Store analysis history, user data, or analytics
- Add authentication if needed
- Can be integrated after core features are complete

---

## Development Flow
1. **Backend**: Build and test API
2. **Frontend**: Scaffold Next.js app, connect to API, build UI
3. **(Optional)**: Integrate Supabase

---

## Notes
- Modular, production-ready code
- Ready for local development and debugging in Cursor
- Extensible for future features 