import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load Environment Variables
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

class Database:
    client: AsyncIOMotorClient = None

db = Database()

async def connect_to_mongo():
    """App start hone par Database connect karega"""
    try:
        db.client = AsyncIOMotorClient(MONGO_URI)
        # Connection check karne ke liye ping karein
        await db.client.admin.command('ping')
        print("✅ Successfully connected to MongoDB Atlas!")
    except Exception as e:
        print(f"❌ Could not connect to MongoDB: {e}")

async def close_mongo_connection():
    """App band hone par connection close karega"""
    if db.client:
        db.client.close()
        print("🛑 MongoDB connection closed.")

def get_database():
    """Database object return karega"""
    return db.client[DB_NAME]