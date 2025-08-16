import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { scheduleNotifications, cancelScheduledNotifications } from '@/lib/notifications';
// 알림은 플랫폼 설치 후 활성화 (웹/개발환경에서는 건너뜀)
let LocalNotifications: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  LocalNotifications = require('@capacitor/local-notifications').LocalNotifications;
} catch {}

type StartPage = 'kindergarten' | 'elementary' | 'youth' | 'calendar' | 'home';

export default function SettingsPage() {
  const { toast } = useToast();
  const [alarmOn, setAlarmOn] = useState(false);
  const [schedules, setSchedules] = useState<{ weekday: number; time: string }[]>([]);
  // 다크모드 기능 제거
  const [startPage, setStartPage] = useState<StartPage>('elementary');

  useEffect(() => {
    try {
      const savedAlarm = localStorage.getItem('cm_alarm_on') === '1';
      const savedStart = (localStorage.getItem('cm_start') as StartPage) || 'elementary';
      const savedSchedules = localStorage.getItem('cm_alarm_schedules');
      setAlarmOn(savedAlarm);
      setStartPage(savedStart);
      if (savedSchedules) {
        try { setSchedules(JSON.parse(savedSchedules)); } catch {}
      }
    } catch {}
  }, []);

  const handleSave = async () => {
    try {
      localStorage.setItem('cm_alarm_on', alarmOn ? '1' : '0');
      localStorage.setItem('cm_start', startPage);
      localStorage.setItem('cm_alarm_schedules', JSON.stringify(schedules));
      if (alarmOn && schedules.length > 0) {
        await scheduleNotifications(schedules);
      } else {
        await cancelScheduledNotifications();
      }
      toast({ title: '설정 저장', description: '설정이 저장되었습니다.' });
    } catch (e) {
      toast({ title: '오류', description: '설정 저장 중 오류', variant: 'destructive' });
    }
  };

  // 다크모드 토글 로직 제거

  return (
    <div className="min-h-screen">
      <div className="max-w-xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between mt-6">
          <Link href="/home">
            <a className="inline-flex items-center gap-1 text-gray-700 hover:text-gray-900">
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">메인화면</span>
            </a>
          </Link>
          <h1 className="text-lg font-semibold">설정</h1>
          <div className="w-20" />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <Label className="font-medium">알림 기능</Label>
            <p className="text-sm text-gray-500">원하는 요일/시간을 추가하세요</p>
          </div>
          <Switch checked={alarmOn} onCheckedChange={setAlarmOn} />
        </div>

        {/* 알림 스케줄 편집 (시간 입력은 HH:MM 문자열로 안정 입력) */}
        <div className="p-4 border rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <Label className="font-medium">알림 스케줄</Label>
            <button className="text-sm px-3 py-1 rounded bg-white border" onClick={()=> setSchedules(prev=> [...prev, { weekday:2, time:'09:00' }])}>+ 추가</button>
          </div>
          {schedules.map((s, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <select className="border rounded px-2 py-1 text-sm" value={s.weekday} onChange={(e)=>{
                const v = Number(e.target.value); setSchedules(prev=>prev.map((p,i)=> i===idx?{...p, weekday:v}:p));
              }}>
                <option value={1}>일</option>
                <option value={2}>월</option>
                <option value={3}>화</option>
                <option value={4}>수</option>
                <option value={5}>목</option>
                <option value={6}>금</option>
                <option value={7}>토</option>
              </select>
              <input type="time" className="border rounded px-2 py-1 text-sm" value={s.time} onChange={(e)=>{
                const v = e.target.value; setSchedules(prev=>prev.map((p,i)=> i===idx?{...p, time:v}:p));
              }} />
              <button className="text-sm text-red-600 px-2" onClick={()=> setSchedules(prev=> prev.filter((_,i)=> i!==idx))}>삭제</button>
            </div>
          ))}
        </div>

        {/* 다크모드 항목 제거 */}

        <div className="p-4 border rounded-lg space-y-3">
          <Label className="font-medium">시작화면</Label>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {(['kindergarten','elementary','youth','home','calendar'] as StartPage[]).map(key => (
              <label key={key} className="flex items-center gap-2 p-2 border rounded">
                <input type="radio" name="start" value={key} checked={startPage===key} onChange={()=>setStartPage(key)} />
                <span>{key === 'home' ? '메인화면' : key === 'elementary' ? '초등부' : key === 'kindergarten' ? '유치부' : key === 'youth' ? '중고등부' : '캘린더'}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={async ()=>{ await handleSave(); alert('설정이 저장되었습니다.'); }}>저장</Button>
        </div>
      </div>
    </div>
  );
}


