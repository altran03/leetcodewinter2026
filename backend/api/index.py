"""
Vercel Serverless Function Entry Point
This file creates a serverless-compatible FastAPI app for Vercel.
Note: Scheduler is disabled in serverless mode.
"""
import sys
import os

# Add the parent directory to the path so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set environment variable to indicate serverless mode
os.environ["SERVERLESS"] = "true"

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.db import database
from app.api.v1 import users, update


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Serverless lifespan - connect to DB on startup."""
    try:
        await database.connect()
        print("✅ Connected to MongoDB (serverless)")
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
    yield
    # No cleanup needed in serverless


# Create serverless-compatible FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Public LeetCode Leaderboard API (Serverless)",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for serverless
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
        "mode": "serverless",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    db_status = "connected" if database.db is not None else "disconnected"
    return {
        "status": "healthy" if db_status == "connected" else "unhealthy",
        "database": db_status,
        "version": settings.APP_VERSION,
    }

