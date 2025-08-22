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
      // 기본 암송구절 데이터 (현재 주차 기준으로 3부서 x 지난/이번/다음 주)
      const pad = (n: number) => String(n).padStart(2, '0');
      const toDateStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
      const today = new Date();
      const thisSunday = new Date(today);
      thisSunday.setDate(today.getDate() - today.getDay());
      thisSunday.setHours(0,0,0,0);
      const lastSunday = new Date(thisSunday);
      lastSunday.setDate(thisSunday.getDate() - 7);
      const nextSunday = new Date(thisSunday);
      nextSunday.setDate(thisSunday.getDate() + 7);

      const verseTriplet = (ageGroup: 'kindergarten'|'elementary'|'youth', baseId: number) => ([
        { id: baseId + 0, date: toDateStr(lastSunday), reference: '시편 23:1', content: '여호와는 나의 목자시니 내게 부족함이 없으리로다', ageGroup },
        { id: baseId + 1, date: toDateStr(thisSunday), reference: '요한복음 3:16', content: '하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 그를 믿는 자마다 멸망하지 않고 영생을 얻게 하려 하심이라', ageGroup },
        { id: baseId + 2, date: toDateStr(nextSunday), reference: '잠언 3:5', content: '너는 마음을 다하여 여호와를 신뢰하고 네 명철을 의지하지 말라', ageGroup },
      ] as Verse[]);

      const fallbackVerses: Verse[] = [
        ...verseTriplet('kindergarten', 1),
        ...verseTriplet('elementary', 101),
        ...verseTriplet('youth', 201),
      ];

      // 기본 이벤트 데이터 (현재 주/월 기준으로 동적 생성)
      const today2 = new Date();
      const thisSunday2 = new Date(today2);
      thisSunday2.setDate(today2.getDate() - today2.getDay());
      thisSunday2.setHours(0,0,0,0);
      const nextSunday2 = new Date(thisSunday2);
      nextSunday2.setDate(thisSunday2.getDate()+7);
      const threeDayStart = new Date(today2);
      threeDayStart.setDate(today2.getDate()+2);
      const threeDayEnd = new Date(threeDayStart);
      threeDayEnd.setDate(threeDayStart.getDate()+2);

      const fallbackEvents: Event[] = [
        {
          id: 1,
          date: toDateStr(thisSunday2),
          title: '주일학교 예배',
          description: '주일학교 정기 예배',
          ageGroup: null,
          startDate: null,
          endDate: null
        },
        {
          id: 2,
          date: toDateStr(threeDayStart),
          title: '부서 수련회',
          description: '2박 3일 일정',
          ageGroup: null,
          startDate: toDateStr(threeDayStart),
          endDate: toDateStr(threeDayEnd)
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

  // 폴백(이벤트 전용): 엑셀/시드 실패 시 최소한의 일정만 복구
  static loadFallbackEventsOnly(): void {
    console.log('🔄 폴백(이벤트 전용) 시작...');

    try {
      const pad = (n: number) => String(n).padStart(2, '0');
      const toDateStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
      // 날짜 유틸
      const fromYMD = (y: number, m: number, d: number) => toDateStr(new Date(y, m - 1, d));

      // 최초 설치 시 표시될 기본 일정
      const fallbackEvents: Event[] = [
        {
          id: 1,
          date: fromYMD(2025, 8, 15),
          title: '7차 하계수양회',
          description: '장소: 갈릴리수양관',
          ageGroup: null,
          startDate: fromYMD(2025, 8, 15),
          endDate: fromYMD(2025, 8, 19)
        },
        {
          id: 2,
          date: fromYMD(2025, 8, 19),
          title: '여름 사무엘학교',
          description: '장소: 갈릴리수양관',
          ageGroup: null,
          startDate: fromYMD(2025, 8, 19),
          endDate: fromYMD(2025, 8, 24)
        },
        {
          id: 3,
          date: fromYMD(2025, 9, 13),
          title: '교사교육',
          description: '장소: 청주남부교회',
          ageGroup: null,
          startDate: fromYMD(2025, 9, 13),
          endDate: fromYMD(2025, 9, 13)
        },
        {
          id: 4,
          date: fromYMD(2025, 9, 14),
          title: '학부모교육',
          description: '장소: 청주남부교회',
          ageGroup: null,
          startDate: fromYMD(2025, 9, 14),
          endDate: fromYMD(2025, 9, 14)
        },
        {
          id: 5,
          date: fromYMD(2025, 9, 26),
          title: '추계수양회',
          description: '장소: 갈릴리수양관',
          ageGroup: null,
          startDate: fromYMD(2025, 9, 26),
          endDate: fromYMD(2025, 9, 30)
        },
        {
          id: 6,
          date: fromYMD(2025, 9, 29),
          title: '전도인수련회',
          description: '장소: 갈릴리수양관',
          ageGroup: null,
          startDate: fromYMD(2025, 9, 29),
          endDate: fromYMD(2025, 10, 2)
        },
        {
          id: 7,
          date: fromYMD(2025, 10, 20),
          title: '고성 대전도집회 - 우병수P',
          description: '장소: 고성교회',
          ageGroup: null,
          startDate: fromYMD(2025, 10, 20),
          endDate: fromYMD(2025, 10, 26)
        },
        {
          id: 8,
          date: fromYMD(2025, 10, 25),
          title: '전국 중고등부 부장단모임',
          description: '장소: 갈릴리수양관',
          ageGroup: null,
          startDate: fromYMD(2025, 10, 25),
          endDate: fromYMD(2025, 10, 25)
        },
        {
          id: 9,
          date: fromYMD(2025, 10, 27),
          title: '대전도집회 - 최영조P',
          description: '장소: 청주남부교회',
          ageGroup: null,
          startDate: fromYMD(2025, 10, 27),
          endDate: fromYMD(2025, 11, 2)
        },
        {
          id: 10,
          date: fromYMD(2025, 10, 25),
          title: '전국 청년임원수련회',
          description: '장소: 갈릴리수양관',
          ageGroup: null,
          startDate: fromYMD(2025, 10, 25),
          endDate: fromYMD(2025, 10, 25)
        },
        {
          id: 11,
          date: fromYMD(2025, 11, 9),
          title: '달란트 시장',
          description: '장소: 청주남부교회',
          ageGroup: null,
          startDate: fromYMD(2025, 11, 9),
          endDate: fromYMD(2025, 11, 9)
        },
        {
          id: 12,
          date: fromYMD(2025, 11, 10),
          title: '전도인수련회',
          description: '장소: 갈릴리수양관',
          ageGroup: null,
          startDate: fromYMD(2025, 11, 10),
          endDate: fromYMD(2025, 11, 13)
        },
        {
          id: 13,
          date: fromYMD(2025, 12, 14),
          title: '교회학교 졸업식',
          description: '장소: 청주남부교회',
          ageGroup: null,
          startDate: fromYMD(2025, 12, 14),
          endDate: fromYMD(2025, 12, 14)
        },
        {
          id: 14,
          date: fromYMD(2025, 12, 24),
          title: '성도 교제의 밤',
          description: '장소: 청주남부교회',
          ageGroup: null,
          startDate: fromYMD(2025, 12, 24),
          endDate: fromYMD(2025, 12, 24)
        },
        {
          id: 15,
          date: fromYMD(2025, 12, 31),
          title: '2026 동계수련회',
          description: '장소: 일반: 지역총괄교회\n청년: 갈릴리수양관',
          ageGroup: null,
          startDate: fromYMD(2025, 12, 31),
          endDate: fromYMD(2026, 1, 3)
        }
      ];

      void this.saveEvents(fallbackEvents);
      console.log('✅ 폴백(이벤트 전용) 완료:', fallbackEvents.length, '개');
    } catch (error) {
      console.error('❌ 폴백(이벤트 전용) 실패:', error);
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
