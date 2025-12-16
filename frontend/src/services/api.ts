/**
 * API service for communicating with the backend.
 */
import type {
  LeaderboardResponse,
  UserCreate,
  UserResponse,
  UpdateResult,
  MessageResponse,
} from '../types/leaderboard';

// API base URL - uses proxy in development, direct URL in production
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Make an API request with error handling.
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Verify admin token.
 */
export async function verifyAdminToken(
  adminToken: string
): Promise<MessageResponse> {
  return apiRequest<MessageResponse>('/admin/verify', {
    method: 'POST',
    headers: {
      'X-Admin-Token': adminToken,
    },
  });
}

/**
 * Get the public leaderboard.
 */
export async function getLeaderboard(
  limit = 100,
  offset = 0
): Promise<LeaderboardResponse> {
  return apiRequest<LeaderboardResponse>(
    `/leaderboard?limit=${limit}&offset=${offset}`
  );
}

/**
 * Get a single user by ID.
 */
export async function getUser(userId: string): Promise<UserResponse> {
  return apiRequest<UserResponse>(`/user/${userId}`);
}

/**
 * Add a new user (admin only).
 */
export async function addUser(
  userData: UserCreate,
  adminToken: string
): Promise<UserResponse> {
  return apiRequest<UserResponse>('/admin/user/add', {
    method: 'POST',
    headers: {
      'X-Admin-Token': adminToken,
    },
    body: JSON.stringify(userData),
  });
}

/**
 * Remove a user (admin only).
 */
export async function removeUser(
  userId: string,
  adminToken: string
): Promise<MessageResponse> {
  return apiRequest<MessageResponse>(`/admin/user/${userId}`, {
    method: 'DELETE',
    headers: {
      'X-Admin-Token': adminToken,
    },
  });
}

/**
 * Trigger update for all users (admin only).
 */
export async function updateAllUsers(
  adminToken: string
): Promise<UpdateResult> {
  return apiRequest<UpdateResult>('/admin/update_all', {
    method: 'POST',
    headers: {
      'X-Admin-Token': adminToken,
    },
  });
}

/**
 * Trigger async update for all users (admin only).
 */
export async function updateAllUsersAsync(
  adminToken: string
): Promise<MessageResponse> {
  return apiRequest<MessageResponse>('/admin/update_all/async', {
    method: 'POST',
    headers: {
      'X-Admin-Token': adminToken,
    },
  });
}

/**
 * Update a single user (admin only).
 */
export async function updateSingleUser(
  userId: string,
  adminToken: string
): Promise<MessageResponse> {
  return apiRequest<MessageResponse>(`/admin/update_user/${userId}`, {
    method: 'POST',
    headers: {
      'X-Admin-Token': adminToken,
    },
  });
}

/**
 * Reset baseline for a single user (admin only).
 */
export async function resetUserBaseline(
  userId: string,
  adminToken: string
): Promise<MessageResponse> {
  return apiRequest<MessageResponse>(`/admin/user/${userId}/reset_baseline`, {
    method: 'POST',
    headers: {
      'X-Admin-Token': adminToken,
    },
  });
}

/**
 * Reset baselines for all users (admin only).
 */
export async function resetAllBaselines(
  adminToken: string
): Promise<MessageResponse> {
  return apiRequest<MessageResponse>('/admin/reset_all_baselines', {
    method: 'POST',
    headers: {
      'X-Admin-Token': adminToken,
    },
  });
}

