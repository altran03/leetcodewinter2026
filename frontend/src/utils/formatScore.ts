/**
 * Utility functions for formatting scores and numbers.
 */

/**
 * Format a score with thousands separators.
 */
export function formatScore(score: number): string {
  return score.toLocaleString();
}

/**
 * Format a number with abbreviations (K, M).
 */
export function formatCompact(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * Calculate the score breakdown.
 */
export function calculateScoreBreakdown(
  easy: number,
  medium: number,
  hard: number
): {
  easy: number;
  medium: number;
  hard: number;
  total: number;
} {
  return {
    easy: easy * 1,
    medium: medium * 2,
    hard: hard * 3,
    total: easy * 1 + medium * 2 + hard * 3,
  };
}

/**
 * Format a date string to a human-readable format.
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get relative time string (e.g., "2 hours ago").
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }
  if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  }
  if (diffMins > 0) {
    return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  }
  return 'Just now';
}

