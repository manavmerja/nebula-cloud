from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection
from app.api.routes import router as api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Starting up...")
    await connect_to_mongo()
    yield
    print("🛑 Shutting down...")
    await close_mongo_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan  
)

# 3. CORS Middleware
origins = [
    "http://localhost:3000",          
    "https://nebula-cloud-seven.vercel.app", 
    "https://nebula-cloud-git-main-manavmerjas-projects.vercel.app",
    "https://nebula-cloud-o9z9c0jlb-manavmerjas-projects.vercel.app"

]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {"message": "Welcome to Nebula Cloud Backend 🚀"}

