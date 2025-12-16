"""
MongoDB database connection and utilities.
"""
import sys
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import Optional
from app.core.config import settings


class Database:
    """MongoDB database connection manager."""
    
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None
    
    async def connect(self) -> None:
        """Connect to MongoDB."""
        try:
            print(f"🔗 Connecting to MongoDB...")
            print(f"   Database: {settings.MONGODB_DB_NAME}")
            
            # Check if using default localhost (likely misconfigured for production)
            if "localhost" in settings.MONGODB_URL and not settings.DEBUG:
                print("⚠️  WARNING: Using localhost MongoDB URL in production!")
                print("   Set MONGODB_URL environment variable to your MongoDB Atlas connection string")
            
            self.client = AsyncIOMotorClient(
                settings.MONGODB_URL,
                serverSelectionTimeoutMS=10000,  # 10 second timeout
            )
            
            # Test the connection
            await self.client.admin.command('ping')
            
            self.db = self.client[settings.MONGODB_DB_NAME]
            
            # Create indexes
            await self.db.users.create_index("leetcode_username", unique=True)
            await self.db.users.create_index("score", background=True)
            
            print(f"✅ Connected to MongoDB: {settings.MONGODB_DB_NAME}")
            
        except Exception as e:
            print(f"❌ Failed to connect to MongoDB: {e}")
            print(f"   MONGODB_URL starts with: {settings.MONGODB_URL[:30]}...")
            print(f"   Make sure you've set the MONGODB_URL environment variable correctly!")
            raise
    
    async def disconnect(self) -> None:
        """Disconnect from MongoDB."""
        if self.client:
            self.client.close()
            print("Disconnected from MongoDB")
    
    def get_collection(self, name: str):
        """Get a collection by name."""
        if self.db is None:
            raise RuntimeError("Database not connected")
        return self.db[name]


# Global database instance
database = Database()


async def get_database() -> AsyncIOMotorDatabase:
    """Dependency to get database instance."""
    if database.db is None:
        raise RuntimeError("Database not connected")
    return database.db

