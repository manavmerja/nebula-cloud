from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    # Project Info
    PROJECT_NAME: str = "Nebula Cloud"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # API Keys (Environment se aayenge)
    GROQ_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    HF_TOKEN: Optional[str] = None
    
    # Database Settings
    MONGO_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "nebula_db"  
    
    # CORS (Frontend Connection)
    BACKEND_CORS_ORIGINS: List[str] = ["*"]

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()