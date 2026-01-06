import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

class Settings:
    PROJECT_NAME: str = "Nebula Cloud"
    VERSION: str = "1.0.0"  # <--- Ye line missing thi
    API_V1_STR: str = "/api/v1"
    
    # Database Config
    MONGO_URI: str = os.getenv("MONGO_URI")
    DB_NAME: str = os.getenv("DB_NAME", "nebula_db")

    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkey")

settings = Settings()