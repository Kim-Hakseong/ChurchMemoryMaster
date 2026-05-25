import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { ChevronLeft, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { scheduleNotifications, cancelScheduledNotifications, scheduleCalendarNotifications, cancelCalendarNotifications } from '@/lib/notifications';
import { LocalStorage } from '@/lib/storage';
// 알림은 플랫폼 설치 후 활성화 (웹/개발환경에서는 건너뜀)
let LocalNotifications: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  LocalNotifications = require('@capacitor/local-notifications').LocalNotifications;
} catch {}

type StartPage = 'kindergarten' | 'elementary' | 'youth' | 'calendar' | 'home';

export default function SettingsPage() {
  const { toast } = useToast();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [alarmOn, setAlarmOn] = useState(false);
  const [calendarAlarmOn, setCalendarAlarmOn] = useState(false);
  const [calDayOfTime, setCalDayOfTime] = useState('09:00');
  const [calDayBeforeTime, setCalDayBeforeTime] = useState('20:00');
  const [schedules, setSchedules] = useState<{ weekday: number; time: string }[]>([]);
  const [startPage, setStartPage] = useState<StartPage>('elementary');

  useEffect(() => {
    try {
      const savedAlarm = localStorage.getItem('cm_alarm_on') === '1';
      const savedCalendarAlarm = localStorage.getItem('cm_calendar_alarm_on') === '1';
      const savedStart = (localStorage.getItem('cm_start') as StartPage) || 'elementary';
      const savedSchedules = localStorage.getItem('cm_alarm_schedules');
      const savedDayOf = localStorage.getItem('cm_calendar_dayof_time') || '09:00';
      const savedDayBefore = localStorage.getItem('cm_calendar_daybefore_time') || '20:00';
      setAlarmOn(savedAlarm);
      setCalendarAlarmOn(savedCalendarAlarm);
      setCalDayOfTime(savedDayOf);
      setCalDayBeforeTime(savedDayBefore);
      setStartPage(savedStart);
      if (savedSchedules) {
        try { setSchedules(JSON.parse(savedSchedules)); } catch {}
      }
    } catch {}
  }, []);

  const handleSave = async () => {
    try {
      localStorage.setItem('cm_alarm_on', alarmOn ? '1' : '0');
      localStorage.setItem('cm_calendar_alarm_on', calendarAlarmOn ? '1' : '0');
      localStorage.setItem('cm_calendar_dayof_time', calDayOfTime);
      localStorage.setItem('cm_calendar_daybefore_time', calDayBeforeTime);
      localStorage.setItem('cm_start', startPage);
      localStorage.setItem('cm_alarm_schedules', JSON.stringify(schedules));

      if (alarmOn && schedules.length > 0) {
        await scheduleNotifications(schedules);
      } else {
        await cancelScheduledNotifications();
      }

      // 캘린더 이벤트 알림
      if (calendarAlarmOn) {
        const events = LocalStorage.getEventsSync();
        await scheduleCalendarNotifications(events, calDayOfTime, calDayBeforeTime);
      } else {
        await cancelCalendarNotifications();
      }
      toast({ title: '설정 저장', description: '설정이 저장되었습니다.' });
    } catch (e) {
      toast({ title: '오류', description: '설정 저장 중 오류', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between mt-6">
          <Link href="/home">
            <a className="inline-flex items-center gap-1" style={{ color: 'var(--ink-soft)' }}>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">메인화면</span>
            </a>
          </Link>
          <h1 className="text-lg font-semibold" style={{ color: 'var(--ink)' }}>설정</h1>
          <div className="w-20" />
        </div>

        {/* 테마(다크모드) — Design2 7-1 */}
        <div className="surface-card p-4 space-y-3">
          <div>
            <Label className="font-medium" style={{ color: 'var(--ink)' }}>화면 테마</Label>
            <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
              {mounted ? `현재: ${resolvedTheme === 'dark' ? '다크' : '라이트'}` : ' '}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {([
              { key: 'light', label: '라이트', Icon: Sun },
              { key: 'dark',  label: '다크',  Icon: Moon },
              { key: 'system',label: '시스템',Icon: Monitor },
            ] as const).map(({ key, label, Icon }) => {
              const active = mounted && theme === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTheme(key)}
                  className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl transition-colors ${active ? 'nav-tab-active-glass' : 'border'}`}
                  style={{
                    background: active ? undefined : 'var(--surface-muted)',
                    color: 'var(--ink)',
                    borderColor: active ? undefined : 'var(--border-soft)',
                  }}
                  aria-pressed={active}
                  data-testid={`theme-${key}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 surface-card">
          <div>
            <Label className="font-medium" style={{ color: 'var(--ink)' }}>알림 기능</Label>
            <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>원하는 요일/시간을 추가하세요</p>
          </div>
          <Switch checked={alarmOn} onCheckedChange={setAlarmOn} />
        </div>

        {/* 알림 스케줄 편집 */}
        <div className="p-4 surface-card space-y-3">
          <div className="flex items-center justify-between">
            <Label className="font-medium" style={{ color: 'var(--ink)' }}>알림 스케줄</Label>
            <button
              className="text-sm px-3 py-1 rounded-md border"
              style={{ background: 'var(--surface-muted)', color: 'var(--ink-soft)', borderColor: 'var(--border-soft)' }}
              onClick={()=> setSchedules(prev=> [...prev, { weekday:2, time:'09:00' }])}
            >+ 추가</button>
          </div>
          {schedules.map((s, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <select
                className="rounded px-2 py-1 text-sm border"
                style={{ background: 'var(--surface)', color: 'var(--ink)', borderColor: 'var(--border-soft)' }}
                value={s.weekday}
                onChange={(e)=>{
                  const v = Number(e.target.value); setSchedules(prev=>prev.map((p,i)=> i===idx?{...p, weekday:v}:p));
                }}
              >
                <option value={1}>일</option>
                <option value={2}>월</option>
                <option value={3}>화</option>
                <option value={4}>수</option>
                <option value={5}>목</option>
                <option value={6}>금</option>
                <option value={7}>토</option>
              </select>
              <input
                type="time"
                className="rounded px-2 py-1 text-sm border"
                style={{ background: 'var(--surface)', color: 'var(--ink)', borderColor: 'var(--border-soft)' }}
                value={s.time}
                onChange={(e)=>{
                  const v = e.target.value; setSchedules(prev=>prev.map((p,i)=> i===idx?{...p, time:v}:p));
                }}
              />
              <button
                className="text-sm px-2"
                style={{ color: 'var(--destructive)' }}
                onClick={()=> setSchedules(prev=> prev.filter((_,i)=> i!==idx))}
              >삭제</button>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between p-4 surface-card">
          <div>
            <Label className="font-medium" style={{ color: 'var(--ink)' }}>캘린더 일정 알림</Label>
            <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>등록된 일정 전날/당일에 알림</p>
          </div>
          <Switch checked={calendarAlarmOn} onCheckedChange={setCalendarAlarmOn} />
        </div>

        {calendarAlarmOn && (
          <div className="p-4 surface-card space-y-3">
            <Label className="font-medium" style={{ color: 'var(--ink)' }}>캘린더 알림 시간</Label>
            <div className="flex items-center gap-3">
              <span className="text-sm w-16" style={{ color: 'var(--ink-soft)' }}>전날</span>
              <input
                type="time"
                className="rounded px-2 py-1 text-sm flex-1 border"
                style={{ background: 'var(--surface)', color: 'var(--ink)', borderColor: 'var(--border-soft)' }}
                value={calDayBeforeTime}
                onChange={(e) => setCalDayBeforeTime(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm w-16" style={{ color: 'var(--ink-soft)' }}>당일</span>
              <input
                type="time"
                className="rounded px-2 py-1 text-sm flex-1 border"
                style={{ background: 'var(--surface)', color: 'var(--ink)', borderColor: 'var(--border-soft)' }}
                value={calDayOfTime}
                onChange={(e) => setCalDayOfTime(e.target.value)}
              />
            </div>
            <p className="text-xs" style={{ color: 'var(--ink-faint)' }}>일정 제목이 알림에 표시됩니다</p>
          </div>
        )}

        <div className="p-4 surface-card space-y-3">
          <Label className="font-medium" style={{ color: 'var(--ink)' }}>시작화면</Label>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {(['kindergarten','elementary','youth','home','calendar'] as StartPage[]).map(key => {
              const checked = startPage === key;
              return (
                <label
                  key={key}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${checked ? 'nav-tab-active-glass' : 'border'}`}
                  style={{
                    background: checked ? undefined : 'var(--surface-muted)',
                    color: 'var(--ink)',
                    borderColor: checked ? undefined : 'var(--border-soft)',
                  }}
                >
                  <input type="radio" name="start" value={key} checked={checked} onChange={()=>setStartPage(key)} />
                  <span>{key === 'home' ? '메인화면' : key === 'elementary' ? '초등부' : key === 'kindergarten' ? '유치부' : key === 'youth' ? '중고등부' : '캘린더'}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={async ()=>{ await handleSave(); alert('설정이 저장되었습니다.'); }}
            style={{
              background: 'var(--ink)',
              color: 'var(--surface)',
              fontWeight: 600,
            }}
          >
            저장
          </Button>
        </div>

        {/* About — 개발자 정보 / 저작권 / 문의 */}
        <div className="surface-card p-5 space-y-4">
          <div>
            <Label className="font-medium" style={{ color: 'var(--ink)' }}>About</Label>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>교회학교 암송 수첩</p>
            <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>Version 1.0.0</p>
            <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>Developed by Kim Hakseong</p>
            <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>(Cheong-ju Nambu Church)</p>
            <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>청주남부교회 김학성 형제 개발</p>
          </div>

          <div className="pt-3" style={{ borderTop: '1px solid var(--border-soft)' }}>
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--ink)' }}>Contact Us</p>
            <p className="text-xs mb-2" style={{ color: 'var(--ink-muted)' }}>
              Have a question or found a bug?
            </p>
            <a
              href="mailto:makseong@gmail.com?subject=Church%20Memory%20App%20-%20Inquiry%2FBug%20Report"
              className="inline-flex items-center gap-1 text-sm font-medium underline-offset-2 hover:underline"
              style={{ color: 'var(--ink)' }}
            >
              makseong@gmail.com
            </a>
          </div>

          <div className="pt-3 space-y-0.5" style={{ borderTop: '1px solid var(--border-soft)' }}>
            <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
              © 2026 Kim Hakseong (Cheong-ju Nambu Church). All rights reserved.
            </p>
            <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
              © 2026 김학성 형제 (청주남부교회). 모든 권리 보유.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
