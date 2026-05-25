import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Image as ImageIcon, Home as HomeIcon, Settings, Baby, Users, GraduationCap, List, Bookmark, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWeeklyVerses } from "@/hooks/use-verses";
import { useToast } from "@/hooks/use-toast";
import { LocalStorage } from "@/lib/storage";
import { Link } from "wouter";
import { useCalendarData } from "@/hooks/use-calendar";
import BottomNavigation from "@/components/bottom-navigation";
import CaptureButton from "@/components/capture-button";
import { setupBackHandler, cleanupBackHandler, exitApp } from "@/lib/back-handler";
import ExitConfirmDialog from "@/components/exit-confirm-dialog";
import StreakCounter from "@/components/streak-counter";
import FlashcardModal from "@/components/flashcard-modal";
import type { Verse } from "@shared/schema";

// 글자 수 기반 동적 폰트 크기 (홈 카드용, 부서탭보다 컴팩트)
// 홈 카드는 부서 헤더+전체목록 버튼이 있어 콘텐츠 영역이 좁으므로 상한을 낮게 유지
// 글자수가 많을수록 자간(letterSpacing)/장평(scaleX)을 줄여 더 많은 글자가 한 줄에 들어가게 함
// 중간 길이(60~120자) 구간을 한 단계 더 축소해 미래의 더 긴 암송 구절에도 짤리지 않도록 마진 확보
function getHomeCardScale(contentLength: number) {
  if (contentLength <= 30) return {
    lesson: 'clamp(14px, 2dvh, 19px)',
    content: 'clamp(14px, 2dvh, 19px)',
    cite: 'clamp(11px, 1.4dvh, 15px)',
    contentLH: 1.5,
    letterSpacing: '0',
    scaleX: 1,
  };
  if (contentLength <= 50) return {
    lesson: 'clamp(13px, 1.85dvh, 17px)',
    content: 'clamp(13px, 1.85dvh, 17px)',
    cite: 'clamp(10px, 1.3dvh, 14px)',
    contentLH: 1.42,
    letterSpacing: '-0.1px',
    scaleX: 0.99,
  };
  if (contentLength <= 80) return {
    lesson: 'clamp(12px, 1.7dvh, 15px)',
    content: 'clamp(12px, 1.6dvh, 14px)',
    cite: 'clamp(10px, 1.25dvh, 13px)',
    contentLH: 1.34,
    letterSpacing: '-0.3px',
    scaleX: 0.97,
  };
  if (contentLength <= 120) return {
    lesson: 'clamp(11px, 1.55dvh, 14px)',
    content: 'clamp(11px, 1.45dvh, 13px)',
    cite: 'clamp(9px, 1.2dvh, 12px)',
    contentLH: 1.3,
    letterSpacing: '-0.5px',
    scaleX: 0.95,
  };
  if (contentLength <= 170) return {
    lesson: 'clamp(10px, 1.4dvh, 13px)',
    content: 'clamp(10px, 1.3dvh, 12px)',
    cite: 'clamp(9px, 1.15dvh, 11px)',
    contentLH: 1.28,
    letterSpacing: '-0.6px',
    scaleX: 0.94,
  };
  return {
    lesson: 'clamp(9px, 1.25dvh, 11px)',
    content: 'clamp(9px, 1.2dvh, 11px)',
    cite: 'clamp(8px, 1.05dvh, 10px)',
    contentLH: 1.25,
    letterSpacing: '-0.7px',
    scaleX: 0.93,
  };
}

const cardPad = 'clamp(8px, 1dvh, 14px)';
const labelSize = 'clamp(12px, 1.5dvh, 18px)';

