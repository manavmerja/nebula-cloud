from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings 

class Database:
    client: AsyncIOMotorClient = None

db = Database()

async def connect_to_mongo():
    """App start hone par Database connect karega"""
    try:
        db.client = AsyncIOMotorClient(settings.MONGO_URI)
        await db.client.admin.command('ping')
        print("✅ Successfully connected to MongoDB Atlas!")
    except Exception as e:
        print(f"❌ Could not connect to MongoDB: {e}")

async def close_mongo_connection():
    if db.client:
        db.client.close()
        print("🛑 MongoDB connection closed.")

def get_database():
    return db.client[settings.DATABASE_NAME]