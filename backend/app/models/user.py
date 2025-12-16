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
    # Current total counts from LeetCode
    easy_count: int = Field(default=0, ge=0, description="Current total easy problems solved")
    medium_count: int = Field(default=0, ge=0, description="Current total medium problems solved")
    hard_count: int = Field(default=0, ge=0, description="Current total hard problems solved")
    # Baseline counts (captured when user was added)
    baseline_easy: int = Field(default=0, ge=0, description="Baseline easy problems at tracking start")
    baseline_medium: int = Field(default=0, ge=0, description="Baseline medium problems at tracking start")
    baseline_hard: int = Field(default=0, ge=0, description="Baseline hard problems at tracking start")
    score: int = Field(default=0, ge=0, description="Calculated score (delta from baseline)")
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
    
    def calculate_score(self) -> int:
        """Calculate score based on delta problem counts (current - baseline)."""
        delta_easy = max(0, self.easy_count - self.baseline_easy)
        delta_medium = max(0, self.medium_count - self.baseline_medium)
        delta_hard = max(0, self.hard_count - self.baseline_hard)
        return (delta_easy * 1) + (delta_medium * 2) + (delta_hard * 3)
    
    def update_score(self) -> None:
        """Update the score field."""
        self.score = self.calculate_score()

