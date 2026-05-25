// Notification scheduling utilities (local push-style)
import { Capacitor } from '@capacitor/core';

export interface NotificationScheduleItem {
  weekday: number; // 1(sun) ~ 7(sat)
  time: string;    // 'HH:MM'
}

export async function scheduleNotifications(items: NotificationScheduleItem[]): Promise<void> {
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');

    // Permission
    const perm = await LocalNotifications.checkPermissions?.();
    if (!perm || perm.display !== 'granted') {
      await LocalNotifications.requestPermissions();
    }

    // Android: channel 보장
    try { await LocalNotifications.createChannel?.({ id: 'default', name: '일반' }); } catch {}

    // 기존 보류 알림 모두 취소
    try {
      const pending = await LocalNotifications.getPending();
      if (pending?.notifications?.length) {
        await LocalNotifications.cancel({ notifications: pending.notifications.map((n:any)=>({ id: n.id })) });
      }
    } catch {}

    // 스케줄 변환 및 등록
    const notifications = items.map((s, i) => {
      const [hourStr, minuteStr] = (s.time || '09:00').split(':');
      const hour = Math.max(0, Math.min(23, parseInt(hourStr || '0', 10)));
      const minute = Math.max(0, Math.min(59, parseInt(minuteStr || '0', 10)));
      return {
        id: 5000 + i,
        title: '알림',
        body: '암송 말씀과 일정을 확인하세요.',
        schedule: {
          repeats: true,
          allowWhileIdle: true,
          on: { weekday: s.weekday, hour, minute },
        },
      } as any;
    });

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
    }
  } catch (e) {
    console.error('[Notifications] schedule failed:', e);
  }
}

export async function cancelScheduledNotifications(): Promise<void> {
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    const pending = await LocalNotifications.getPending();
    if (pending?.notifications?.length) {
      await LocalNotifications.cancel({ notifications: pending.notifications.map((n:any)=>({ id: n.id })) });
    }
  } catch (e) {
    console.error('[Notifications] cancel failed:', e);
  }
}

export async function rescheduleFromLocalStorage(): Promise<void> {
  try {
    const on = localStorage.getItem('cm_alarm_on') === '1';
    const raw = localStorage.getItem('cm_alarm_schedules');
    const items: NotificationScheduleItem[] = raw ? JSON.parse(raw) : [];
    if (on && items.length > 0) {
      await scheduleNotifications(items);
    }
  } catch (e) {
    console.error('[Notifications] rescheduleFromLocalStorage error:', e);
  }
}

// 캘린더 알림 시간 파싱 헬퍼
function parseTimeString(time: string, fallbackHour: number, fallbackMinute: number): { hour: number; minute: number } {
  const parts = (time || '').split(':');
  const hour = parts[0] ? Math.max(0, Math.min(23, parseInt(parts[0], 10))) : fallbackHour;
  const minute = parts[1] ? Math.max(0, Math.min(59, parseInt(parts[1], 10))) : fallbackMinute;
  return { hour: isNaN(hour) ? fallbackHour : hour, minute: isNaN(minute) ? fallbackMinute : minute };
}

// 캘린더 이벤트 기반 알림 스케줄링
export async function scheduleCalendarNotifications(
  events: Array<{
    id: number;
    title: string;
    date: string;
    startDate?: string | null;
  }>,
  dayOfTime?: string,
  dayBeforeTime?: string,
): Promise<void> {
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');

    const perm = await LocalNotifications.checkPermissions?.();
    if (!perm || perm.display !== 'granted') {
      await LocalNotifications.requestPermissions();
    }

    // Android: 캘린더 전용 채널
    try {
      await LocalNotifications.createChannel?.({
        id: 'calendar',
        name: '캘린더 일정 알림',
        importance: 4,
      });
    } catch {}

    // 기존 캘린더 알림만 취소 (ID 범위 10000~19999)
    try {
      const pending = await LocalNotifications.getPending();
      const calendarNotifs = pending?.notifications?.filter((n: any) => n.id >= 10000 && n.id < 20000) || [];
      if (calendarNotifs.length > 0) {
        await LocalNotifications.cancel({ notifications: calendarNotifs.map((n: any) => ({ id: n.id })) });
      }
    } catch {}

    // 사용자 설정 시간 또는 localStorage 폴백
    const savedDayOf = dayOfTime || localStorage.getItem('cm_calendar_dayof_time') || '09:00';
    const savedDayBefore = dayBeforeTime || localStorage.getItem('cm_calendar_daybefore_time') || '20:00';
    const dayOfParsed = parseTimeString(savedDayOf, 9, 0);
    const dayBeforeParsed = parseTimeString(savedDayBefore, 20, 0);

    const now = new Date();
    const notifications: any[] = [];

    events.forEach((event, i) => {
      const dateStr = event.startDate || event.date;
      const eventDateBase = new Date(dateStr + 'T00:00:00');

      // 당일 알림
      const dayOfDate = new Date(eventDateBase);
      dayOfDate.setHours(dayOfParsed.hour, dayOfParsed.minute, 0, 0);
      if (dayOfDate > now) {
        notifications.push({
          id: 10000 + i,
          title: `오늘 일정: ${event.title}`,
          body: `${event.title} 일정이 있습니다.`,
          channelId: 'calendar',
          schedule: {
            at: dayOfDate,
            allowWhileIdle: true,
          },
        });
      }

      // 전날 알림
      const dayBefore = new Date(eventDateBase);
      dayBefore.setDate(dayBefore.getDate() - 1);
      dayBefore.setHours(dayBeforeParsed.hour, dayBeforeParsed.minute, 0, 0);
      if (dayBefore > now) {
        notifications.push({
          id: 10000 + events.length + i,
          title: `내일 일정: ${event.title}`,
          body: `내일 ${event.title} 일정이 있습니다.`,
          channelId: 'calendar',
          schedule: {
            at: dayBefore,
            allowWhileIdle: true,
          },
        });
      }
    });

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
    }
  } catch (e) {
    console.error('[Notifications] scheduleCalendarNotifications failed:', e);
  }
}

// 캘린더 알림 취소
export async function cancelCalendarNotifications(): Promise<void> {
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    const pending = await LocalNotifications.getPending();
    const calendarNotifs = pending?.notifications?.filter((n: any) => n.id >= 10000 && n.id < 20000) || [];
    if (calendarNotifs.length > 0) {
      await LocalNotifications.cancel({ notifications: calendarNotifs.map((n: any) => ({ id: n.id })) });
    }
  } catch (e) {
    console.error('[Notifications] cancelCalendarNotifications failed:', e);
  }
}

// FCM Web Push 초기화
export async function initWebPush(): Promise<string | null> {
  try {
    const { initializeApp } = await import('firebase/app');
    const { getMessaging, getToken, isSupported } = await import('firebase/messaging');
    if (!(await isSupported())) return null;
    const app = initializeApp({
      apiKey: 'YOUR_API_KEY',
      authDomain: 'YOUR_DOMAIN',
      projectId: 'YOUR_PROJECT_ID',
      messagingSenderId: 'YOUR_SENDER_ID',
      appId: 'YOUR_APP_ID'
    });
    const messaging = getMessaging(app);
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') return null;
    const token = await getToken(messaging, { vapidKey: 'YOUR_WEB_PUSH_VAPID_PUBLIC_KEY' });
    await fetch('/api/push/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
    return token;
  } catch (e) {
    console.error('[Notifications] initWebPush error:', e);
    return null;
  }
}


