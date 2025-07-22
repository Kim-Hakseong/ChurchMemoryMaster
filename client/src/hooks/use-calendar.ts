import { useQuery } from "@tanstack/react-query";
import { LocalStorage } from "@/lib/storage";
import type { Event } from "@shared/schema";

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: () => LocalStorage.getEvents(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useEventsForDate(date: Date) {
  return useQuery({
    queryKey: ['events', date.toISOString().split('T')[0]],
    queryFn: () => LocalStorage.getEventsForDate(date),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCalendarData(year: number, month: number) {
  return useQuery({
    queryKey: ['calendar', year, month],
    queryFn: () => {
      const events = LocalStorage.getEvents();
      const verses = LocalStorage.getVerses();
      
      // Filter events and verses for the given month
      const monthEvents = events.filter(event => {
        const eventDate = new Date(event.date + 'T00:00:00');
        return eventDate.getFullYear() === year && eventDate.getMonth() === month;
      });
      
      const monthVerses = verses.filter(verse => {
        const verseDate = new Date(verse.date + 'T00:00:00');
        return verseDate.getFullYear() === year && verseDate.getMonth() === month;
      });
      
      return { events: monthEvents, verses: monthVerses };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
