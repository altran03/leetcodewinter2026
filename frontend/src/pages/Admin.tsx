/**
 * Admin page for managing users and triggering updates.
 */
import { useState, useEffect } from 'react';
import { useLeaderboard } from '../hooks/useLeaderboard';
import UserCard from '../components/UserCard';
import {
  addUser,
  removeUser,
  updateAllUsers,
  updateSingleUser,
  resetUserBaseline,
  resetAllBaselines,
  verifyAdminToken,
} from '../services/api';
import type { UpdateResult, LeaderboardEntry } from '../types/leaderboard';

export function Admin() {
  const { entries, refresh, loading } = useLeaderboard();
  const [adminToken, setAdminToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isCheckingStoredToken, setIsCheckingStoredToken] = useState(true);
  
  // Add user form
  const [newUsername, setNewUsername] = useState('');
  const [newLeetCodeUsername, setNewLeetCodeUsername] = useState('');
  
  // Status messages
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isResettingBaselines, setIsResettingBaselines] = useState(false);

  // Verify stored token on page load
  useEffect(() => {
    const verifyStoredToken = async () => {
      const savedToken = localStorage.getItem('adminToken');
      if (savedToken) {
        try {
          await verifyAdminToken(savedToken);
          setAdminToken(savedToken);
          setIsAuthenticated(true);
        } catch {
          // Stored token is invalid, remove it
          localStorage.removeItem('adminToken');
        }
      }
      setIsCheckingStoredToken(false);
    };
    verifyStoredToken();
  }, []);

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken.trim()) return;

    setIsVerifying(true);
    setLoginError(null);

    try {
      await verifyAdminToken(adminToken);
      localStorage.setItem('adminToken', adminToken);
      setIsAuthenticated(true);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Invalid admin token');
      setAdminToken('');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setAdminToken('');
    setIsAuthenticated(false);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newLeetCodeUsername.trim()) return;

    setIsAdding(true);
    setStatusMessage(null);

    try {
      await addUser(
        {
          username: newUsername.trim(),
          leetcode_username: newLeetCodeUsername.trim(),
        },
        adminToken
      );
      setStatusMessage({ type: 'success', text: 'User added successfully!' });
      setNewUsername('');
      setNewLeetCodeUsername('');
      await refresh();
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to add user',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this user?')) return;

    try {
      await removeUser(userId, adminToken);
      setStatusMessage({ type: 'success', text: 'User removed successfully!' });
      await refresh();
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to remove user',
      });
    }
  };

  const handleUpdateAll = async () => {
    setIsUpdating(true);
    setStatusMessage(null);

    try {
      const result: UpdateResult = await updateAllUsers(adminToken);
      if (result.success) {
        setStatusMessage({
          type: 'success',
          text: `Updated ${result.updated_count} users successfully!`,
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: `Updated ${result.updated_count}, failed ${result.failed_count}. Errors: ${result.errors.join(', ')}`,
        });
      }
      await refresh();
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update users',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateSingle = async (userId: string) => {
    try {
      await updateSingleUser(userId, adminToken);
      setStatusMessage({ type: 'success', text: 'User stats updated!' });
      await refresh();
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update user',
      });
    }
  };

  const handleResetBaseline = async (userId: string) => {
    if (!confirm('Reset baseline for this user? Their score will become 0 and tracking will restart from current stats.')) return;

    try {
      await resetUserBaseline(userId, adminToken);
      setStatusMessage({ type: 'success', text: 'Baseline reset! User score is now 0.' });
      await refresh();
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to reset baseline',
      });
    }
  };

  const handleResetAllBaselines = async () => {
    if (!confirm('Reset baselines for ALL users? All scores will become 0 and tracking will restart from current stats.')) return;

    setIsResettingBaselines(true);
    setStatusMessage(null);

    try {
      const result = await resetAllBaselines(adminToken);
      setStatusMessage({ type: 'success', text: result.message });
      await refresh();
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to reset baselines',
      });
    } finally {
      setIsResettingBaselines(false);
    }
  };

  // Show loading while checking stored token
  if (isCheckingStoredToken) {
    return (
      <div className="max-w-md mx-auto py-12">
        <div className="card p-8 text-center">
          <svg className="animate-spin h-8 w-8 mx-auto text-brand-400" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-surface-400 mt-4">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-12">
        <div className="card p-8 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/30">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-display font-bold text-white">Admin Access</h1>
            <p className="text-surface-400 mt-2">Enter your admin token to continue</p>
          </div>

          {loginError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3 text-red-400">
                <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm">{loginError}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleTokenSubmit} className="space-y-4">
            <input
              type="password"
              value={adminToken}
              onChange={(e) => setAdminToken(e.target.value)}
              placeholder="Enter admin token"
              className="input"
              autoComplete="off"
              disabled={isVerifying}
            />
            <button 
              type="submit" 
              className="btn btn-primary w-full"
              disabled={isVerifying || !adminToken.trim()}
            >
              {isVerifying ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Verifying...
                </>
              ) : (
                'Continue'
              )}
            </button>
          </form>

          <p className="text-xs text-surface-500 text-center">
            Contact the administrator if you don't have access credentials.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Admin Panel</h1>
          <p className="text-surface-400">Manage users and sync LeetCode stats</p>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Logout
        </button>
      </div>

      {/* Status message */}
      {statusMessage && (
        <div
          className={`card p-4 ${
            statusMessage.type === 'success'
              ? 'bg-brand-500/10 border-brand-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}
        >
          <p
            className={
              statusMessage.type === 'success' ? 'text-brand-400' : 'text-red-400'
            }
          >
            {statusMessage.text}
          </p>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Add User */}
        <div className="card p-6 space-y-6">
          <div>
            <h2 className="text-xl font-display font-semibold text-white">Add User</h2>
            <p className="text-surface-400 text-sm mt-1">
              Add a new user to the leaderboard
            </p>
          </div>

          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="John Doe"
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                LeetCode Username
              </label>
              <input
                type="text"
                value={newLeetCodeUsername}
                onChange={(e) => setNewLeetCodeUsername(e.target.value)}
                placeholder="johndoe123"
                className="input"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isAdding || !newUsername || !newLeetCodeUsername}
              className="btn btn-primary w-full"
            >
              {isAdding ? 'Adding...' : 'Add User'}
            </button>
          </form>
        </div>

        {/* Sync Stats */}
        <div className="card p-6 space-y-6">
          <div>
            <h2 className="text-xl font-display font-semibold text-white">
              Sync LeetCode Stats
            </h2>
            <p className="text-surface-400 text-sm mt-1">
              Fetch latest stats from LeetCode for all users
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleUpdateAll}
              disabled={isUpdating || entries.length === 0}
              className="btn btn-primary w-full"
            >
              {isUpdating ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Updating all users...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Update All Users ({entries.length})
                </>
              )}
            </button>

            <button
              onClick={handleResetAllBaselines}
              disabled={isResettingBaselines || entries.length === 0}
              className="btn btn-secondary w-full"
            >
              {isResettingBaselines ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Resetting baselines...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Reset All Baselines (Start Fresh)
                </>
              )}
            </button>

            <div className="bg-surface-800/50 rounded-xl p-4 text-sm text-surface-400 space-y-2">
              <p className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Stats are fetched from LeetCode's public API with rate limiting.
              </p>
              <p className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>Only problems solved <strong className="text-white">after being added</strong> count toward the score!</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User List */}
      <div className="space-y-4">
        <h2 className="text-xl font-display font-semibold text-white">
          Manage Users ({entries.length})
        </h2>

        {loading ? (
          <div className="card p-8 text-center text-surface-400">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="card p-8 text-center text-surface-400">
            No users yet. Add your first user above!
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {entries.map((entry: LeaderboardEntry) => (
              <div key={entry.id} className="relative group">
                <UserCard entry={entry} />
                <div className="absolute top-2 right-12 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    onClick={() => handleUpdateSingle(entry.id)}
                    className="p-2 bg-surface-800 rounded-lg hover:bg-surface-700 transition-colors"
                    title="Update stats"
                  >
                    <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleResetBaseline(entry.id)}
                    className="p-2 bg-surface-800 rounded-lg hover:bg-yellow-500/20 transition-colors"
                    title="Reset baseline (start fresh)"
                  >
                    <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleRemoveUser(entry.id)}
                    className="p-2 bg-surface-800 rounded-lg hover:bg-red-500/20 transition-colors"
                    title="Remove user"
                  >
                    <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;

