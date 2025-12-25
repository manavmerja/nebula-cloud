from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import router as api_router

# 1. App Initialize
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION
)

# 2. CORS Setup (Security Guard ko bolna: Frontend ko aane do)
# Production me allow_origins=["https://your-frontend-url.com"] karte hain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Abhi ke liye sabko allow kar rahe hain (Development)
    allow_credentials=True,
    allow_methods=["*"],  # GET, POST, PUT, DELETE sab allowed
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

# 3. Health Check Route
# Ye check karne ke liye ki server zinda hai ya nahi
@app.get("/")
def read_root():
    return {
        "status": "active",
        "project": settings.PROJECT_NAME,
        "mode": "Hard Mode Architecture 🚀"
    }

# Note: Asli AI Routes hum baad me 'app/api/routes.py' se connect karenge