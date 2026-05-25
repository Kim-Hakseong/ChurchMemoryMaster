import { useState, useEffect, useCallback } from 'react';
import type { Verse } from '@shared/schema';
import type { DifficultyLevel } from '@/lib/flashcard-utils';
import type { BadgeDefinition } from '@/lib/badge-definitions';
import {
  getUserStats,
  getCompletions,
  getWeeklyGrid,
  getTodayCompletions,
  saveCompletion,
  getUnlockedBadgeIds,
  saveUnlockedBadgeIds,
  type UserStats,
  type CompletionRecord,
  type DayStatus,
} from '@/lib/progress-storage';
import { calculatePoints, type PointsBreakdown } from '@/lib/points-calculator';
import { evaluateBadges } from '@/lib/badge-engine';

interface UseProgressReturn {
  stats: UserStats;
  weeklyGrid: DayStatus[];
  completions: CompletionRecord[];
  unlockedBadgeIds: string[];
  loading: boolean;
  newBadges: BadgeDefinition[];
  lastPoints: PointsBreakdown | null;
  recordCompletion: (verse: Verse, difficulty: DifficultyLevel) => Promise<PointsBreakdown>;
  clearNewBadges: () => void;
  refresh: () => Promise<void>;
}

const DEFAULT_STATS: UserStats = {
  totalPoints: 0,
  currentStreak: 0,
  longestStreak: 0,
  freezesUsed: 0,
  lastActiveDate: '',
  totalCompletions: 0,
};

export function useProgress(): UseProgressReturn {
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
  const [weeklyGrid, setWeeklyGrid] = useState<DayStatus[]>([]);
  const [completions, setCompletions] = useState<CompletionRecord[]>([]);
  const [unlockedBadgeIds, setUnlockedBadgeIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBadges, setNewBadges] = useState<BadgeDefinition[]>([]);
  const [lastPoints, setLastPoints] = useState<PointsBreakdown | null>(null);

  const loadAll = useCallback(async () => {
    try {
      const [s, g, c, b] = await Promise.all([
        getUserStats(),
        getWeeklyGrid(),
        getCompletions(),
        getUnlockedBadgeIds(),
      ]);
      setStats(s);
      setWeeklyGrid(g);
      setCompletions(c);
      setUnlockedBadgeIds(b);
    } catch {
      // 에러 시 기본값 유지
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const recordCompletion = useCallback(
    async (verse: Verse, difficulty: DifficultyLevel): Promise<PointsBreakdown> => {
      const todayCompletions = await getTodayCompletions();
      const isTodayFirst = todayCompletions.length === 0;
      const points = calculatePoints(difficulty, stats, isTodayFirst);

      const record: CompletionRecord = {
        verseId: verse.id,
        ageGroup: verse.ageGroup,
        difficulty,
        completedAt: Date.now(),
        pointsEarned: points.total,
      };

      const newStats = await saveCompletion(record);
      setStats(newStats);
      setLastPoints(points);

      // 뱃지 평가
      const allCompletions = [...completions, record];
      setCompletions(allCompletions);

      const prevBadges = await getUnlockedBadgeIds();
      const result = evaluateBadges(newStats, allCompletions, prevBadges);

      if (result.newlyUnlocked.length > 0) {
        setNewBadges(result.newlyUnlocked);
        await saveUnlockedBadgeIds(result.allUnlocked);
        setUnlockedBadgeIds(result.allUnlocked);
      }

      // 주간 그리드 새로고침
      const grid = await getWeeklyGrid();
      setWeeklyGrid(grid);

      return points;
    },
    [stats, completions],
  );

  const clearNewBadges = useCallback(() => {
    setNewBadges([]);
  }, []);

  return {
    stats,
    weeklyGrid,
    completions,
    unlockedBadgeIds,
    loading,
    newBadges,
    lastPoints,
    recordCompletion,
    clearNewBadges,
    refresh: loadAll,
  };
}
