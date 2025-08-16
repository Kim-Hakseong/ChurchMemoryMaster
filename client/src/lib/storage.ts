import type { Verse, Event, MonthlyVerse } from "@shared/schema";
import { DatabaseService } from './database';

// 메모리 캐시 (동기 접근용)
let eventsCache: Event[] = [];

export class LocalStorage {
  private static readonly VERSES_KEY = 'verses';
  private static readonly EVENTS_KEY = 'events';
  private static readonly MONTHLY_VERSES_KEY = 'monthlyVerses';
  private static readonly INITIALIZED_KEY = 'initialized';

  // Verse methods
  static getVerses(): Verse[] {
    try {
      const stored = localStorage.getItem(this.VERSES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get verses from localStorage:', error);
      return [];
    }
  }

  static getVersesByAgeGroup(ageGroup: string): Verse[] {
    try {
      const stored = localStorage.getItem(this.VERSES_KEY);
      const verses = stored ? JSON.parse(stored) : [];
      return verses.filter((verse: Verse) => verse.ageGroup === ageGroup);
    } catch (error) {
      console.error('Failed to get verses by age group from localStorage:', error);
      return [];
    }
  }

  static saveVerses(verses: Verse[]): void {
    try {
      localStorage.setItem(this.VERSES_KEY, JSON.stringify(verses));
    } catch (error) {
      console.error('Failed to save verses to localStorage:', error);
    }
  }

  // 파일 시스템 초기화
  static async initializeEvents(): Promise<void> {
    try {
      const db = DatabaseService.getInstance();
      await db.initialize();
      console.log('✅ 파일 시스템 초기화 완료');
    } catch (error) {
      console.error('❌ 파일 시스템 초기화 실패:', error);
    }
  }

  // Event methods - 파일 시스템 기반
  static async getEvents(): Promise<Event[]> {
    try {
      const db = DatabaseService.getInstance();
      const events = await db.getAllEvents();
      eventsCache = events; // 캐시 업데이트
      return events;
    } catch (error) {
      console.error('❌ 이벤트 로드 실패:', error);
      return eventsCache; // 실패 시 캐시 반환
    }
  }

  // 동기 접근용 (캐시에서 가져오기)
  static getEventsSync(): Event[] {
    return eventsCache;
  }

  static async saveEvent(event: Omit<Event, 'id'>): Promise<number | null> {
    try {
      const db = DatabaseService.getInstance();
      const eventId = await db.saveEvent(event);
      
      // 캐시 업데이트
      if (eventId) {
        const newEvent: Event = { ...event, id: eventId };
        eventsCache = [...eventsCache, newEvent];
      }
      
      return eventId;
    } catch (error) {
      console.error('❌ 이벤트 저장 실패:', error);
      return null;
    }
  }

  static async deleteEvent(eventId: number): Promise<boolean> {
    try {
      const db = DatabaseService.getInstance();
      const success = await db.deleteEvent(eventId);
      
      // 캐시 업데이트
      if (success) {
        eventsCache = eventsCache.filter(event => event.id !== eventId);
      }
      
      return success;
    } catch (error) {
      console.error('❌ 이벤트 삭제 실패:', error);
      return false;
    }
  }

  static async getEventsForDate(date: Date): Promise<Event[]> {
    try {
      const db = DatabaseService.getInstance();
      return await db.getEventsForDate(date);
    } catch (error) {
      console.error('❌ 날짜별 이벤트 조회 실패:', error);
      return [];
    }
  }

  // 전체 이벤트 일괄 저장(파일에 영구 저장 + 캐시 갱신)
  static async saveEvents(events: Event[]): Promise<void> {
    try {
      const db = DatabaseService.getInstance();
      await db.setAllEvents(events);
      eventsCache = events;
      console.log('💾 전체 이벤트 저장 완료:', events.length + '개');
    } catch (error) {
      console.error('❌ 전체 이벤트 저장 실패:', error);
    }
  }

  // Monthly Verse methods
  static getMonthlyVerses(): MonthlyVerse[] {
    try {
      const stored = localStorage.getItem(this.MONTHLY_VERSES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get monthly verses from localStorage:', error);
      return [];
    }
  }

  static saveMonthlyVerses(monthlyVerses: MonthlyVerse[]): void {
    try {
      localStorage.setItem(this.MONTHLY_VERSES_KEY, JSON.stringify(monthlyVerses));
    } catch (error) {
      console.error('Failed to save monthly verses to localStorage:', error);
    }
  }

  static getMonthlyVerseForMonth(year: number, month: number): MonthlyVerse | null {
    const monthlyVerses = this.getMonthlyVerses();
    return monthlyVerses.find(v => v.year === year && v.month === month) || null;
  }

  // Initialization methods - 엑셀 파일 파싱만 사용
  static initializeData(): void {
    const isInitialized = localStorage.getItem(this.INITIALIZED_KEY);
    
    if (!isInitialized) {
      console.log('LocalStorage 초기화 - 엑셀 파일 파싱 대기 중...');
      localStorage.setItem(this.INITIALIZED_KEY, 'true');
    }
  }

  // 폴백 메커니즘: 엑셀 파싱 실패 시 기본 데이터 로드
  static loadFallbackData(): void {
    console.log('🔄 폴백 메커니즘: 기본 데이터 로드 시작...');
    
    try {
      // 기본 암송구절 데이터
      const fallbackVerses: Verse[] = [
        {
          id: 1,
          date: '2025-01-20',
          reference: '요한복음 3:16',
          content: '하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 그를 믿는 자마다 멸망하지 않고 영생을 얻게 하려 하심이라',
          ageGroup: 'elementary'
        },
        {
          id: 2,
          date: '2025-01-27',
          reference: '시편 119:105',
          content: '주의 말씀은 내 발에 등이요 내 길에 빛이니이다',
          ageGroup: 'elementary'
        }
      ];

      // 기본 이벤트 데이터
      const fallbackEvents: Event[] = [
        {
          id: 1,
          date: '2025-01-26',
          title: '주일학교 예배',
          description: '주일학교 정기 예배',
          ageGroup: null,
          startDate: null,
          endDate: null
        }
      ];

      // 기본 월암송 데이터
      const fallbackMonthlyVerses: MonthlyVerse[] = [
        {
          id: 1,
          year: 2025,
          month: 1,
          reference: '마태복음 28:19-20',
          content: '그러므로 너희는 가서 모든 민족을 제자로 삼아 아버지와 아들과 성령의 이름으로 세례를 베풀고 내가 너희에게 분부한 모든 것을 가르쳐 지키게 하라 볼지어다 내가 세상 끝날까지 너희와 항상 함께 있으리라'
        }
      ];

      // LocalStorage에 저장
      this.saveVerses(fallbackVerses);
      // 이벤트는 파일에도 영구 저장
      // 주의: 비동기지만 초기화 폴백 단계에서는 대기 없이 진행
      void this.saveEvents(fallbackEvents);
      this.saveMonthlyVerses(fallbackMonthlyVerses);

      console.log('✅ 폴백 데이터 로드 완료:');
      console.log(`  - 암송구절: ${fallbackVerses.length}개`);
      console.log(`  - 이벤트: ${fallbackEvents.length}개`);
      console.log(`  - 월암송: ${fallbackMonthlyVerses.length}개`);

    } catch (error) {
      console.error('❌ 폴백 데이터 로드 실패:', error);
    }
  }

  static clearAll(): void {
    try {
      localStorage.removeItem(this.VERSES_KEY);
      // localStorage.removeItem(this.EVENTS_KEY); // 🔒 이벤트는 보존!
      localStorage.removeItem(this.MONTHLY_VERSES_KEY);
      localStorage.removeItem(this.INITIALIZED_KEY);
      
      // 🔒 네이티브 이벤트 메모리 캐시도 보존!
      // (window as any).churchMemoryEventsCache = []; // 이벤트 캐시는 보존
      
      console.log('✅ 구절 데이터만 초기화 (이벤트는 보존)');
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }

  static clearVerseDataOnly(): void {
    try {
      localStorage.removeItem(this.VERSES_KEY);
      localStorage.removeItem(this.MONTHLY_VERSES_KEY);
      localStorage.removeItem(this.INITIALIZED_KEY);
      console.log('✅ 암송 구절 데이터만 초기화');
    } catch (error) {
      console.error('Failed to clear verse data:', error);
    }
  }
}
