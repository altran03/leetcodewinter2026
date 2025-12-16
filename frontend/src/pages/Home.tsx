/**
 * Home page displaying the public leaderboard.
 * Updated: Rankings and scores display
 */
import { useLeaderboard } from '../hooks/useLeaderboard';
import LeaderboardTable from '../components/LeaderboardTable';
import { formatDate } from '../utils/formatScore';

export function Home() {
  const { entries, loading, error, refresh, totalUsers, lastUpdated } = useLeaderboard();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white animate-fade-in">
          LeetCode <span className="text-gradient">Leaderboard</span>
        </h1>
        <p className="text-surface-400 text-lg max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.1s' }}>
          Track and compare LeetCode progress with your peers. Climb the ranks by solving more problems!
        </p>
      </div>

      {/* Stats bar */}
      <div className="card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-sm text-surface-400">Total Users</p>
            <p className="text-2xl font-mono font-bold text-white">{totalUsers}</p>
          </div>
          {lastUpdated && (
            <div>
              <p className="text-sm text-surface-400">Last Updated</p>
              <p className="text-sm font-mono text-surface-300">{formatDate(lastUpdated)}</p>
            </div>
          )}
        </div>

        <button
          onClick={refresh}
          disabled={loading}
          className="btn btn-secondary"
        >
          {loading ? (
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
              Loading...
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </>
          )}
        </button>
      </div>

      {/* Scoring legend */}
      <div className="card p-4">
        <div className="flex flex-col items-center gap-3 text-sm">
          <div className="flex flex-wrap items-center justify-center gap-6">
            <span className="text-surface-400">Score Formula:</span>
            <div className="flex items-center gap-2">
              <span className="badge badge-easy">Easy × 1</span>
              <span className="text-surface-600">+</span>
              <span className="badge badge-medium">Medium × 2</span>
              <span className="text-surface-600">+</span>
              <span className="badge badge-hard">Hard × 3</span>
            </div>
          </div>
          <p className="text-xs text-surface-500">
            📊 Only problems solved <span className="text-brand-400">after joining</span> count toward your score
          </p>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="card p-4 bg-red-500/10 border-red-500/30">
          <div className="flex items-center gap-3 text-red-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
            <button
              onClick={refresh}
              className="ml-auto text-sm underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <LeaderboardTable entries={entries} loading={loading} />
    </div>
  );
}

export default Home;

