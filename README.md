# YouTube Video Analyzer

AI-powered web app to analyze YouTube videos and generate:
- A concise summary
- 5 key takeaways
- 5 relevant hashtags
- A 3-tweet Twitter thread

## Features
- Paste any YouTube URL to analyze
- Fetches transcript using `youtube-transcript-api`
- Sends transcript to a local LLM (Ollama, e.g., LLaMA3)
- Modular FastAPI backend
- Beautiful Next.js + Material UI frontend
- Modern, responsive UI
- Robust error handling

## Tech Stack
- **Backend:** Python, FastAPI, youtube-transcript-api, httpx
- **Frontend:** Next.js (React), TypeScript, Material UI
- **LLM:** Local Ollama (LLaMA3 or compatible)

## Setup

### Backend
1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload
   ```
3. Ensure Ollama is running locally (default: `http://localhost:11434`).

### Frontend
1. Go to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js dev server:
   ```bash
   npm run dev
   ```

## Usage
- Open the frontend in your browser (default: [http://localhost:3000](http://localhost:3000))
- Paste a YouTube video URL and click Analyze
- View the summary, takeaways, hashtags, and Twitter thread

## Project Structure
- `app/` - FastAPI backend (APIs, services, utils)
- `frontend/` - Next.js frontend (components, pages, styles)

## Future Enhancements
- Supabase integration for user auth and storage
- User accounts and history
- More LLM options
- Improved error messages and analytics

## License
MIT

---

**Repository:** [youtube-video-analyzer](https://github.com/bharadwaj-mahablesh/youtube-video-analyzer) 