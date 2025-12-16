"""
Score calculation service.
"""


def calculate_score(easy: int, medium: int, hard: int) -> int:
    """
    Calculate the leaderboard score.
    
    Formula: easy * 1 + medium * 2 + hard * 3
    
    Args:
        easy: Number of easy problems solved (delta from baseline)
        medium: Number of medium problems solved (delta from baseline)
        hard: Number of hard problems solved (delta from baseline)
    
    Returns:
        Calculated score
    """
    return (easy * 1) + (medium * 2) + (hard * 3)


def calculate_score_with_baseline(
    current_easy: int, current_medium: int, current_hard: int,
    baseline_easy: int, baseline_medium: int, baseline_hard: int
) -> int:
    """
    Calculate the leaderboard score based on delta from baseline.
    
    Formula: (current - baseline) for each difficulty, then apply multipliers.
    
    Args:
        current_easy: Current total easy problems
        current_medium: Current total medium problems
        current_hard: Current total hard problems
        baseline_easy: Baseline easy problems (when tracking started)
        baseline_medium: Baseline medium problems (when tracking started)
        baseline_hard: Baseline hard problems (when tracking started)
    
    Returns:
        Calculated score based on delta
    """
    delta_easy = max(0, current_easy - baseline_easy)
    delta_medium = max(0, current_medium - baseline_medium)
    delta_hard = max(0, current_hard - baseline_hard)
    return calculate_score(delta_easy, delta_medium, delta_hard)


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

