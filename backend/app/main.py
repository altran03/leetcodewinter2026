"""
Main FastAPI application entry point.
"""
import os
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from app.core.config import settings
from app.core.db import database
from app.api.v1 import users, update
from app.api.v1.update import update_all_users_task

# Global scheduler instance
scheduler = AsyncIOScheduler()


async def scheduled_update_job():
    """Scheduled job to update all users' LeetCode stats."""
    print("🔄 [Scheduler] Starting hourly LeetCode stats update...")
    try:
        result = await update_all_users_task()
        print(f"✅ [Scheduler] Update complete: {result.updated_count} updated, {result.failed_count} failed")
        if result.errors:
            print(f"⚠️  [Scheduler] Errors: {result.errors}")
    except Exception as e:
        print(f"❌ [Scheduler] Update failed: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup logging
    print("=" * 50)
    print("🚀 Starting LeetCode Leaderboard API")
    print("=" * 50)
    print(f"   Environment: {'Production' if not settings.DEBUG else 'Development'}")
    print(f"   Port: {os.environ.get('PORT', '8000')}")
    print(f"   CORS Origins: {settings.CORS_ORIGINS}")
    print("=" * 50)
    
    # Connect to database
    try:
        await database.connect()
    except Exception as e:
        print(f"❌ FATAL: Could not connect to database!")
        print(f"   Error: {e}")
        print(f"   Please check your MONGODB_URL environment variable")
        sys.exit(1)
    
    # Start the scheduler
    scheduler.add_job(
        scheduled_update_job,
        trigger=IntervalTrigger(hours=settings.REFRESH_INTERVAL_HOURS),
        id="leetcode_stats_update",
        name=f"Update LeetCode stats every {settings.REFRESH_INTERVAL_HOURS} hour(s)",
        replace_existing=True,
    )
    scheduler.start()
    print(f"⏰ [Scheduler] Started - will update stats every {settings.REFRESH_INTERVAL_HOURS} hour(s)")
    print("=" * 50)
    print("✅ Server ready to accept connections!")
    print("=" * 50)
    
    yield
    
    # Shutdown
    scheduler.shutdown(wait=False)
    print("⏰ [Scheduler] Stopped")
    await database.disconnect()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Public LeetCode Leaderboard API",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router, tags=["Leaderboard"])
app.include_router(update.router, prefix="/admin", tags=["Admin"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "LeetCode Leaderboard API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    # Check database connection
    db_status = "connected" if database.db is not None else "disconnected"
    return {
        "status": "healthy" if db_status == "connected" else "unhealthy",
        "database": db_status,
        "version": settings.APP_VERSION,
    }

