"""
Update endpoints for refreshing LeetCode stats.
"""
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Header, HTTPException, status, BackgroundTasks

from app.core.db import database
from app.core.config import settings
from app.schemas.user import UpdateResult, MessageResponse
from app.services.leetcode_scraper import leetcode_scraper
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


async def update_all_users_task() -> UpdateResult:
    """
    Background task to update all users' LeetCode stats.
    """
    users_collection = database.get_collection("users")
    
    # Get all users
    cursor = users_collection.find({})
    users = await cursor.to_list(length=1000)
    
    updated_count = 0
    failed_count = 0
    errors = []
    
    # Get LeetCode usernames
    leetcode_usernames = [user["leetcode_username"] for user in users]
    
    # Fetch stats with rate limiting
    stats_map = await leetcode_scraper.get_multiple_users_stats(leetcode_usernames)
    
    # Update each user
    for user in users:
        leetcode_username = user["leetcode_username"]
        stats = stats_map.get(leetcode_username)
        
        if stats:
            score = calculate_score(
                stats.easy_count,
                stats.medium_count,
                stats.hard_count,
            )
            
            await users_collection.update_one(
                {"_id": user["_id"]},
                {
                    "$set": {
                        "easy_count": stats.easy_count,
                        "medium_count": stats.medium_count,
                        "hard_count": stats.hard_count,
                        "score": score,
                        "last_updated": datetime.utcnow(),
                    }
                },
            )
            updated_count += 1
        else:
            failed_count += 1
            errors.append(f"Failed to fetch stats for {leetcode_username}")
    
    return UpdateResult(
        success=failed_count == 0,
        updated_count=updated_count,
        failed_count=failed_count,
        errors=errors,
    )


async def update_single_user_task(user_id: str) -> bool:
    """Update a single user's stats."""
    from bson import ObjectId
    
    users_collection = database.get_collection("users")
    
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        return False
    
    stats = await leetcode_scraper.get_user_stats(user["leetcode_username"])
    
    if stats:
        score = calculate_score(
            stats.easy_count,
            stats.medium_count,
            stats.hard_count,
        )
        
        await users_collection.update_one(
            {"_id": user["_id"]},
            {
                "$set": {
                    "easy_count": stats.easy_count,
                    "medium_count": stats.medium_count,
                    "hard_count": stats.hard_count,
                    "score": score,
                    "last_updated": datetime.utcnow(),
                }
            },
        )
        return True
    
    return False


@router.post("/update_all", response_model=UpdateResult)
async def update_all_users(_: bool = Depends(verify_admin_token)):
    """
    Manually trigger an update of all users' LeetCode stats.
    This is a synchronous operation that waits for all updates to complete.
    Requires admin token in X-Admin-Token header.
    """
    result = await update_all_users_task()
    return result


@router.post("/update_all/async", response_model=MessageResponse)
async def update_all_users_async(
    background_tasks: BackgroundTasks,
    _: bool = Depends(verify_admin_token),
):
    """
    Trigger an asynchronous background update of all users' stats.
    Returns immediately while the update runs in the background.
    Requires admin token in X-Admin-Token header.
    """
    background_tasks.add_task(update_all_users_task)
    return MessageResponse(
        message="Update started in background",
        success=True,
    )


@router.post("/update_user/{user_id}", response_model=MessageResponse)
async def update_single_user(user_id: str, _: bool = Depends(verify_admin_token)):
    """
    Update a single user's LeetCode stats.
    Requires admin token in X-Admin-Token header.
    """
    from bson import ObjectId
    
    if not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format",
        )
    
    success = await update_single_user_task(user_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found or failed to fetch stats",
        )
    
    return MessageResponse(
        message="User stats updated successfully",
        success=True,
    )

