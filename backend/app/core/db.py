"""
MongoDB database connection and utilities.
"""
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import Optional
from app.core.config import settings


class Database:
    """MongoDB database connection manager."""
    
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None
    
    async def connect(self) -> None:
        """Connect to MongoDB."""
        self.client = AsyncIOMotorClient(settings.MONGODB_URL)
        self.db = self.client[settings.MONGODB_DB_NAME]
        
        # Create indexes
        await self.db.users.create_index("leetcode_username", unique=True)
        await self.db.users.create_index("score", background=True)
        
        print(f"Connected to MongoDB: {settings.MONGODB_DB_NAME}")
    
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

