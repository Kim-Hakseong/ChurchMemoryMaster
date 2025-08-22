import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Image as ImageIcon, Home as HomeIcon, Settings, Baby, Users, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWeeklyVerses } from "@/hooks/use-verses";
import { useToast } from "@/hooks/use-toast";
import { LocalStorage } from "@/lib/storage";
import { Link } from "wouter";
import { useCalendarData } from "@/hooks/use-calendar";
import BottomNavigation from "@/components/bottom-navigation";

export default function Home() {
  const [showCalendar, setShowCalendar] = useState(false);
  const [hasData] = useState(() => LocalStorage.getVerses().length > 0);
  const { toast } = useToast();

  const { data: elementaryWeekly } = useWeeklyVerses("elementary");
  const { data: kindergartenWeekly } = useWeeklyVerses("kindergarten");
  const { data: youthWeekly } = useWeeklyVerses("youth");
  const today = new Date();
  const { data: calendarData } = useCalendarData(today.getFullYear(), today.getMonth());

  // 진행률 계산 유틸리티
  const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const startOfDayUTC = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const weeksBetween = (start: Date, end: Date) => {
    const diff = startOfDayUTC(end) - startOfDayUTC(start);
    return Math.max(0, Math.floor(diff / WEEK_MS));
  };
  // 1년 치 진행률 (52주 기준)
  const yearStart = new Date(today.getFullYear(), 0, 1);
  const oneYearProgress = Math.min(1, weeksBetween(yearStart, today) / 52);
  // 전체 싸이클 진행률: 유치부 1년, 초등부 2년, 중고등부 3년 (주 단위)
  const anchor = new Date(2024, 0, 1); // 싸이클 기준 시작일 (필요 시 조정 가능)
  const weeksSinceAnchor = weeksBetween(anchor, today);
  const progressKindergarten = Math.min(1, (weeksSinceAnchor % 52) / 52);
  const progressElementary = Math.min(1, (weeksSinceAnchor % 104) / 104);
  const progressYouth = Math.min(1, (weeksSinceAnchor % 156) / 156);

  if (!hasData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="verse-card">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-primary mx-auto mb-6"></div>
            <p className="text-gray-800 text-lg font-semibold">데이터를 불러오는 중...</p>
            <p className="text-gray-500 text-sm mt-2">교회학교 암송 데이터를 준비하고 있습니다</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative pb-16">
      {/* 상단 고정 바 (다른 탭과 동일 양식) */}
      <header className="fixed top-0 left-0 right-0 pt-10 pb-4 px-6 bg-gradient-to-r from-blue-50 to-purple-50 z-40">
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <HomeIcon className="text-indigo-600 w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">메인화면</h1>
          </div>
          {/* 우측: 통일된 버튼 스타일 */}
          <div className="flex flex-col space-y-1 mr-2">
            <Link href="/splash">
              <a className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white shadow border text-gray-700 hover:bg-gray-50 text-xs min-w-[100px] justify-center">
                <ImageIcon className="w-4 h-4" /> 교육목표
              </a>
            </Link>
            <Link href="/settings">
              <a className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white shadow border text-gray-700 hover:bg-gray-50 text-xs min-w-[100px] justify-center">
                <Settings className="w-4 h-4" /> 설정
              </a>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-6 space-y-6 mt-24">

        {/* Weekly Verses Quick Links */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="verse-card">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800">이번 주 암송 말씀</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              <div className="verse-card">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center">
                    <Baby className="text-pink-600 w-3 h-3" />
                  </div>
                  <p className="text-gray-500 text-xs">유치부</p>
                </div>
                {kindergartenWeekly?.thisWeek ? (
                  <div className="space-y-1">
                    {kindergartenWeekly.thisWeek.lessonName && (
                      <div className="text-gray-900 font-medium">{kindergartenWeekly.thisWeek.lessonName}</div>
                    )}
                    <div className="text-gray-800 text-sm whitespace-pre-line">{kindergartenWeekly.thisWeek.content}</div>
                    <div className="text-xs text-gray-500">{kindergartenWeekly.thisWeek.reference}</div>
                  </div>
                ) : (
                  <p className="text-gray-800 text-sm">이번 주 암송을 확인하세요</p>
                )}
              </div>
              <div className="verse-card">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="text-blue-600 w-3 h-3" />
                  </div>
                  <p className="text-gray-500 text-xs">초등부</p>
                </div>
                {elementaryWeekly?.thisWeek ? (
                  <div className="space-y-1">
                    {elementaryWeekly.thisWeek.lessonName && (
                      <div className="text-gray-900 font-medium">{elementaryWeekly.thisWeek.lessonName}</div>
                    )}
                    <div className="text-gray-800 text-sm whitespace-pre-line">{elementaryWeekly.thisWeek.content}</div>
                    <div className="text-xs text-gray-500">{elementaryWeekly.thisWeek.reference}</div>
                  </div>
                ) : (
                  <p className="text-gray-800 text-sm">이번 주 암송을 확인하세요</p>
                )}
              </div>
              <div className="verse-card">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <GraduationCap className="text-green-600 w-3 h-3" />
                  </div>
                  <p className="text-gray-500 text-xs">중고등부</p>
                </div>
                {youthWeekly?.thisWeek ? (
                  <div className="space-y-1">
                    {youthWeekly.thisWeek.lessonName && (
                      <div className="text-gray-900 font-medium">{youthWeekly.thisWeek.lessonName}</div>
                    )}
                    <div className="text-gray-800 text-sm whitespace-pre-line">{youthWeekly.thisWeek.content}</div>
                    <div className="text-xs text-gray-500">{youthWeekly.thisWeek.reference}</div>
                  </div>
                ) : (
                  <p className="text-gray-800 text-sm">이번 주 암송을 확인하세요</p>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Ongoing Events */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="verse-card">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">진행 중인 행사</h2>
            <div className="space-y-3">
              {calendarData?.events
                ?.filter(ev => {
                  const start = new Date((ev.startDate || ev.date) + 'T00:00:00');
                  const end = new Date((ev.endDate || ev.date) + 'T00:00:00');
                  const target = new Date();
                  start.setHours(0,0,0,0); end.setHours(0,0,0,0); target.setHours(0,0,0,0);
                  return target >= start && target <= end;
                })
                .map(ev => (
                  <div key={`${ev.id}`} className="verse-card">
                    <div className="font-medium text-gray-800">{ev.title}</div>
                    <div className="text-sm text-gray-600">
                      {new Date((ev.startDate || ev.date) + 'T00:00:00').toLocaleDateString('ko-KR', { month:'long', day:'numeric', weekday:'short' })}
                      {ev.endDate ? ` ~ ${new Date(ev.endDate + 'T00:00:00').toLocaleDateString('ko-KR', { month:'long', day:'numeric', weekday:'short' })}` : ''}
                    </div>
                    {ev.description && <div className="text-xs text-gray-500 mt-1 whitespace-pre-line">{ev.description}</div>}
                  </div>
                ))
                ?? <p className="text-gray-500">오늘 포함된 일정이 없습니다.</p>}
            </div>
          </div>
        </motion.section>

        {/* 대시보드 */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="verse-card">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">커리큘럼 진행률</h2>
            {/* 1) 전체 진행률 (부서별 싸이클) */}
            <div className="space-y-3 mb-6">
              {/* 유치부 */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center">
                      <Baby className="text-pink-600 w-3 h-3" />
                    </div>
                    <span className="text-sm text-gray-700">유치부</span>
                    <span className="text-xs text-gray-600">1년, 1사이클</span>
                  </div>
                  <span className="text-sm text-green-600 font-medium">{Math.round(progressKindergarten * 100)}%</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-3 bg-yellow-400" style={{ width: `${Math.round(progressKindergarten * 100)}%` }} />
                </div>
              </div>
              {/* 초등부 */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="text-blue-600 w-3 h-3" />
                    </div>
                    <span className="text-sm text-gray-700">초등부</span>
                    <span className="text-xs text-gray-600">2년, 1사이클</span>
                  </div>
                  <span className="text-sm text-green-600 font-medium">{Math.round(progressElementary * 100)}%</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-3 bg-yellow-400" style={{ width: `${Math.round(progressElementary * 100)}%` }} />
                </div>
              </div>
              {/* 중고등부 */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                      <GraduationCap className="text-green-600 w-3 h-3" />
                    </div>
                    <span className="text-sm text-gray-700">중고등부</span>
                    <span className="text-xs text-gray-600">3년, 1사이클</span>
                  </div>
                  <span className="text-sm text-green-600 font-medium">{Math.round(progressYouth * 100)}%</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-3 bg-yellow-400" style={{ width: `${Math.round(progressYouth * 100)}%` }} />
                </div>
              </div>
            </div>

            {/* 2) 1년 치 진행률 (52주) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-700">올해 진행률</span>
                <span className="text-sm text-green-600 font-medium">{Math.round(oneYearProgress * 100)}%</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-3 bg-primary" style={{ width: `${Math.round(oneYearProgress * 100)}%` }} />
              </div>
            </div>
          </div>
        </motion.section>

        {/* 데이터 소스 안내 섹션 제거 */}
      </main>
      <BottomNavigation />
    </div>
  );
}
