"""
Score calculation service.
"""


def calculate_score(easy: int, medium: int, hard: int) -> int:
    """
    Calculate the leaderboard score.
    
    Formula: easy * 1 + medium * 2 + hard * 3
    
    Args:
        easy: Number of easy problems solved
        medium: Number of medium problems solved
        hard: Number of hard problems solved
    
    Returns:
        Calculated score
    """
    return (easy * 1) + (medium * 2) + (hard * 3)


def get_score_breakdown(easy: int, medium: int, hard: int) -> dict:
    """
    Get detailed score breakdown.
    
    Args:
        easy: Number of easy problems solved
        medium: Number of medium problems solved
        hard: Number of hard problems solved
    
    Returns:
        Dictionary with score breakdown
    """
    easy_points = easy * 1
    medium_points = medium * 2
    hard_points = hard * 3
    total = easy_points + medium_points + hard_points
    
    return {
        "easy": {"count": easy, "multiplier": 1, "points": easy_points},
        "medium": {"count": medium, "multiplier": 2, "points": medium_points},
        "hard": {"count": hard, "multiplier": 3, "points": hard_points},
        "total_score": total,
    }