export default function Home() {
  const [showCalendar, setShowCalendar] = useState(false);
  const [hasData] = useState(() => LocalStorage.getVerses().length > 0);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [flashcardVerse, setFlashcardVerse] = useState<Verse | null>(null);
  const { toast } = useToast();

  const copyVerse = async (verse: Verse) => {
    try {
      await navigator.clipboard.writeText(`"${verse.content}" - ${verse.reference}`);
      toast({ title: '복사 완료', description: '암송구절이 클립보드에 복사되었습니다.' });
    } catch {
      toast({ title: '복사 실패', description: '클립보드 복사에 실패했습니다.', variant: 'destructive' });
    }
  };

  const { data: elementaryWeekly } = useWeeklyVerses("elementary");
  const { data: kindergartenWeekly } = useWeeklyVerses("kindergarten");
  const { data: youthWeekly } = useWeeklyVerses("youth");
  const today = new Date();
  const { data: calendarData } = useCalendarData(today.getFullYear(), today.getMonth());

  // 뒤로가기 핸들러 (메인 탭 - 종료 확인)
  useEffect(() => {
    setupBackHandler({
      isMainTab: true,
      onExitConfirm: () => setShowExitDialog(true),
    });

    return () => {
      cleanupBackHandler();
    };
  }, []);

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
  // 전체 싸이클 진행률: 유치부 1년(52주), 초등부 2년(104주), 중고등부 3년(156주)
  const anchor = new Date(2024, 0, 1); // 유치부/초등부 사이클 기준 시작일
  const weeksSinceAnchor = weeksBetween(anchor, today);
  const progressKindergarten = Math.min(1, (weeksSinceAnchor % 52) / 52);
  const progressElementary = Math.min(1, (weeksSinceAnchor % 104) / 104);
  // 중고등부: 2023.1~2025.12 사이클 완료 → 2026.1부터 새 3년 사이클
  const youthAnchor = new Date(2023, 0, 1);
  const weeksSinceYouthAnchor = weeksBetween(youthAnchor, today);
  const progressYouth = Math.min(1, (weeksSinceYouthAnchor % 156) / 156);

  if (!hasData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="verse-card">
            <div
              className="animate-spin rounded-full h-16 w-16 border-4 mx-auto mb-6"
              style={{ borderColor: 'var(--surface-muted)', borderTopColor: 'var(--ink)' }}
            ></div>
            <p className="text-lg font-semibold" style={{ color: 'var(--ink)' }}>데이터를 불러오는 중...</p>
            <p className="text-sm mt-2" style={{ color: 'var(--ink-muted)' }}>교회학교 암송 데이터를 준비하고 있습니다</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative pb-12">
      {/* 상단 고정 바 (다른 탭과 동일 양식) */}
      <header
        className="fixed top-0 left-0 right-0 pt-6 pb-1 px-4 z-40"
        style={{
          background: 'var(--page-bg)',
          borderBottom: '1px solid var(--border-soft)',
        }}
      >
        <div className="flex items-center justify-between h-8">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: 'var(--surface-muted)' }}
            >
              <HomeIcon className="w-3.5 h-3.5" style={{ color: 'var(--ink)' }} />
            </div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--ink)' }}>메인화면</h1>
            <StreakCounter compact />
            <Link href="/bookmarks">
              <a
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ background: 'var(--surface-muted)' }}
              >
                <Bookmark className="w-4 h-4" style={{ color: 'var(--ink-soft)' }} />
              </a>
            </Link>
            <Link href="/settings">
              <a
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ background: 'var(--surface-muted)' }}
              >
                <Settings className="w-4 h-4" style={{ color: 'var(--ink-soft)' }} />
              </a>
            </Link>
          </div>
          <CaptureButton />
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 mt-[58px]">

        {/* 이번 주 암송 - 뷰포트에 맞게 3부서 표시 */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* 높이: 전체화면 - 헤더(58px) - 내비바(48px) = 106px, py-2로 상하 8px 균등 여백 */}
          <div className="flex flex-col py-2" style={{ height: 'calc(100dvh - 130px)' }}>
          <div className="flex items-center justify-between mb-1 flex-shrink-0">
            <h2 className="text-base font-bold" style={{ color: 'var(--ink)' }}>부서별 암송</h2>
            <Link href="/splash">
              <a
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full shadow border text-[11px] transition-colors"
                style={{
                  background: 'var(--surface)',
                  color: 'var(--ink-soft)',
                  borderColor: 'var(--border-soft)',
                }}
              >
                <ImageIcon className="w-3.5 h-3.5" /> 교육목표
              </a>
            </Link>
          </div>
          <div className="flex flex-col gap-1 flex-1 min-h-0">
            {/* 유치부 */}
            {(() => {
              const s = getHomeCardScale(kindergartenWeekly?.thisWeek?.content?.length ?? 0);
              return (
                <div className="verse-card flex-1 min-h-0 flex flex-col relative overflow-hidden" style={{ padding: cardPad }}>
                  <span className="dept-glow" data-dept="kindergarten" />
                  <div className="flex items-center justify-between mb-0.5 relative">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: 'var(--dept-kg-chip)' }}
                      >
                        <Baby className="w-2.5 h-2.5" style={{ color: 'var(--dept-kg-chip-text)' }} />
                      </div>
                      <p className="font-medium" style={{ fontSize: labelSize, color: 'var(--ink-soft)' }}>유치부</p>
                    </div>
                    <Link href="/verse-overview/kindergarten">
                      <a
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] transition-opacity hover:opacity-80"
                        style={{ background: 'var(--dept-kg-chip)', color: 'var(--dept-kg-chip-text)' }}
                      >
                        <List className="w-2.5 h-2.5" /> 전체목록
                      </a>
                    </Link>
                  </div>
                  {kindergartenWeekly?.thisWeek ? (
                    <div className="flex-1 min-h-0 flex flex-col relative">
                      {kindergartenWeekly.thisWeek.lessonName && (
                        <div className="font-semibold leading-tight mb-1" style={{ fontSize: s.lesson, color: 'var(--ink)' }}>{kindergartenWeekly.thisWeek.lessonName}</div>
                      )}
                      <div className="flex-1 min-h-0 overflow-hidden" style={{ fontSize: s.content, lineHeight: s.contentLH, color: 'var(--ink-soft)', letterSpacing: s.letterSpacing }}>
                        <div style={{ transform: s.scaleX !== 1 ? `scaleX(${s.scaleX})` : 'none', transformOrigin: 'left top', width: s.scaleX !== 1 ? `${(100 / s.scaleX).toFixed(2)}%` : '100%' }}>
                          {kindergartenWeekly.thisWeek.content}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-auto gap-2">
                        <div className="font-medium truncate" style={{ fontSize: s.cite, color: 'var(--dept-kg-accent)' }}>{kindergartenWeekly.thisWeek.reference}</div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={(e) => { e.preventDefault(); copyVerse(kindergartenWeekly.thisWeek!); }}
                            aria-label="복사"
                            className="flex items-center justify-center"
                            style={{ width: 22, height: 22, borderRadius: 6, color: 'var(--ink-soft)' }}
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => { e.preventDefault(); setFlashcardVerse(kindergartenWeekly.thisWeek!); }}
                            aria-label="암송연습"
                            className="flex items-center justify-center"
                            style={{ width: 22, height: 22, borderRadius: 6, color: 'var(--ink-soft)' }}
                          >
                            <GraduationCap className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="flex-1 flex items-center" style={{ fontSize: labelSize, color: 'var(--ink-muted)' }}>이번 주 암송을 확인하세요</p>
                  )}
                </div>
              );
            })()}
            {/* 초등부 */}
            {(() => {
              const s = getHomeCardScale(elementaryWeekly?.thisWeek?.content?.length ?? 0);
              return (
                <div className="verse-card flex-1 min-h-0 flex flex-col relative overflow-hidden" style={{ padding: cardPad }}>
                  <span className="dept-glow" data-dept="elementary" />
                  <div className="flex items-center justify-between mb-0.5 relative">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: 'var(--dept-el-chip)' }}
                      >
                        <Users className="w-2.5 h-2.5" style={{ color: 'var(--dept-el-chip-text)' }} />
                      </div>
                      <p className="font-medium" style={{ fontSize: labelSize, color: 'var(--ink-soft)' }}>초등부</p>
                    </div>
                    <Link href="/verse-overview/elementary">
                      <a
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] transition-opacity hover:opacity-80"
                        style={{ background: 'var(--dept-el-chip)', color: 'var(--dept-el-chip-text)' }}
                      >
                        <List className="w-2.5 h-2.5" /> 전체목록
                      </a>
                    </Link>
                  </div>
                  {elementaryWeekly?.thisWeek ? (
                    <div className="flex-1 min-h-0 flex flex-col relative">
                      {elementaryWeekly.thisWeek.lessonName && (
                        <div className="font-semibold leading-tight mb-1" style={{ fontSize: s.lesson, color: 'var(--ink)' }}>{elementaryWeekly.thisWeek.lessonName}</div>
                      )}
                      <div className="flex-1 min-h-0 overflow-hidden" style={{ fontSize: s.content, lineHeight: s.contentLH, color: 'var(--ink-soft)', letterSpacing: s.letterSpacing }}>
                        <div style={{ transform: s.scaleX !== 1 ? `scaleX(${s.scaleX})` : 'none', transformOrigin: 'left top', width: s.scaleX !== 1 ? `${(100 / s.scaleX).toFixed(2)}%` : '100%' }}>
                          {elementaryWeekly.thisWeek.content}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-auto gap-2">
                        <div className="font-medium truncate" style={{ fontSize: s.cite, color: 'var(--dept-el-accent)' }}>{elementaryWeekly.thisWeek.reference}</div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={(e) => { e.preventDefault(); copyVerse(elementaryWeekly.thisWeek!); }}
                            aria-label="복사"
                            className="flex items-center justify-center"
                            style={{ width: 22, height: 22, borderRadius: 6, color: 'var(--ink-soft)' }}
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => { e.preventDefault(); setFlashcardVerse(elementaryWeekly.thisWeek!); }}
                            aria-label="암송연습"
                            className="flex items-center justify-center"
                            style={{ width: 22, height: 22, borderRadius: 6, color: 'var(--ink-soft)' }}
                          >
                            <GraduationCap className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="flex-1 flex items-center" style={{ fontSize: labelSize, color: 'var(--ink-muted)' }}>이번 주 암송을 확인하세요</p>
                  )}
                </div>
              );
            })()}
            {/* 중고등부 */}
            {(() => {
              const s = getHomeCardScale(youthWeekly?.thisWeek?.content?.length ?? 0);
              return (
                <div className="verse-card flex-1 min-h-0 flex flex-col relative overflow-hidden" style={{ padding: cardPad }}>
                  <span className="dept-glow" data-dept="youth" />
                  <div className="flex items-center justify-between mb-0.5 relative">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: 'var(--dept-yt-chip)' }}
                      >
                        <GraduationCap className="w-2.5 h-2.5" style={{ color: 'var(--dept-yt-chip-text)' }} />
                      </div>
                      <p className="font-medium" style={{ fontSize: labelSize, color: 'var(--ink-soft)' }}>중고등부</p>
                    </div>
                    <Link href="/verse-overview/youth">
                      <a
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] transition-opacity hover:opacity-80"
                        style={{ background: 'var(--dept-yt-chip)', color: 'var(--dept-yt-chip-text)' }}
                      >
                        <List className="w-2.5 h-2.5" /> 전체목록
                      </a>
                    </Link>
                  </div>
                  {youthWeekly?.thisWeek ? (
                    <div className="flex-1 min-h-0 flex flex-col relative">
                      {youthWeekly.thisWeek.lessonName && (
                        <div className="font-semibold leading-tight mb-1" style={{ fontSize: s.lesson, color: 'var(--ink)' }}>{youthWeekly.thisWeek.lessonName}</div>
                      )}
                      <div className="flex-1 min-h-0 overflow-hidden" style={{ fontSize: s.content, lineHeight: s.contentLH, color: 'var(--ink-soft)', letterSpacing: s.letterSpacing }}>
                        <div style={{ transform: s.scaleX !== 1 ? `scaleX(${s.scaleX})` : 'none', transformOrigin: 'left top', width: s.scaleX !== 1 ? `${(100 / s.scaleX).toFixed(2)}%` : '100%' }}>
                          {youthWeekly.thisWeek.content}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-auto gap-2">
                        <div className="font-medium truncate" style={{ fontSize: s.cite, color: 'var(--dept-yt-accent)' }}>{youthWeekly.thisWeek.reference}</div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={(e) => { e.preventDefault(); copyVerse(youthWeekly.thisWeek!); }}
                            aria-label="복사"
                            className="flex items-center justify-center"
                            style={{ width: 22, height: 22, borderRadius: 6, color: 'var(--ink-soft)' }}
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => { e.preventDefault(); setFlashcardVerse(youthWeekly.thisWeek!); }}
                            aria-label="암송연습"
                            className="flex items-center justify-center"
                            style={{ width: 22, height: 22, borderRadius: 6, color: 'var(--ink-soft)' }}
                          >
                            <GraduationCap className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="flex-1 flex items-center" style={{ fontSize: labelSize, color: 'var(--ink-muted)' }}>이번 주 암송을 확인하세요</p>
                  )}
                </div>
              );
            })()}
          </div>
          </div>
        </motion.section>

        <div className="space-y-4 py-4">

        {/* Ongoing Events */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="verse-card">
            <h2 className="text-base font-bold mb-3" style={{ color: 'var(--ink)' }}>진행 중인 행사</h2>
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
                    <div className="font-medium" style={{ color: 'var(--ink)' }}>{ev.title}</div>
                    <div className="text-sm" style={{ color: 'var(--ink-soft)' }}>
                      {new Date((ev.startDate || ev.date) + 'T00:00:00').toLocaleDateString('ko-KR', { month:'long', day:'numeric', weekday:'short' })}
                      {ev.endDate ? ` ~ ${new Date(ev.endDate + 'T00:00:00').toLocaleDateString('ko-KR', { month:'long', day:'numeric', weekday:'short' })}` : ''}
                    </div>
                    {ev.description && <div className="text-xs mt-1 whitespace-pre-line" style={{ color: 'var(--ink-muted)' }}>{ev.description}</div>}
                  </div>
                ))
                ?? <p style={{ color: 'var(--ink-muted)' }}>오늘 포함된 일정이 없습니다.</p>}
            </div>
          </div>
        </motion.section>

        {/* 대시보드 */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="verse-card">
            <h2 className="text-base font-bold mb-3" style={{ color: 'var(--ink)' }}>커리큘럼 진행률</h2>
            {/* 1) 전체 진행률 (부서별 싸이클) */}
            <div className="space-y-3 mb-6">
              {/* 유치부 */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: 'var(--dept-kg-chip)' }}
                    >
                      <Baby className="w-3 h-3" style={{ color: 'var(--dept-kg-chip-text)' }} />
                    </div>
                    <span className="text-sm" style={{ color: 'var(--ink-soft)' }}>유치부</span>
                    <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>1년, 1사이클</span>
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--dept-kg-accent)' }}>{Math.round(progressKindergarten * 100)}%</span>
                </div>
                <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'var(--surface-muted)' }}>
                  <div className="h-3" style={{ width: `${Math.round(progressKindergarten * 100)}%`, background: 'var(--dept-kg-accent)' }} />
                </div>
              </div>
              {/* 초등부 */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: 'var(--dept-el-chip)' }}
                    >
                      <Users className="w-3 h-3" style={{ color: 'var(--dept-el-chip-text)' }} />
                    </div>
                    <span className="text-sm" style={{ color: 'var(--ink-soft)' }}>초등부</span>
                    <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>2년, 1사이클</span>
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--dept-el-accent)' }}>{Math.round(progressElementary * 100)}%</span>
                </div>
                <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'var(--surface-muted)' }}>
                  <div className="h-3" style={{ width: `${Math.round(progressElementary * 100)}%`, background: 'var(--dept-el-accent)' }} />
                </div>
              </div>
              {/* 중고등부 */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: 'var(--dept-yt-chip)' }}
                    >
                      <GraduationCap className="w-3 h-3" style={{ color: 'var(--dept-yt-chip-text)' }} />
                    </div>
                    <span className="text-sm" style={{ color: 'var(--ink-soft)' }}>중고등부</span>
                    <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>3년, 1사이클</span>
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--dept-yt-accent)' }}>{Math.round(progressYouth * 100)}%</span>
                </div>
                <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'var(--surface-muted)' }}>
                  <div className="h-3" style={{ width: `${Math.round(progressYouth * 100)}%`, background: 'var(--dept-yt-accent)' }} />
                </div>
              </div>
            </div>

            {/* 2) 1년 치 진행률 (52주) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm" style={{ color: 'var(--ink-soft)' }}>올해 진행률</span>
                <span className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{Math.round(oneYearProgress * 100)}%</span>
              </div>
              <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'var(--surface-muted)' }}>
                <div className="h-3" style={{ width: `${Math.round(oneYearProgress * 100)}%`, background: 'var(--ink)' }} />
              </div>
            </div>
          </div>
        </motion.section>

        {/* 데이터 소스 안내 섹션 제거 */}
        </div>
      </main>
      <BottomNavigation />
      
      <ExitConfirmDialog
        open={showExitDialog}
        onOpenChange={setShowExitDialog}
        onConfirm={exitApp}
      />

      {flashcardVerse && (
        <FlashcardModal
          open={!!flashcardVerse}
          onOpenChange={(open) => { if (!open) setFlashcardVerse(null); }}
          verse={flashcardVerse}
        />
      )}
    </div>
  );
}
