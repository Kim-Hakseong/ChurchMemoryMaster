import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import type { Event } from '@shared/schema';

export class DatabaseService {
  private static instance: DatabaseService;
  private fileName = 'church_events.json';
  private isInitialized = false;

  private constructor() {}

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async initialize(): Promise<void> {
    try {
      if (this.isInitialized) {
        console.log('📁 파일 시스템 이미 초기화됨');
        return;
      }

      const isNative = Capacitor.isNativePlatform();
      console.log('📁 파일 시스템 초기화 시작...', isNative ? '네이티브' : '웹');

      if (!isNative) {
        console.log('💾 웹 환경에서는 localStorage 사용');
        this.isInitialized = true;
        return;
      }

      // 파일 존재 여부 확인 및 생성
      try {
        await this.readEventsFile();
        console.log('📁 기존 이벤트 파일 발견');
      } catch (error) {
        console.log('📁 이벤트 파일이 없어 새로 생성');
        await this.writeEventsFile([]);
      }

      this.isInitialized = true;
      console.log('✅ 파일 시스템 초기화 완료!');

    } catch (error) {
      console.error('❌ 파일 시스템 초기화 실패:', error);
      this.isInitialized = true; // 실패해도 계속 진행
    }
  }

  private async readEventsFile(): Promise<Event[]> {
    const isNative = Capacitor.isNativePlatform();
    
    if (!isNative) {
      const stored = localStorage.getItem('church_events');
      return stored ? JSON.parse(stored) : [];
    }

    // Documents -> External -> Cache 순으로 읽기 시도
    const directories = [Directory.Documents, Directory.External, Directory.Cache];
    
    for (const directory of directories) {
      try {
        const result = await Filesystem.readFile({
          path: this.fileName,
          directory,
          encoding: Encoding.UTF8
        });
        
        const events = JSON.parse(result.data as string);
        console.log(`📁 ${directory}에서 이벤트 파일 읽기 성공:`, events.length + '개');
        return events;
      } catch (error) {
        console.log(`📁 ${directory}에서 읽기 실패, 다음 디렉토리 시도`);
      }
    }
    
    throw new Error('모든 디렉토리에서 파일 읽기 실패');
  }

  private async writeEventsFile(events: Event[]): Promise<void> {
    const isNative = Capacitor.isNativePlatform();
    
    if (!isNative) {
      localStorage.setItem('church_events', JSON.stringify(events));
      console.log('💾 localStorage에 이벤트 저장:', events.length + '개');
      return;
    }

    const data = JSON.stringify(events, null, 2);
    
    // Documents -> External -> Cache 순으로 쓰기 시도
    const directories = [Directory.Documents, Directory.External, Directory.Cache];
    
    for (const directory of directories) {
      try {
        await Filesystem.writeFile({
          path: this.fileName,
          data,
          directory,
          encoding: Encoding.UTF8
        });
        
        console.log(`📁 ${directory}에 이벤트 파일 저장 성공:`, events.length + '개');
        return;
      } catch (error) {
        console.warn(`⚠️ ${directory}에 저장 실패, 다음 디렉토리 시도`);
      }
    }
    
    throw new Error('모든 디렉토리에 파일 저장 실패');
  }

  // 전체 이벤트를 한 번에 덮어쓰기 저장 (공개 API)
  async setAllEvents(events: Event[]): Promise<void> {
    try {
      await this.writeEventsFile(events);
      console.log('📁 이벤트 파일 전체 업데이트:', events.length + '개');
    } catch (error) {
      console.error('❌ 이벤트 전체 저장 실패:', error);
      throw error;
    }
  }

  async getAllEvents(): Promise<Event[]> {
    try {
      return await this.readEventsFile();
    } catch (error) {
      console.error('❌ 이벤트 로드 실패:', error);
      return [];
    }
  }

  async saveEvent(event: Omit<Event, 'id'>): Promise<number | null> {
    try {
      const events = await this.getAllEvents();
      const newEvent: Event = { ...event, id: Date.now() };
      const updatedEvents = [...events, newEvent];
      
      await this.writeEventsFile(updatedEvents);
      console.log('📁 이벤트 파일에 저장 완료, ID:', newEvent.id);
      
      return newEvent.id;
    } catch (error) {
      console.error('❌ 이벤트 저장 실패:', error);
      return null;
    }
  }

  async deleteEvent(eventId: number): Promise<boolean> {
    try {
      const events = await this.getAllEvents();
      const updatedEvents = events.filter(e => e.id !== eventId);
      
      if (updatedEvents.length === events.length) {
        console.log('⚠️ 삭제할 이벤트를 찾을 수 없음');
        return false;
      }
      
      await this.writeEventsFile(updatedEvents);
      console.log('📁 이벤트 파일에서 삭제 완료');
      
      return true;
    } catch (error) {
      console.error('❌ 이벤트 삭제 실패:', error);
      return false;
    }
  }

  async getEventsForDate(date: Date): Promise<Event[]> {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const allEvents = await this.getAllEvents();
      
      return allEvents.filter(event => {
        // 기본 이벤트 날짜 확인
        if (event.date === dateStr) {
          return true;
        }
        
        // 기간 이벤트인 경우 해당 날짜가 기간 내에 있는지 확인
        if (event.startDate && event.endDate) {
          return dateStr >= event.startDate && dateStr <= event.endDate;
        }
        
        return false;
      });

    } catch (error) {
      console.error('❌ 날짜별 이벤트 조회 실패:', error);
      return [];
    }
  }

  async close(): Promise<void> {
    // 파일 시스템은 별도 종료 과정 불필요
    console.log('📁 파일 시스템 사용 완료');
  }
} 