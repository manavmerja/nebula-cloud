from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Nebula Cloud"
    API_V1_STR: str = "/api/v1"
    
    # 🚨 YE DO LINES MISSING THI, INHE ADD KARO:
    GROQ_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    HF_TOKEN: Optional[str] = None
    
    # MongoDB settings
    MONGO_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "nebula_db"
    
    # CORS settings (Jo humne pehle fix kiya tha)
    BACKEND_CORS_ORIGINS: List[str] = ["*"]

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()