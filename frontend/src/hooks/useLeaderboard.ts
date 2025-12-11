/**
 * Custom hook for managing leaderboard data.
 */
import { useState, useEffect, useCallback } from 'react';
import type { LeaderboardResponse, LeaderboardEntry } from '../types/leaderboard';
import { getLeaderboard } from '../services/api';

interface UseLeaderboardReturn {
  data: LeaderboardResponse | null;
  entries: LeaderboardEntry[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  totalUsers: number;
  lastUpdated: string | null;
}

export function useLeaderboard(): UseLeaderboardReturn {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getLeaderboard();
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    data,
    entries: data?.entries ?? [],
    loading,
    error,
    refresh: fetchLeaderboard,
    totalUsers: data?.total_users ?? 0,
    lastUpdated: data?.last_global_update ?? null,
  };
}

export default useLeaderboard;

