from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection
from app.api.routes import router as api_router

# 1. Lifespan define karte hain (Startup/Shutdown events)
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup ke waqt
    print("🚀 Starting up...")
    await connect_to_mongo()
    yield
    # Shutdown ke waqt
    print("🛑 Shutting down...")
    await close_mongo_connection()

# 2. App create karte waqt lifespan pass karte hain
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan  # <--- Ye line Bahot Zaroori hai!
)

# 3. CORS Middleware (Frontend connect karne ke liye)
origins = [
    "http://localhost:3000",           # Local Frontend
    "https://nebula-cloud-seven.vercel.app", # Vercel Frontend
    # Agar koi aur URL ho toh yahan add karein
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Abhi ke liye Sab Allow kar rahe hain (Safe for Hackathon)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Routes Jodna
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {"message": "Welcome to Nebula Cloud Backend 🚀"}
