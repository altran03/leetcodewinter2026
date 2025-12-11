/**
 * Type definitions for the LeetCode Leaderboard application.
 */

export interface LeaderboardEntry {
  rank: number;
  id: string;
  username: string;
  leetcode_username: string;
  easy_count: number;
  medium_count: number;
  hard_count: number;
  score: number;
  last_updated: string;
}

export interface LeaderboardResponse {
  total_users: number;
  last_global_update: string | null;
  entries: LeaderboardEntry[];
}

export interface UserCreate {
  username: string;
  leetcode_username: string;
}

export interface UserResponse {
  _id: string;
  username: string;
  leetcode_username: string;
  easy_count: number;
  medium_count: number;
  hard_count: number;
  score: number;
  last_updated: string;
  created_at: string;
}

export interface UpdateResult {
  success: boolean;
  updated_count: number;
  failed_count: number;
  errors: string[];
}

export interface MessageResponse {
  message: string;
  success: boolean;
}

export interface ApiError {
  detail: string;
}

