/**
 * LeaderboardTable component displays the ranked list of users.
 */
import type { LeaderboardEntry } from '../types/leaderboard';
import { formatScore, getRelativeTime } from '../utils/formatScore';
import UserCard from './UserCard';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  loading?: boolean;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="w-8 h-8 rounded-full rank-1 flex items-center justify-center font-bold text-sm shadow-lg shadow-yellow-500/30">
        1
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="w-8 h-8 rounded-full rank-2 flex items-center justify-center font-bold text-sm shadow-lg shadow-slate-400/30">
        2
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="w-8 h-8 rounded-full rank-3 flex items-center justify-center font-bold text-sm shadow-lg shadow-amber-600/30">
        3
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-surface-800 flex items-center justify-center font-mono text-sm text-surface-400">
      {rank}
    </div>
  );
}

function DifficultyStats({
  easy,
  medium,
  hard,
}: {
  easy: number;
  medium: number;
  hard: number;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-difficulty-easy"></span>
        <span className="text-sm font-mono text-surface-300">{easy}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-difficulty-medium"></span>
        <span className="text-sm font-mono text-surface-300">{medium}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-difficulty-hard"></span>
        <span className="text-sm font-mono text-surface-300">{hard}</span>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="card p-4 animate-pulse flex items-center gap-4"
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          <div className="w-8 h-8 rounded-full bg-surface-800"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-surface-800 rounded"></div>
            <div className="h-3 w-24 bg-surface-800 rounded"></div>
          </div>
          <div className="h-6 w-16 bg-surface-800 rounded"></div>
        </div>
      ))}
    </div>
  );
}

export function LeaderboardTable({ entries, loading }: LeaderboardTableProps) {
  if (loading) {
    return <LoadingSkeleton />;
  }

  if (entries.length === 0) {
    return (
      <div className="card p-12 text-center">
        <div className="text-6xl mb-4">🏆</div>
        <h3 className="text-xl font-display font-semibold text-white mb-2">
          No Users Yet
        </h3>
        <p className="text-surface-400">
          Add users through the admin panel to see them on the leaderboard.
        </p>
      </div>
    );
  }

  // Show cards for top 3, table for the rest
  const topThree = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="space-y-6">
      {/* Top 3 Cards */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topThree.map((entry, index) => (
            <div
              key={entry.id}
              className="animate-stagger"
              style={{ '--stagger': index } as React.CSSProperties}
            >
              <UserCard entry={entry} featured />
            </div>
          ))}
        </div>
      )}

      {/* Rest of the leaderboard */}
      {rest.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-800">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-surface-400 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-surface-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-surface-400 uppercase tracking-wider hidden sm:table-cell">
                    Problems
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-surface-400 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-surface-400 uppercase tracking-wider hidden md:table-cell">
                    Updated
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-800/50">
                {rest.map((entry, index) => (
                  <tr
                    key={entry.id}
                    className="table-row-hover animate-stagger"
                    style={{ '--stagger': index + 3 } as React.CSSProperties}
                  >
                    <td className="px-4 py-4">
                      <RankBadge rank={entry.rank} />
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-white">
                          {entry.username}
                        </p>
                        <a
                          href={`https://leetcode.com/${entry.leetcode_username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-brand-400 hover:text-brand-300 transition-colors"
                        >
                          @{entry.leetcode_username}
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <DifficultyStats
                        easy={entry.easy_count}
                        medium={entry.medium_count}
                        hard={entry.hard_count}
                      />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-mono font-semibold text-lg text-white">
                        {formatScore(entry.score)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right hidden md:table-cell">
                      <span className="text-sm text-surface-400">
                        {getRelativeTime(entry.last_updated)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeaderboardTable;

