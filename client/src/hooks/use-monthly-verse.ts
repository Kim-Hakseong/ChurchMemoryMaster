import { useQuery } from "@tanstack/react-query";
import { LocalStorage } from "@/lib/storage";
import { getMonthlyVerseForMonth } from "@/lib/date-utils";
import type { MonthlyVerse } from "@shared/schema";

export function useMonthlyVerse(year: number, month: number) {
  return useQuery({
    queryKey: ['monthlyVerse', year, month],
    queryFn: () => {
      const monthlyVerses = LocalStorage.getMonthlyVerses();
      // 정확 매칭 → 같은 월의 가장 최근 연도(데이터 끝나도 12개월 사이클로 wrap)
      const verse = getMonthlyVerseForMonth(monthlyVerses, year, month);
      if (verse && verse.year !== year) {
        console.log(`📖 월암송 wrap: ${verse.year}.${month} → ${year}.${month}에 적용`);
      }
      return verse;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useAllMonthlyVerses() {
  return useQuery({
    queryKey: ['monthlyVerses'],
    queryFn: () => LocalStorage.getMonthlyVerses(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
} 