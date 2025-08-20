import { useQuery } from "@tanstack/react-query";
import { LocalStorage } from "@/lib/storage";
import type { Event } from "@shared/schema";

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => await LocalStorage.getEvents(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useEventsForDate(date: Date) {
  return useQuery({
    queryKey: ['events', date.toISOString().split('T')[0]],
    queryFn: async () => await LocalStorage.getEventsForDate(date),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCalendarData(year: number, month: number) {
  return useQuery({
    queryKey: ['calendar', year, month],
    queryFn: async () => {
      const events = await LocalStorage.getEvents();
      // 폴백: 이벤트가 0개면 엑셀 템플릿에서라도 초기 로드 재시도하도록 로그만 남김
      if (!events || events.length === 0) {
        console.log('⚠️ 이벤트가 비어있음. App 초기화 시 엑셀/폴백 데이터 로드를 확인하세요.');
      }
      
      // 해당 월의 첫째 날과 마지막 날
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0);
      
      // Filter events for the given month
      const monthEvents = events.filter(event => {
        const eventDate = new Date(event.date + 'T00:00:00');
        
        // 기본 이벤트 날짜가 해당 월에 있는 경우
        if (eventDate.getFullYear() === year && eventDate.getMonth() === month) {
          return true;
        }
        
        // 기간 이벤트인 경우 (startDate, endDate가 있는 경우)
        if (event.startDate && event.endDate) {
          const startDate = new Date(event.startDate + 'T00:00:00');
          const endDate = new Date(event.endDate + 'T00:00:00');
          
          // 이벤트 기간이 해당 월과 겹치는 경우
          return (startDate <= monthEnd && endDate >= monthStart);
        }
        
        return false;
      });
      
      return { events: monthEvents, verses: [] };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
