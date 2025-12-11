/**
 * UserCard component for displaying individual user stats.
 */
import type { LeaderboardEntry } from '../types/leaderboard';
import { formatScore, getRelativeTime } from '../utils/formatScore';

interface UserCardProps {
  entry: LeaderboardEntry;
  featured?: boolean;
  onRemove?: (id: string) => void;
  showActions?: boolean;
}

function RankMedal({ rank }: { rank: number }) {
  const medals: Record<number, { emoji: string; gradient: string; shadow: string }> = {
    1: {
      emoji: '🥇',
      gradient: 'from-yellow-400/20 to-amber-500/20',
      shadow: 'shadow-yellow-500/20',
    },
    2: {
      emoji: '🥈',
      gradient: 'from-slate-300/20 to-slate-400/20',
      shadow: 'shadow-slate-400/20',
    },
    3: {
      emoji: '🥉',
      gradient: 'from-amber-600/20 to-amber-700/20',
      shadow: 'shadow-amber-600/20',
    },
  };

  const medal = medals[rank];

  if (!medal) {
    return (
      <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-surface-800 border border-surface-700 flex items-center justify-center font-mono font-bold text-surface-400">
        #{rank}
      </div>
    );
  }

  return (
    <div
      className={`absolute -top-3 -right-3 w-12 h-12 rounded-full bg-gradient-to-br ${medal.gradient} border border-surface-700 flex items-center justify-center text-2xl shadow-lg ${medal.shadow}`}
    >
      {medal.emoji}
    </div>
  );
}

export function UserCard({
  entry,
  featured = false,
  onRemove,
  showActions = false,
}: UserCardProps) {
  const cardClass = featured
    ? 'card p-6 relative overflow-hidden'
    : 'card p-4 relative';

  const borderGlow = featured && entry.rank <= 3
    ? entry.rank === 1
      ? 'ring-2 ring-yellow-500/30'
      : entry.rank === 2
      ? 'ring-2 ring-slate-400/30'
      : 'ring-2 ring-amber-600/30'
    : '';

  return (
    <div className={`${cardClass} ${borderGlow}`}>
      <RankMedal rank={entry.rank} />

      {/* Background decoration for featured cards */}
      {featured && (
        <div className="absolute inset-0 -z-10 opacity-50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl"></div>
        </div>
      )}

      <div className="space-y-4">
        {/* User info */}
        <div className="pr-10">
          <h3 className={`font-display font-semibold ${featured ? 'text-xl' : 'text-lg'} text-white`}>
            {entry.username}
          </h3>
          <a
            href={`https://leetcode.com/${entry.leetcode_username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-400 hover:text-brand-300 transition-colors text-sm"
          >
            @{entry.leetcode_username} ↗
          </a>
        </div>

        {/* Score */}
        <div className="flex items-baseline gap-2">
          <span className={`font-mono font-bold ${featured ? 'text-3xl' : 'text-2xl'} text-gradient`}>
            {formatScore(entry.score)}
          </span>
          <span className="text-surface-500 text-sm">points</span>
        </div>

        {/* Problem counts */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-surface-800/50 rounded-xl p-3 text-center">
            <p className="text-difficulty-easy font-mono font-semibold text-lg">
              {entry.easy_count}
            </p>
            <p className="text-xs text-surface-400 mt-1">Easy</p>
          </div>
          <div className="bg-surface-800/50 rounded-xl p-3 text-center">
            <p className="text-difficulty-medium font-mono font-semibold text-lg">
              {entry.medium_count}
            </p>
            <p className="text-xs text-surface-400 mt-1">Medium</p>
          </div>
          <div className="bg-surface-800/50 rounded-xl p-3 text-center">
            <p className="text-difficulty-hard font-mono font-semibold text-lg">
              {entry.hard_count}
            </p>
            <p className="text-xs text-surface-400 mt-1">Hard</p>
          </div>
        </div>

        {/* Updated time */}
        <p className="text-xs text-surface-500">
          Updated {getRelativeTime(entry.last_updated)}
        </p>

        {/* Actions */}
        {showActions && onRemove && (
          <div className="pt-2 border-t border-surface-800">
            <button
              onClick={() => onRemove(entry.id)}
              className="btn btn-danger w-full text-sm"
            >
              Remove User
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserCard;

