import { Preferences } from '@capacitor/preferences';
import type { DifficultyLevel } from '@/lib/flashcard-utils';

// Storage keys
// Capacitor Preferences는 Android(SharedPreferences)/iOS(UserDefaults) 기반으로
// 앱 업데이트 시에도 데이터가 유지됨. 사용자가 "앱 데이터 삭제" 또는 재설치해야만 초기화됨.
const KEYS = {
  completions: 'cm_progress_completions',
  stats: 'cm_progress_stats',
  unlockedBadges: 'cm_progress_badges',
  dataVersion: 'cm_progress_data_version',
} as const;

// 데이터 스키마 버전 (향후 마이그레이션 대응)
const CURRENT_DATA_VERSION = 1;

// --- Types ---

export interface CompletionRecord {
  verseId: number;
  ageGroup: string;
  difficulty: DifficultyLevel;
  completedAt: number; // timestamp
  pointsEarned: number;
}

export interface UserStats {
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  freezesUsed: number;
  lastActiveDate: string; // 'YYYY-MM-DD'
  totalCompletions: number;
}

export interface DayStatus {
  date: string; // 'YYYY-MM-DD'
  completed: boolean;
  count: number;
}

const DEFAULT_STATS: UserStats = {
  totalPoints: 0,
  currentStreak: 0,
  longestStreak: 0,
  freezesUsed: 0,
  lastActiveDate: '',
  totalCompletions: 0,
};

// --- Helpers ---

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

// --- CRUD ---

