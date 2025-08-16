import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LocalStorage } from "@/lib/storage";
import { getCurrentWeekRange, getLastWeekRange, getNextWeekRange, isDateInRange } from "@/lib/date-utils";
import type { Verse, AgeGroup } from "@shared/schema";

export interface WeeklyVerses {
  lastWeek: Verse | null;
  thisWeek: Verse | null;
  nextWeek: Verse | null;
}

export function useVerses(ageGroup?: AgeGroup) {
  return useQuery({
    queryKey: ['verses', ageGroup],
    queryFn: () => {
      const verses = ageGroup 
        ? LocalStorage.getVersesByAgeGroup(ageGroup)
        : LocalStorage.getVerses();
      return verses;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useWeeklyVerses(ageGroup: AgeGroup) {
  return useQuery({
    queryKey: ['weekly-verses', ageGroup],
    queryFn: (): WeeklyVerses => {
      const verses = LocalStorage.getVersesByAgeGroup(ageGroup);
      
      // 현재 날짜 기준으로 정확한 주차 계산
      const currentDate = new Date();
      const lastWeekRange = getLastWeekRange(currentDate);    // 지난주
      const thisWeekRange = getCurrentWeekRange(currentDate); // 이번주 
      const nextWeekRange = getNextWeekRange(currentDate);    // 다음주
      
      // 날짜 범위에 맞는 암송구절 찾기
      const lastWeek = verses.find(verse => {
        const verseDate = new Date(verse.date + 'T00:00:00');
        return isDateInRange(verseDate, lastWeekRange);
      }) || null;
      
      const thisWeek = verses.find(verse => {
        const verseDate = new Date(verse.date + 'T00:00:00');
        return isDateInRange(verseDate, thisWeekRange);
      }) || null;
      
      const nextWeek = verses.find(verse => {
        const verseDate = new Date(verse.date + 'T00:00:00');
        return isDateInRange(verseDate, nextWeekRange);
      }) || null;
      
      console.log(`=== ${ageGroup} Weekly Verses ===`);
      console.log('현재 날짜:', currentDate.toLocaleDateString('ko-KR'));
      console.log('지난주 범위:', lastWeekRange.start.toLocaleDateString('ko-KR'), '~', lastWeekRange.end.toLocaleDateString('ko-KR'));
      console.log('이번주 범위:', thisWeekRange.start.toLocaleDateString('ko-KR'), '~', thisWeekRange.end.toLocaleDateString('ko-KR'));
      console.log('다음주 범위:', nextWeekRange.start.toLocaleDateString('ko-KR'), '~', nextWeekRange.end.toLocaleDateString('ko-KR'));
      console.log('지난주 구절:', lastWeek?.reference || '없음', '-', lastWeek?.content || '');
      console.log('이번주 구절:', thisWeek?.reference || '없음', '-', thisWeek?.content || '');
      console.log('다음주 구절:', nextWeek?.reference || '없음', '-', nextWeek?.content || '');
      
      // 매칭되는 구절이 없으면 가장 가까운 구절들을 찾아보기 (디버깅용)
      if (!thisWeek && verses.length > 0) {
        console.log('=== 이번주 매칭 실패 - 전체 구절 날짜 확인 ===');
        const sortedVerses = verses
          .map(v => ({ ...v, date: new Date(v.date + 'T00:00:00') }))
          .sort((a, b) => a.date.getTime() - b.date.getTime());
        
        console.log('첫 구절 날짜:', sortedVerses[0]?.date.toLocaleDateString('ko-KR'));
        console.log('마지막 구절 날짜:', sortedVerses[sortedVerses.length - 1]?.date.toLocaleDateString('ko-KR'));
        
        // 현재 주차와 가장 가까운 구절들 찾기
        const currentWeekStart = thisWeekRange.start.getTime();
        const closestVerses = sortedVerses
          .map(v => ({ ...v, distance: Math.abs(v.date.getTime() - currentWeekStart) }))
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 3);
        
        console.log('가장 가까운 구절들:');
        closestVerses.forEach((v, i) => {
          console.log(`${i + 1}. ${v.date.toLocaleDateString('ko-KR')} - ${v.reference}: ${v.content.substring(0, 30)}...`);
        });
      }
      
      return { lastWeek, thisWeek, nextWeek };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useVersesStats() {
  return useQuery({
    queryKey: ['verses-stats'],
    queryFn: () => {
      const verses = LocalStorage.getVerses();
      const events = LocalStorage.getEventsSync();
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      // 전체 암송구절 수
      const totalVerses = verses.length;
      
      // 이번 주 일정 수
      const currentWeekRange = getCurrentWeekRange(currentDate);
      const thisWeekEvents = events.filter(event => {
        const eventDate = new Date(event.date + 'T00:00:00');
        return isDateInRange(eventDate, currentWeekRange);
      }).length;
      
      // 이번 주 암송구절 수
      const thisWeekVerses = verses.filter(verse => {
        const verseDate = new Date(verse.date + 'T00:00:00');
        return isDateInRange(verseDate, currentWeekRange);
      }).length;
      
      // 이번 달 암송 현황 (기존 로직 유지)
      const monthlyVerses = verses.filter(verse => {
        const verseDate = new Date(verse.date + 'T00:00:00');
        return verseDate.getMonth() === currentMonth && verseDate.getFullYear() === currentYear;
      });
      
      const completed = monthlyVerses.filter(verse => {
        const verseDate = new Date(verse.date + 'T00:00:00');
        return verseDate < currentDate;
      }).length;
      
      const inProgress = monthlyVerses.filter(verse => {
        const verseDate = new Date(verse.date + 'T00:00:00');
        return isDateInRange(verseDate, currentWeekRange);
      }).length;
      
      const upcoming = monthlyVerses.filter(verse => {
        const verseDate = new Date(verse.date + 'T00:00:00');
        return verseDate > currentDate;
      }).length;
      
      return { 
        totalVerses, 
        thisWeekEvents, 
        thisWeekVerses,
        completed, 
        inProgress, 
        upcoming 
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
