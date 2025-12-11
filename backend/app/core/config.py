"""
Application configuration settings.
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Application
    APP_NAME: str = "LeetCode Leaderboard API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "leetcode_leaderboard"
    
    # Admin Security
    ADMIN_TOKEN: str = "super-secret-admin-token-change-me"
    
    # LeetCode API
    LEETCODE_GRAPHQL_URL: str = "https://leetcode.com/graphql"
    
    # Rate Limiting
    RATE_LIMIT_DELAY: float = 1.0  # seconds between API calls
    
    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()