export async function getCompletions(): Promise<CompletionRecord[]> {
  try {
    const { value } = await Preferences.get({ key: KEYS.completions });
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

export async function getUserStats(): Promise<UserStats> {
  try {
    const { value } = await Preferences.get({ key: KEYS.stats });
    return value ? { ...DEFAULT_STATS, ...JSON.parse(value) } : { ...DEFAULT_STATS };
  } catch {
    return { ...DEFAULT_STATS };
  }
}

export async function saveUserStats(stats: UserStats): Promise<void> {
  await Preferences.set({ key: KEYS.stats, value: JSON.stringify(stats) });
}

export async function getUnlockedBadgeIds(): Promise<string[]> {
  try {
    const { value } = await Preferences.get({ key: KEYS.unlockedBadges });
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

export async function saveUnlockedBadgeIds(ids: string[]): Promise<void> {
  await Preferences.set({ key: KEYS.unlockedBadges, value: JSON.stringify(ids) });
}

// --- Core Operations ---

export async function saveCompletion(record: CompletionRecord): Promise<UserStats> {
  const completions = await getCompletions();
  const updated = [...completions, record];
  await Preferences.set({ key: KEYS.completions, value: JSON.stringify(updated) });

  // 스트릭 & 통계 업데이트
  const stats = await getUserStats();
  const newStats = updateStreak({
    ...stats,
    totalPoints: stats.totalPoints + record.pointsEarned,
    totalCompletions: stats.totalCompletions + 1,
  });
  await saveUserStats(newStats);
  return newStats;
}

function updateStreak(stats: UserStats): UserStats {
  const today = todayString();
  const yesterday = yesterdayString();

  if (stats.lastActiveDate === today) {
    // 이미 오늘 기록 있으면 스트릭 유지
    return { ...stats, lastActiveDate: today };
  }

  if (stats.lastActiveDate === yesterday) {
    // 어제 활동 → 스트릭 +1
    const newStreak = stats.currentStreak + 1;
    return {
      ...stats,
      currentStreak: newStreak,
      longestStreak: Math.max(stats.longestStreak, newStreak),
      lastActiveDate: today,
    };
  }

  // 하루 이상 빠짐 → 스트릭 리셋 (freeze 체크)
  const dayBeforeYesterday = new Date();
  dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);
  const dby = dayBeforeYesterday.toISOString().slice(0, 10);

  if (stats.lastActiveDate === dby && stats.freezesUsed < 4) {
    // 이틀 전 활동 + freeze 남아있음 → freeze 사용, 스트릭 유지
    const newStreak = stats.currentStreak + 1;
    return {
      ...stats,
      currentStreak: newStreak,
      longestStreak: Math.max(stats.longestStreak, newStreak),
      freezesUsed: stats.freezesUsed + 1,
      lastActiveDate: today,
    };
  }

  // 스트릭 리셋
  return {
    ...stats,
    currentStreak: 1,
    longestStreak: Math.max(stats.longestStreak, 1),
    lastActiveDate: today,
  };
}

// 주간 도트 그리드 데이터 (월~일 7일)
export async function getWeeklyGrid(): Promise<DayStatus[]> {
  const completions = await getCompletions();
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=일 ~ 6=토
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const grid: DayStatus[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + mondayOffset + i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayCompletions = completions.filter(
      (c) => new Date(c.completedAt).toISOString().slice(0, 10) === dateStr
    );
    grid.push({
      date: dateStr,
      completed: dayCompletions.length > 0,
      count: dayCompletions.length,
    });
  }
  return grid;
}

// 오늘의 완료 기록
export async function getTodayCompletions(): Promise<CompletionRecord[]> {
  const completions = await getCompletions();
  const today = todayString();
  return completions.filter(
    (c) => new Date(c.completedAt).toISOString().slice(0, 10) === today
  );
}

// 특정 난이도별 총 완료 횟수
export async function getCompletionsByDifficulty(difficulty: DifficultyLevel): Promise<number> {
  const completions = await getCompletions();
  return completions.filter((c) => c.difficulty === difficulty).length;
}

// 고유 부서 완료 여부 (3개 부서 모두)
export async function hasCompletedAllAgeGroups(): Promise<boolean> {
  const completions = await getCompletions();
  const groups = new Set(completions.map((c) => c.ageGroup));
  return groups.has('kindergarten') && groups.has('elementary') && groups.has('youth');
}

// --- 데이터 버전 관리 & 마이그레이션 ---

export async function ensureDataVersion(): Promise<void> {
  const { value } = await Preferences.get({ key: KEYS.dataVersion });
  const version = value ? parseInt(value, 10) : 0;

  if (version < CURRENT_DATA_VERSION) {
    // 향후 스키마 변경 시 마이그레이션 로직 추가
    // if (version < 2) { await migrateV1toV2(); }
    await Preferences.set({
      key: KEYS.dataVersion,
      value: String(CURRENT_DATA_VERSION),
    });
  }
}

// --- 백업 & 복원 (JSON 기반) ---

export interface ProgressBackup {
  version: number;
  exportedAt: number;
  completions: CompletionRecord[];
  stats: UserStats;
  unlockedBadges: string[];
}

// 전체 진행 데이터를 JSON 문자열로 내보내기
export async function exportProgressData(): Promise<string> {
  const [completions, stats, badges] = await Promise.all([
    getCompletions(),
    getUserStats(),
    getUnlockedBadgeIds(),
  ]);

  const backup: ProgressBackup = {
    version: CURRENT_DATA_VERSION,
    exportedAt: Date.now(),
    completions,
    stats,
    unlockedBadges: badges,
  };

  return JSON.stringify(backup);
}

// JSON 문자열에서 진행 데이터 복원
export async function importProgressData(jsonStr: string): Promise<boolean> {
  try {
    const backup: ProgressBackup = JSON.parse(jsonStr);

    if (!backup.completions || !backup.stats || !backup.unlockedBadges) {
      return false;
    }

    await Promise.all([
      Preferences.set({ key: KEYS.completions, value: JSON.stringify(backup.completions) }),
      saveUserStats(backup.stats),
      saveUnlockedBadgeIds(backup.unlockedBadges),
      Preferences.set({ key: KEYS.dataVersion, value: String(CURRENT_DATA_VERSION) }),
    ]);

    return true;
  } catch {
    return false;
  }
}

// 완벽한 주 달성 여부 (월~일 7일 모두 암송)
export async function hasAnyPerfectWeek(): Promise<boolean> {
  const completions = await getCompletions();
  return checkPerfectWeekFromCompletions(completions);
}

export function checkPerfectWeekFromCompletions(completions: CompletionRecord[]): boolean {
  if (completions.length < 7) return false;

  // 완료 날짜를 Set으로 수집
  const completedDates = new Set(
    completions.map((c) => new Date(c.completedAt).toISOString().slice(0, 10))
  );

  // 가장 오래된/최신 날짜 범위 내에서 월~일 7일 연속 체크
  const sortedDates = Array.from(completedDates).sort();
  const firstDate = new Date(sortedDates[0] + 'T00:00:00');
  const lastDate = new Date(sortedDates[sortedDates.length - 1] + 'T00:00:00');

  // 각 월요일부터 시작해서 7일 모두 있는지 확인
  const d = new Date(firstDate);
  // 첫 월요일로 이동
  const dayOfWeek = d.getDay();
  const toMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek;
  d.setDate(d.getDate() + toMonday);

  while (d <= lastDate) {
    let allDone = true;
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(d);
      checkDate.setDate(d.getDate() + i);
      const dateStr = checkDate.toISOString().slice(0, 10);
      if (!completedDates.has(dateStr)) {
        allDone = false;
        break;
      }
    }
    if (allDone) return true;
    d.setDate(d.getDate() + 7); // 다음 주 월요일
  }

  return false;
}
