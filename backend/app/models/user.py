"""
User model for MongoDB.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from bson import ObjectId


class PyObjectId(str):
    """Custom ObjectId type for Pydantic."""
    
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    
    @classmethod
    def validate(cls, v, handler=None):
        if isinstance(v, ObjectId):
            return str(v)
        if isinstance(v, str) and ObjectId.is_valid(v):
            return v
        raise ValueError("Invalid ObjectId")


class UserModel(BaseModel):
    """User model representing a LeetCode user in the leaderboard."""
    
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    username: str = Field(..., description="Display name")
    leetcode_username: str = Field(..., description="LeetCode username")
    easy_count: int = Field(default=0, ge=0, description="Easy problems solved")
    medium_count: int = Field(default=0, ge=0, description="Medium problems solved")
    hard_count: int = Field(default=0, ge=0, description="Hard problems solved")
    score: int = Field(default=0, ge=0, description="Calculated score")
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
    
    def calculate_score(self) -> int:
        """Calculate score based on problem counts."""
        return (self.easy_count * 1) + (self.medium_count * 2) + (self.hard_count * 3)
    
    def update_score(self) -> None:
        """Update the score field."""
        self.score = self.calculate_score()

