import {
  Lock, Sparkles, Zap, Flame, Crown, Star, Medal, Trophy, Shield, Award,
  BookOpen, Users, Gem, Target, Mountain, Rocket, Heart, Brain, Compass, Sun, CalendarCheck,
  Diamond, Layers, CalendarDays,
} from 'lucide-react';
import type { BadgeDefinition } from '@/lib/badge-definitions';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles, Zap, Flame, Crown, Star, Medal, Trophy, Shield, Award, BookOpen,
  Users, Gem, Target, Mountain, Rocket, Heart, Brain, Compass, Sun, CalendarCheck,
  Diamond, Layers, CalendarDays,
};

interface BadgeCardProps {
  badge: BadgeDefinition;
  unlocked: boolean;
  onClick?: () => void;
}

export default function BadgeCard({ badge, unlocked, onClick }: BadgeCardProps) {
  const Icon = ICON_MAP[badge.icon] || Star;

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
        unlocked
          ? 'hover:shadow-md active:scale-95'
          : 'opacity-60'
      }`}
      style={{
        background: unlocked ? 'var(--surface)' : 'var(--surface-muted)',
        borderColor: 'var(--border-soft)',
      }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{
          background: unlocked ? 'var(--surface-muted)' : 'var(--surface-muted)',
        }}
      >
        {unlocked ? (
          <Icon className={`w-5 h-5 ${badge.color}`} />
        ) : (
          <Lock className="w-4 h-4" style={{ color: 'var(--ink-faint)' }} />
        )}
      </div>
      <span
        className="text-[11px] font-medium text-center leading-tight"
        style={{
          color: unlocked ? 'var(--ink-soft)' : 'var(--ink-faint)',
          wordBreak: 'keep-all',
          whiteSpace: 'normal',
          minHeight: '2.4em', // 2줄 분량 미리 확보 → 짧은 이름과 정렬 맞춤
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {badge.name}
      </span>
    </button>
  );
}
