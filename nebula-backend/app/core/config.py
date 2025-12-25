import os
from dotenv import load_dotenv

# .env file load karo
load_dotenv()

class Settings:
    PROJECT_NAME: str = "Nebula Cloud Backend"
    VERSION: str = "1.0.0"
    
    # API Keys Load karna
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY")
    HF_TOKEN: str = os.getenv("HF_TOKEN")

    # Validation (Optional but good): Check karo keys hai ya nahi
    def validate_keys(self):
        if not self.GROQ_API_KEY:
            print("⚠️ WARNING: GROQ_API_KEY is missing!")
        if not self.HF_TOKEN:
            print("⚠️ WARNING: HF_TOKEN is missing!")

settings = Settings()
settings.validate_keys()