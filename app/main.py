import os
from dotenv import load_dotenv
# Explicitly load .env from project root
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '.env'))
from fastapi import FastAPI
from app.api.routes import router as api_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(root_path="/api")

app.include_router(api_router)

@app.get("/health")
def health_check():
    return {"status": "ok"} 

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("FRONTEND_URL", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)