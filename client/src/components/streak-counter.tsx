import { Flame } from 'lucide-react';
import { Link } from 'wouter';
import { useProgress } from '@/hooks/use-progress';

interface StreakCounterProps {
  compact?: boolean;
}

export default function StreakCounter({ compact = false }: StreakCounterProps) {
  const { stats, loading } = useProgress();

  if (loading) return null;

  const hasStreak = stats.currentStreak > 0;
  const size = compact ? 'h-6' : 'h-8';
  const iconSize = compact ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const textSize = compact ? 'text-xs' : 'text-sm';

  return (
    <Link href="/my-progress">
      <a
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${size} ${
          hasStreak
            ? 'bg-gradient-to-r from-orange-100 to-amber-100 border border-orange-200'
            : 'bg-gray-100 border border-gray-200'
        }`}
      >
        <Flame
          className={`${iconSize} ${
            hasStreak ? 'text-orange-500' : 'text-gray-400'
          }`}
        />
        <span
          className={`${textSize} font-semibold ${
            hasStreak ? 'text-orange-700' : 'text-gray-400'
          }`}
        >
          {stats.currentStreak}
        </span>
      </a>
    </Link>
  );
}
