import { POINTS_CONFIG } from '@/lib/badge-definitions';
import type { DifficultyLevel } from '@/lib/flashcard-utils';
import type { UserStats } from '@/lib/progress-storage';

export interface PointsBreakdown {
  base: number;
  streakBonus: number;
  dailyFirst: number;
  total: number;
}

export function calculatePoints(
  difficulty: DifficultyLevel,
  stats: UserStats,
  isTodayFirst: boolean,
): PointsBreakdown {
  const base = POINTS_CONFIG[difficulty];
  const streakBonus = Math.min(stats.currentStreak, 30) * POINTS_CONFIG.streakBonus;
  const dailyFirst = isTodayFirst ? POINTS_CONFIG.dailyFirst : 0;
  const total = base + streakBonus + dailyFirst;

  return { base, streakBonus, dailyFirst, total };
}
