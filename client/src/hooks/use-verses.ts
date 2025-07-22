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
      
      const lastWeekRange = getLastWeekRange();
      const thisWeekRange = getCurrentWeekRange();
      const nextWeekRange = getNextWeekRange();
      
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
      
      return { lastWeek, thisWeek, nextWeek };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useVersesStats() {
  return useQuery({
    queryKey: ['verses-stats'],
    queryFn: () => {
      const verses = LocalStorage.getVerses();
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      // Filter verses for current month
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
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        return verseDate >= weekStart && verseDate <= weekEnd;
      }).length;
      
      const upcoming = monthlyVerses.filter(verse => {
        const verseDate = new Date(verse.date + 'T00:00:00');
        return verseDate > currentDate;
      }).length;
      
      return { completed, inProgress, upcoming };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
