// Calendar event cleaner utility
import { LocalStorage } from './storage';

/**
 * 새벽 1시 기준으로 현재 기준일을 계산
 * 예: 2025-07-25 00:30 → 기준일은 2025-07-24
 *     2025-07-25 01:30 → 기준일은 2025-07-25
 */
function getCurrentBaseDate(): string {
  const now = new Date();

  const formatLocalDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // 현재 시간이 새벽 1시 이전이면 전날을 기준일로 사용 (로컬 기준)
  if (now.getHours() < 1) {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    return formatLocalDate(yesterday);
  }

  return formatLocalDate(now);
}

/**
 * 지난 일정들을 자동 삭제
 * @returns 삭제된 일정 개수
 */
export function cleanPastEvents(): number {
  try {
    console.log('🧹 지난 일정 자동 삭제 시작...');
    
    const currentBaseDate = getCurrentBaseDate();
    console.log('📅 현재 기준일:', currentBaseDate);
    
    // 기존 이벤트 가져오기
        const allEvents = LocalStorage.getEventsSync();
    console.log('📋 전체 이벤트 개수:', allEvents.length);

    if (allEvents.length === 0) {
      console.log('⚠️ 삭제할 이벤트가 없습니다.');
      return 0;
    }
    
    // 현재 기준일 이후의 이벤트만 유지
    const futureEvents = allEvents.filter(event => {
      // 기간 일정인 경우 종료날짜 기준, 일반 일정인 경우 일정 날짜 기준
      const checkDate = event.endDate || event.date;
      const isPastEvent = checkDate < currentBaseDate;
      
      if (isPastEvent) {
        if (event.endDate) {
          console.log(`🗑️ 삭제할 기간 이벤트: ${event.title} (${event.startDate || event.date} ~ ${event.endDate})`);
        } else {
          console.log(`🗑️ 삭제할 일반 이벤트: ${event.title} (${event.date})`);
        }
      }
      
      return !isPastEvent;
    });
    
    // 전역 중복 제거 (동일 이벤트 다수 존재 방지)
    const signature = (ev: any) => `${ev.date}|${ev.title}|${ev.startDate || ''}|${ev.endDate || ''}|${ev.description || ''}`;
    const dedupMap = new Map<string, any>();
    for (const ev of futureEvents) {
      const sig = signature(ev);
      if (!dedupMap.has(sig)) dedupMap.set(sig, ev);
    }
    const deduped = Array.from(dedupMap.values());

    const deletedCount = allEvents.length - deduped.length;
    
    if (deletedCount > 0) {
      // 필터링+중복제거 저장 (비동기 실행, 실패해도 앱은 계속)
      void LocalStorage.saveEvents(deduped);
      console.log(`✅ 지난 일정 ${deletedCount}개 삭제 완료`);
      console.log(`📋 남은 이벤트 개수: ${futureEvents.length}개`);
    } else {
      console.log('✅ 삭제할 지난 일정이 없습니다.');
    }
    
    return deletedCount;
    
  } catch (error) {
    console.error('❌ 지난 일정 삭제 중 오류:', error);
    return 0;
  }
}

/**
 * 지난 일정 삭제를 위한 자동 스케줄러 설정
 * 앱이 활성화될 때마다 실행
 */
export function scheduleEventCleaning(): void {
  try {
    console.log('⏰ 지난 일정 삭제 스케줄러 설정...');
    
    // 즉시 한 번 실행
    cleanPastEvents();
    
    // 매일 새벽 1시 30분에 실행되도록 설정
    const scheduleNextClean = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      tomorrow.setHours(1, 30, 0, 0); // 새벽 1시 30분
      
      const timeUntilNextClean = tomorrow.getTime() - now.getTime();
      
      console.log(`⏰ 다음 자동 삭제 예정: ${tomorrow.toLocaleString('ko-KR')}`);
      console.log(`⏰ ${Math.round(timeUntilNextClean / (1000 * 60 * 60))}시간 후 실행`);
      
      setTimeout(() => {
        console.log('🔄 스케줄된 지난 일정 삭제 실행');
        cleanPastEvents();
        scheduleNextClean(); // 다음 스케줄 설정
      }, timeUntilNextClean);
    };
    
    // 스케줄 시작
    scheduleNextClean();
    
  } catch (error) {
    console.error('❌ 스케줄러 설정 중 오류:', error);
  }
}

/**
 * 수동으로 지난 일정 삭제 (UI에서 호출용)
 */
export function manualCleanPastEvents(): Promise<number> {
  return new Promise((resolve) => {
    try {
      const deletedCount = cleanPastEvents();
      resolve(deletedCount);
    } catch (error) {
      console.error('수동 삭제 실패:', error);
      resolve(0);
    }
  });
} 