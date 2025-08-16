import { useQuery } from "@tanstack/react-query";
import { LocalStorage } from "@/lib/storage";
import type { MonthlyVerse } from "@shared/schema";

export function useMonthlyVerse(year: number, month: number) {
  return useQuery({
    queryKey: ['monthlyVerse', year, month],
    queryFn: () => {
      const monthlyVerses = LocalStorage.getMonthlyVerses();
      console.log('🔍 월암송 검색:', `${year}년 ${month}월`);
      console.log('📚 저장된 월암송 데이터:', monthlyVerses);
      
      // 1차: 정확한 년도와 월 매칭
      let verse = monthlyVerses.find(v => v.year === year && v.month === month);
      
      // 2차: 연도 무관하게 월만 매칭 (다른 연도의 같은 월 구절 사용)
      if (!verse) {
        verse = monthlyVerses.find(v => v.month === month);
        if (verse) {
          console.log(`✅ ${verse.year}년 ${month}월 구절을 ${year}년에 적용`);
        }
      }
      
      console.log('📖 찾은 월암송:', verse);
      return verse || null;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAllMonthlyVerses() {
  return useQuery({
    queryKey: ['monthlyVerses'],
    queryFn: () => LocalStorage.getMonthlyVerses(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
} 