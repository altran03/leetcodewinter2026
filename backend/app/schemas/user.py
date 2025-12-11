"""
Pydantic schemas for user-related API operations.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class UserCreate(BaseModel):
    """Schema for creating a new user."""
    
    username: str = Field(..., min_length=1, max_length=50, description="Display name")
    leetcode_username: str = Field(..., min_length=1, max_length=50, description="LeetCode username")


class UserUpdate(BaseModel):
    """Schema for updating user stats."""
    
    easy_count: Optional[int] = Field(None, ge=0)
    medium_count: Optional[int] = Field(None, ge=0)
    hard_count: Optional[int] = Field(None, ge=0)


class UserResponse(BaseModel):
    """Schema for user response."""
    
    id: str = Field(..., alias="_id")
    username: str
    leetcode_username: str
    easy_count: int
    medium_count: int
    hard_count: int
    score: int
    last_updated: datetime
    created_at: datetime
    
    class Config:
        populate_by_name = True


class LeaderboardEntry(BaseModel):
    """Schema for leaderboard entry."""
    
    rank: int
    id: str
    username: str
    leetcode_username: str
    easy_count: int
    medium_count: int
    hard_count: int
    score: int
    last_updated: datetime


class LeaderboardResponse(BaseModel):
    """Schema for leaderboard response."""
    
    total_users: int
    last_global_update: Optional[datetime] = None
    entries: list[LeaderboardEntry]


class UpdateResult(BaseModel):
    """Schema for update operation result."""
    
    success: bool
    updated_count: int
    failed_count: int
    errors: list[str] = []


class MessageResponse(BaseModel):
    """Generic message response."""
    
    message: str
    success: bool = True

