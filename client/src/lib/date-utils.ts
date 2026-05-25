export interface WeekRange {
  start: Date;
  end: Date;
}

export function getCurrentWeekRange(date = new Date()): WeekRange {
  const current = new Date(date);
  const currentDay = current.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Calculate the start of the week (Monday)
  // 월요일 기준: 일요일(0)이면 6일 전, 월-토(1-6)이면 (currentDay-1)일 전
  const daysToSubtract = currentDay === 0 ? 6 : currentDay - 1;
  const start = new Date(current);
  start.setDate(current.getDate() - daysToSubtract);
  start.setHours(0, 0, 0, 0);
  
  // Calculate the end of the week (Sunday)
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

export function getLastWeekRange(date = new Date()): WeekRange {
  const current = getCurrentWeekRange(date);
  const start = new Date(current.start);
  start.setDate(current.start.getDate() - 7);
  
  const end = new Date(current.end);
  end.setDate(current.end.getDate() - 7);
  
  return { start, end };
}

export function getNextWeekRange(date = new Date()): WeekRange {
  const current = getCurrentWeekRange(date);
  const start = new Date(current.start);
  start.setDate(current.start.getDate() + 7);
  
  const end = new Date(current.end);
  end.setDate(current.end.getDate() + 7);
  
  return { start, end };
}

export function formatDateRange(start: Date, end: Date): string {
  const startMonth = start.getMonth() + 1;
  const startDate = start.getDate();
  const endMonth = end.getMonth() + 1;
  const endDate = end.getDate();
  
  if (startMonth === endMonth) {
    return `${startMonth}월 ${startDate}일 - ${endDate}일`;
  } else {
    return `${startMonth}월 ${startDate}일 - ${endMonth}월 ${endDate}일`;
  }
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dayName = dayNames[date.getDay()];
  
  return `${year}년 ${month}월 ${day}일 (${dayName})`;
}

export function isDateInRange(date: Date, range: WeekRange): boolean {
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  return checkDate >= range.start && checkDate <= range.end;
}

// =====================================================================
// 사이클 wrap — 엑셀 데이터(2024~2033/2034) 이후에도 끊김 없이 반복
// =====================================================================
//
// 부서별 사이클 길이:
// - 유치부:   52주  (1년)
// - 초등부:   104주 (2년)
// - 중고등부: 156주 (3년)
//
// 동작: 데이터의 첫 verse 날짜를 0주차 기준점으로 잡고, 타깃 주차 인덱스를
// 계산해서 `index % cycleLen` 으로 lookup. 데이터가 cycleLen보다 길면
// (예: 유치부 520주) 전체 데이터를 사용하지 않고 첫 cycleLen만 사이클로 사용.
//
// 단, 데이터 범위 안에 정확히 매칭되는 verse가 있으면 그것을 우선 사용 →
// 기존 동작 보존.

export const CYCLE_WEEKS: Record<'kindergarten' | 'elementary' | 'youth', number> = {
  kindergarten: 52,
  elementary: 104,
  youth: 156,
};

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

interface MinimalVerse {
  date: string;
}

/**
 * 주어진 타깃 날짜에 해당하는 verse를 반환한다.
 * 1) 데이터 범위 안이면 정확한 주차 매칭(기존 동작)
 * 2) 데이터 범위 밖이면 cycleLen 단위로 wrap
 */
export function getVerseForWeek<T extends MinimalVerse>(
  verses: T[],
  targetDate: Date,
  ageGroup: 'kindergarten' | 'elementary' | 'youth'
): T | null {
  if (!verses || verses.length === 0) return null;

  const sorted = [...verses].sort((a, b) => a.date.localeCompare(b.date));
  const targetRange = getCurrentWeekRange(targetDate);

  // 1) 정확 매칭
  const exact = sorted.find(v => {
    const d = new Date(v.date.includes('T') ? v.date : v.date + 'T00:00:00');
    return isDateInRange(d, targetRange);
  });
  if (exact) return exact;

  // 2) 사이클 wrap
  const firstDate = new Date(sorted[0].date.includes('T') ? sorted[0].date : sorted[0].date + 'T00:00:00');
  const firstWeekStart = getCurrentWeekRange(firstDate).start;
  const targetWeekStart = targetRange.start;

  // 데이터 시작 이전이면 표시 안 함
  if (targetWeekStart.getTime() < firstWeekStart.getTime()) return null;

  const weekIndex = Math.round((targetWeekStart.getTime() - firstWeekStart.getTime()) / ONE_WEEK_MS);
  const cycleLen = Math.min(CYCLE_WEEKS[ageGroup], sorted.length);

  return sorted[weekIndex % cycleLen] ?? null;
}

/**
 * 월암송 wrap (12개월 사이클)
 */
export function getMonthlyVerseForMonth<T extends { year: number; month: number }>(
  monthlyVerses: T[],
  targetYear: number,
  targetMonth: number // 1~12
): T | null {
  if (!monthlyVerses || monthlyVerses.length === 0) return null;

  // 1) 정확 매칭
  const exact = monthlyVerses.find(m => m.year === targetYear && m.month === targetMonth);
  if (exact) return exact;

  // 2) 사이클 wrap — 동일 월(1~12)을 가진 가장 최근 데이터 사용
  const sameMonth = monthlyVerses
    .filter(m => m.month === targetMonth)
    .sort((a, b) => b.year - a.year);

  return sameMonth[0] ?? null;
}
