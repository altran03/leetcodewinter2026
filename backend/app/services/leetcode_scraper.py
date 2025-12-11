"""
LeetCode stats scraper using the public GraphQL API.
"""
import httpx
import asyncio
from typing import Optional
from dataclasses import dataclass
from app.core.config import settings


@dataclass
class LeetCodeStats:
    """LeetCode user statistics."""
    
    easy_count: int
    medium_count: int
    hard_count: int
    total_solved: int
    ranking: Optional[int] = None


class LeetCodeScraper:
    """Scraper for LeetCode user statistics using GraphQL API."""
    
    GRAPHQL_URL = settings.LEETCODE_GRAPHQL_URL
    
    USER_STATS_QUERY = """
    query userProblemsSolved($username: String!) {
        matchedUser(username: $username) {
            submitStatsGlobal {
                acSubmissionNum {
                    difficulty
                    count
                }
            }
            profile {
                ranking
            }
        }
    }
    """
    
    def __init__(self):
        self.rate_limit_delay = settings.RATE_LIMIT_DELAY
    
    async def get_user_stats(self, username: str) -> Optional[LeetCodeStats]:
        """
        Fetch LeetCode statistics for a user.
        
        Args:
            username: LeetCode username
        
        Returns:
            LeetCodeStats object or None if user not found
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    self.GRAPHQL_URL,
                    json={
                        "query": self.USER_STATS_QUERY,
                        "variables": {"username": username},
                    },
                    headers={
                        "Content-Type": "application/json",
                        "Referer": "https://leetcode.com",
                    },
                )
                
                if response.status_code != 200:
                    print(f"Error fetching stats for {username}: HTTP {response.status_code}")
                    return None
                
                data = response.json()
                
                if "errors" in data:
                    print(f"GraphQL error for {username}: {data['errors']}")
                    return None
                
                matched_user = data.get("data", {}).get("matchedUser")
                
                if not matched_user:
                    print(f"User not found: {username}")
                    return None
                
                # Parse submission stats
                ac_stats = matched_user.get("submitStatsGlobal", {}).get("acSubmissionNum", [])
                
                easy_count = 0
                medium_count = 0
                hard_count = 0
                total_solved = 0
                
                for stat in ac_stats:
                    difficulty = stat.get("difficulty", "").lower()
                    count = stat.get("count", 0)
                    
                    if difficulty == "easy":
                        easy_count = count
                    elif difficulty == "medium":
                        medium_count = count
                    elif difficulty == "hard":
                        hard_count = count
                    elif difficulty == "all":
                        total_solved = count
                
                # Get ranking
                ranking = matched_user.get("profile", {}).get("ranking")
                
                return LeetCodeStats(
                    easy_count=easy_count,
                    medium_count=medium_count,
                    hard_count=hard_count,
                    total_solved=total_solved,
                    ranking=ranking,
                )
        
        except httpx.TimeoutException:
            print(f"Timeout fetching stats for {username}")
            return None
        except Exception as e:
            print(f"Error fetching stats for {username}: {e}")
            return None
    
    async def get_multiple_users_stats(
        self, usernames: list[str]
    ) -> dict[str, Optional[LeetCodeStats]]:
        """
        Fetch stats for multiple users with rate limiting.
        
        Args:
            usernames: List of LeetCode usernames
        
        Returns:
            Dictionary mapping usernames to their stats
        """
        results = {}
        
        for username in usernames:
            stats = await self.get_user_stats(username)
            results[username] = stats
            
            # Rate limiting
            if username != usernames[-1]:  # Don't delay after last request
                await asyncio.sleep(self.rate_limit_delay)
        
        return results


# Global scraper instance
leetcode_scraper = LeetCodeScraper()

