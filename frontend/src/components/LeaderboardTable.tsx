/**
 * LeaderboardTable component displays the ranked list of users.
 */
import type { LeaderboardEntry } from '../types/leaderboard';
import { formatScore } from '../utils/formatScore';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  loading?: boolean;
}

function RankBadge({ rank }: { rank: number }) {
  const medals: Record<number, { emoji: string; bg: string; shadow: string }> = {
    1: { emoji: '🥇', bg: 'bg-gradient-to-r from-yellow-400 to-amber-500', shadow: 'shadow-yellow-500/40' },
    2: { emoji: '🥈', bg: 'bg-gradient-to-r from-slate-300 to-slate-400', shadow: 'shadow-slate-400/40' },
    3: { emoji: '🥉', bg: 'bg-gradient-to-r from-amber-600 to-amber-700', shadow: 'shadow-amber-600/40' },
  };

  const medal = medals[rank];

  if (medal) {
    return (
      <div className={`w-10 h-10 rounded-full ${medal.bg} flex items-center justify-center text-xl shadow-lg ${medal.shadow}`}>
        {medal.emoji}
      </div>
    );
  }

  return (
    <div className="w-10 h-10 rounded-full bg-surface-800 border border-surface-700 flex items-center justify-center font-mono font-bold text-surface-300">
      #{rank}
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
          <div className="w-10 h-10 rounded-full bg-surface-800"></div>
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

function LeaderboardRow({ entry, index }: { entry: LeaderboardEntry; index: number }) {
  const isTopThree = entry.rank <= 3;
  const bgClass = isTopThree
    ? entry.rank === 1
      ? 'bg-yellow-500/5 border-yellow-500/20'
      : entry.rank === 2
      ? 'bg-slate-400/5 border-slate-400/20'
      : 'bg-amber-600/5 border-amber-600/20'
    : 'border-surface-800/50';

  return (
    <div
      className={`card p-4 flex items-center gap-4 border ${bgClass} transition-all hover:bg-surface-800/50`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Rank Badge */}
      <RankBadge rank={entry.rank} />

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-display font-semibold text-white truncate">
            {entry.username}
          </h3>
          {isTopThree && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              entry.rank === 1
                ? 'bg-yellow-500/20 text-yellow-400'
                : entry.rank === 2
                ? 'bg-slate-400/20 text-slate-300'
                : 'bg-amber-600/20 text-amber-400'
            }`}>
              {entry.rank === 1 ? '1ST PLACE' : entry.rank === 2 ? '2ND PLACE' : '3RD PLACE'}
            </span>
          )}
        </div>
        <a
          href={`https://leetcode.com/${entry.leetcode_username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-brand-400 hover:text-brand-300 transition-colors"
        >
          @{entry.leetcode_username} ↗
        </a>
      </div>

      {/* Problem Stats */}
      <div className="hidden sm:flex items-center gap-3">
        <div className="flex flex-col items-center px-3">
          <span className="text-difficulty-easy font-mono font-bold">{entry.easy_count}</span>
          <span className="text-xs text-surface-500">Easy</span>
        </div>
        <div className="flex flex-col items-center px-3">
          <span className="text-difficulty-medium font-mono font-bold">{entry.medium_count}</span>
          <span className="text-xs text-surface-500">Med</span>
        </div>
        <div className="flex flex-col items-center px-3">
          <span className="text-difficulty-hard font-mono font-bold">{entry.hard_count}</span>
          <span className="text-xs text-surface-500">Hard</span>
        </div>
      </div>

      {/* Score */}
      <div className="text-right">
        <div className="font-mono font-bold text-2xl text-white">
          {formatScore(entry.score)}
        </div>
        <div className="text-xs text-surface-500">points</div>
      </div>
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

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between px-2">
        <h2 className="text-lg font-display font-semibold text-white flex items-center gap-2">
          🏆 Rankings
        </h2>
        <span className="text-sm text-surface-500">
          {entries.length} {entries.length === 1 ? 'competitor' : 'competitors'}
        </span>
      </div>

      {/* Leaderboard Rows */}
      <div className="space-y-2">
        {entries.map((entry, index) => (
          <LeaderboardRow key={entry.id} entry={entry} index={index} />
        ))}
      </div>
    </div>
  );
}

export default LeaderboardTable;

