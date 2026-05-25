import { BADGES, type BadgeDefinition } from '@/lib/badge-definitions';
import type { UserStats, CompletionRecord } from '@/lib/progress-storage';
import { checkPerfectWeekFromCompletions } from '@/lib/progress-storage';

export interface BadgeEvalResult {
  allUnlocked: string[]; // 전체 해금된 뱃지 ID
  newlyUnlocked: BadgeDefinition[]; // 이번에 새로 해금된 뱃지
}

// 뱃지 해금 조건 평가
export function evaluateBadges(
  stats: UserStats,
  completions: CompletionRecord[],
  previouslyUnlocked: string[],
): BadgeEvalResult {
  const unlocked: string[] = [];

  for (const badge of BADGES) {
    if (checkCondition(badge.id, stats, completions)) {
      unlocked.push(badge.id);
    }
  }

  const newlyUnlocked = unlocked
    .filter((id) => !previouslyUnlocked.includes(id))
    .map((id) => BADGES.find((b) => b.id === id)!)
    .filter(Boolean);

  return { allUnlocked: unlocked, newlyUnlocked };
}

function checkCondition(
  badgeId: string,
  stats: UserStats,
  completions: CompletionRecord[],
): boolean {
  switch (badgeId) {
    // streak
    case 'first_step':
      return stats.totalCompletions >= 1;
    case 'streak_3':
      return stats.currentStreak >= 3 || stats.longestStreak >= 3;
    case 'streak_7':
      return stats.currentStreak >= 7 || stats.longestStreak >= 7;
    case 'streak_30':
      return stats.currentStreak >= 30 || stats.longestStreak >= 30;

    // count
    case 'count_10':
      return stats.totalCompletions >= 10;
    case 'count_50':
      return stats.totalCompletions >= 50;
    case 'count_100':
      return stats.totalCompletions >= 100;

    // difficulty
    case 'expert_first':
      return completions.some((c) => c.difficulty === 'expert');
    case 'expert_10':
      return completions.filter((c) => c.difficulty === 'expert').length >= 10;
    case 'expert_30':
      return completions.filter((c) => c.difficulty === 'expert').length >= 30;

    // special
    case 'all_groups': {
      const groups = new Set(completions.map((c) => c.ageGroup));
      return groups.has('kindergarten') && groups.has('elementary') && groups.has('youth');
    }
    case 'points_1000':
      return stats.totalPoints >= 1000;

    // 추가 뱃지
    case 'streak_14':
      return stats.currentStreak >= 14 || stats.longestStreak >= 14;
    case 'streak_60':
      return stats.currentStreak >= 60 || stats.longestStreak >= 60;
    case 'count_200':
      return stats.totalCompletions >= 200;
    case 'count_500':
      return stats.totalCompletions >= 500;
    case 'all_difficulty': {
      const difficulties = new Set(completions.map((c) => c.difficulty));
      return difficulties.has('easy') && difficulties.has('hard') && difficulties.has('expert');
    }
    case 'points_5000':
      return stats.totalPoints >= 5000;
    case 'points_10000':
      return stats.totalPoints >= 10000;
    case 'weekly_perfect':
      return checkPerfectWeekFromCompletions(completions);

    default:
      return false;
  }
}
