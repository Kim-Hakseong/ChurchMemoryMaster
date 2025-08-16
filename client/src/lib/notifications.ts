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


