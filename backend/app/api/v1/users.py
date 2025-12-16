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
from app.services.score_calculator import calculate_score, calculate_score_with_baseline
from app.services.leetcode_scraper import leetcode_scraper

router = APIRouter()


def verify_admin_token(x_admin_token: Optional[str] = Header(None)) -> bool:
    """Verify admin token from header."""
    if not x_admin_token or x_admin_token != settings.ADMIN_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing admin token",
        )
    return True


@router.post("/admin/verify", response_model=MessageResponse)
async def verify_admin_access(x_admin_token: Optional[str] = Header(None)):
    """
    Verify if the provided admin token is valid.
    Returns success if token is valid, 401 if not.
    """
    if not x_admin_token or x_admin_token != settings.ADMIN_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin token",
        )
    return MessageResponse(message="Token verified", success=True)


@router.get("/leaderboard", response_model=LeaderboardResponse)
async def get_leaderboard(limit: int = 100, offset: int = 0):
    """
    Get the public leaderboard sorted by score (highest first).
    Shows delta counts (problems solved since tracking started).
    """
    users_collection = database.get_collection("users")
    
    # Count total users
    total_users = await users_collection.count_documents({})
    
    # Fetch users sorted by score descending
    cursor = users_collection.find({}).sort("score", -1).skip(offset).limit(limit)
    users = await cursor.to_list(length=limit)
    
    # Build leaderboard entries with ranks and delta counts
    entries = []
    for idx, user in enumerate(users):
        # Calculate delta counts (current - baseline)
        current_easy = user.get("easy_count", 0)
        current_medium = user.get("medium_count", 0)
        current_hard = user.get("hard_count", 0)
        baseline_easy = user.get("baseline_easy", 0)
        baseline_medium = user.get("baseline_medium", 0)
        baseline_hard = user.get("baseline_hard", 0)
        
        delta_easy = max(0, current_easy - baseline_easy)
        delta_medium = max(0, current_medium - baseline_medium)
        delta_hard = max(0, current_hard - baseline_hard)
        
        entries.append(
            LeaderboardEntry(
                rank=offset + idx + 1,
                id=str(user["_id"]),
                username=user["username"],
                leetcode_username=user["leetcode_username"],
                easy_count=delta_easy,  # Show delta, not total
                medium_count=delta_medium,
                hard_count=delta_hard,
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
    """Get a specific user by ID. Returns delta counts (problems solved since tracking started)."""
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
    
    # Calculate delta counts
    current_easy = user.get("easy_count", 0)
    current_medium = user.get("medium_count", 0)
    current_hard = user.get("hard_count", 0)
    baseline_easy = user.get("baseline_easy", 0)
    baseline_medium = user.get("baseline_medium", 0)
    baseline_hard = user.get("baseline_hard", 0)
    
    user["_id"] = str(user["_id"])
    # Return delta counts instead of total
    user["easy_count"] = max(0, current_easy - baseline_easy)
    user["medium_count"] = max(0, current_medium - baseline_medium)
    user["hard_count"] = max(0, current_hard - baseline_hard)
    
    return UserResponse(**user)


@router.post("/admin/user/add", response_model=UserResponse)
async def add_user(user_data: UserCreate, _: bool = Depends(verify_admin_token)):
    """
    Add a new user to the leaderboard.
    Fetches current LeetCode stats to set as baseline.
    Problems solved AFTER this point will count toward the score.
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
    
    # Fetch current stats from LeetCode to use as baseline
    stats = await leetcode_scraper.get_user_stats(user_data.leetcode_username)
    
    if not stats:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not fetch LeetCode stats for '{user_data.leetcode_username}'. Please check the username.",
        )
    
    # Create new user document with baseline = current stats
    # This means they start with 0 points and gain points for new problems
    now = datetime.utcnow()
    new_user = {
        "username": user_data.username,
        "leetcode_username": user_data.leetcode_username,
        # Current counts (same as baseline at start)
        "easy_count": stats.easy_count,
        "medium_count": stats.medium_count,
        "hard_count": stats.hard_count,
        # Baseline counts (locked at tracking start)
        "baseline_easy": stats.easy_count,
        "baseline_medium": stats.medium_count,
        "baseline_hard": stats.hard_count,
        # Score starts at 0 since delta is 0
        "score": 0,
        "last_updated": now,
        "created_at": now,
    }
    
    result = await users_collection.insert_one(new_user)
    new_user["_id"] = str(result.inserted_id)
    
    # Return delta counts (which are 0 at start)
    new_user["easy_count"] = 0
    new_user["medium_count"] = 0
    new_user["hard_count"] = 0
    
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


@router.post("/admin/user/{user_id}/reset_baseline", response_model=MessageResponse)
async def reset_user_baseline(user_id: str, _: bool = Depends(verify_admin_token)):
    """
    Reset a user's baseline to their current stats.
    This will reset their score to 0 and start fresh tracking.
    Requires admin token in X-Admin-Token header.
    """
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
    
    # Fetch fresh stats from LeetCode
    stats = await leetcode_scraper.get_user_stats(user["leetcode_username"])
    
    if not stats:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not fetch LeetCode stats",
        )
    
    # Update baseline to current stats, reset score to 0
    now = datetime.utcnow()
    await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                "easy_count": stats.easy_count,
                "medium_count": stats.medium_count,
                "hard_count": stats.hard_count,
                "baseline_easy": stats.easy_count,
                "baseline_medium": stats.medium_count,
                "baseline_hard": stats.hard_count,
                "score": 0,
                "last_updated": now,
            }
        },
    )
    
    return MessageResponse(message="Baseline reset successfully. Score is now 0.", success=True)


@router.post("/admin/reset_all_baselines", response_model=MessageResponse)
async def reset_all_baselines(_: bool = Depends(verify_admin_token)):
    """
    Reset baselines for ALL users to their current stats.
    This will reset everyone's score to 0 and start fresh tracking.
    Requires admin token in X-Admin-Token header.
    """
    users_collection = database.get_collection("users")
    
    # Get all users
    cursor = users_collection.find({})
    users = await cursor.to_list(length=1000)
    
    if not users:
        return MessageResponse(message="No users to reset", success=True)
    
    # Get LeetCode usernames and fetch stats
    leetcode_usernames = [user["leetcode_username"] for user in users]
    stats_map = await leetcode_scraper.get_multiple_users_stats(leetcode_usernames)
    
    updated_count = 0
    now = datetime.utcnow()
    
    for user in users:
        leetcode_username = user["leetcode_username"]
        stats = stats_map.get(leetcode_username)
        
        if stats:
            await users_collection.update_one(
                {"_id": user["_id"]},
                {
                    "$set": {
                        "easy_count": stats.easy_count,
                        "medium_count": stats.medium_count,
                        "hard_count": stats.hard_count,
                        "baseline_easy": stats.easy_count,
                        "baseline_medium": stats.medium_count,
                        "baseline_hard": stats.hard_count,
                        "score": 0,
                        "last_updated": now,
                    }
                },
            )
            updated_count += 1
    
    return MessageResponse(
        message=f"Reset baselines for {updated_count} users. All scores are now 0.",
        success=True
    )

