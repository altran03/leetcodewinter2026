"""
User and leaderboard API endpoints.
"""
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header, status
from bson import ObjectId

from app.core.db import database
from app.core.config import settings
from app.schemas.user import (
    UserCreate,
    UserResponse,
    LeaderboardEntry,
    LeaderboardResponse,
    MessageResponse,
)
from app.services.score_calculator import calculate_score

router = APIRouter()


def verify_admin_token(x_admin_token: Optional[str] = Header(None)) -> bool:
    """Verify admin token from header."""
    if not x_admin_token or x_admin_token != settings.ADMIN_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing admin token",
        )
    return True


@router.get("/leaderboard", response_model=LeaderboardResponse)
async def get_leaderboard(limit: int = 100, offset: int = 0):
    """
    Get the public leaderboard sorted by score (highest first).
    """
    users_collection = database.get_collection("users")
    
    # Count total users
    total_users = await users_collection.count_documents({})
    
    # Fetch users sorted by score descending
    cursor = users_collection.find({}).sort("score", -1).skip(offset).limit(limit)
    users = await cursor.to_list(length=limit)
    
    # Build leaderboard entries with ranks
    entries = []
    for idx, user in enumerate(users):
        entries.append(
            LeaderboardEntry(
                rank=offset + idx + 1,
                id=str(user["_id"]),
                username=user["username"],
                leetcode_username=user["leetcode_username"],
                easy_count=user.get("easy_count", 0),
                medium_count=user.get("medium_count", 0),
                hard_count=user.get("hard_count", 0),
                score=user.get("score", 0),
                last_updated=user.get("last_updated", datetime.utcnow()),
            )
        )
    
    # Get last global update time (most recent user update)
    latest_user = await users_collection.find_one(
        {}, sort=[("last_updated", -1)]
    )
    last_global_update = latest_user.get("last_updated") if latest_user else None
    
    return LeaderboardResponse(
        total_users=total_users,
        last_global_update=last_global_update,
        entries=entries,
    )


@router.get("/user/{user_id}", response_model=UserResponse)
async def get_user(user_id: str):
    """Get a specific user by ID."""
    users_collection = database.get_collection("users")
    
    if not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format",
        )
    
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    user["_id"] = str(user["_id"])
    return UserResponse(**user)


@router.post("/admin/user/add", response_model=UserResponse)
async def add_user(user_data: UserCreate, _: bool = Depends(verify_admin_token)):
    """
    Add a new user to the leaderboard.
    Requires admin token in X-Admin-Token header.
    """
    users_collection = database.get_collection("users")
    
    # Check if LeetCode username already exists
    existing = await users_collection.find_one(
        {"leetcode_username": user_data.leetcode_username}
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with LeetCode username '{user_data.leetcode_username}' already exists",
        )
    
    # Create new user document
    now = datetime.utcnow()
    new_user = {
        "username": user_data.username,
        "leetcode_username": user_data.leetcode_username,
        "easy_count": 0,
        "medium_count": 0,
        "hard_count": 0,
        "score": 0,
        "last_updated": now,
        "created_at": now,
    }
    
    result = await users_collection.insert_one(new_user)
    new_user["_id"] = str(result.inserted_id)
    
    return UserResponse(**new_user)


@router.delete("/admin/user/{user_id}", response_model=MessageResponse)
async def remove_user(user_id: str, _: bool = Depends(verify_admin_token)):
    """
    Remove a user from the leaderboard.
    Requires admin token in X-Admin-Token header.
    """
    users_collection = database.get_collection("users")
    
    if not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format",
        )
    
    result = await users_collection.delete_one({"_id": ObjectId(user_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    return MessageResponse(message="User removed successfully", success=True)

