import { useState } from 'react';
import { Link } from 'wouter';
import { ChevronLeft, Flame, Trophy, Star, TrendingUp, ChevronRight } from 'lucide-react';
import { useProgress } from '@/hooks/use-progress';
import WeeklyDotGrid from '@/components/weekly-dot-grid';

export default function MyProgressPage() {
  const { stats, weeklyGrid, completions, loading } = useProgress();
  const [progressMode, setProgressMode] = useState<'weekly' | 'monthly'>('weekly');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 최근 7일 완료율
  const completedDays = weeklyGrid.filter((d) => d.completed).length;
  const weeklyRate = Math.round((completedDays / 7) * 100);

  // 이번 달 달성률 — 분모는 이번 달 전체 일수 (오늘까지가 아니라)
  // 1번 완료 시 1/31 ≈ 3% 처럼 자연스러운 비율
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const totalDaysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const completedDatesInMonth = new Set<string>();
  for (const c of completions) {
    const d = new Date(c.completedAt);
    if (d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth()) {
      completedDatesInMonth.add(`${d.getMonth() + 1}-${d.getDate()}`);
    }
  }
  const monthlyCompletedDays = completedDatesInMonth.size;
  const monthlyRate = Math.round((monthlyCompletedDays / totalDaysInMonth) * 100);
  const monthLabel = `${monthStart.getMonth() + 1}월`;

  // 최근 완료 기록 (최근 10개)
  const recentCompletions = [...completions]
    .sort((a, b) => b.completedAt - a.completedAt)
    .slice(0, 10);

  const difficultyLabel = (d: string) =>
    d === 'easy' ? '쉬움' : d === 'hard' ? '보통' : '완전 암송';
  const difficultyDeptKey = (d: string) =>
    d === 'easy' ? 'el' : d === 'hard' ? 'kg' : 'yt';

  const isMonthly = progressMode === 'monthly';
  const displayRate = isMonthly ? monthlyRate : weeklyRate;
  const displayLabel = isMonthly ? '이번 달 달성률' : '이번 주 달성률';

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-xl mx-auto p-5 space-y-6">
        {/* 헤더 */}
        <div className="relative flex items-center justify-between mt-4">
          <Link href="/home">
            <a className="inline-flex items-center gap-1" style={{ color: 'var(--ink-soft)' }}>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">홈</span>
            </a>
          </Link>
          <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-semibold" style={{ color: 'var(--ink)' }}>암송 뱃지</h1>
          <div className="w-10" />
        </div>

        {/* 스트릭 & 포인트 카드 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="surface-card p-4 relative overflow-hidden">
            <span className="dept-glow" data-dept="kindergarten" />
            <div className="flex items-center gap-2 mb-1 relative">
              <Flame className="w-5 h-5" style={{ color: 'var(--dept-kg-accent)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--ink-muted)' }}>연속 암송</span>
            </div>
            <p className="display-m relative" style={{ color: 'var(--ink)' }}>
              {stats.currentStreak}<span className="text-sm font-normal ml-0.5">일</span>
            </p>
            <p className="text-[11px] mt-0.5 relative" style={{ color: 'var(--ink-faint)' }}>최장 {stats.longestStreak}일</p>
          </div>

          <div className="surface-card p-4 relative overflow-hidden">
            <span className="dept-glow" data-dept="elementary" />
            <div className="flex items-center gap-2 mb-1 relative">
              <Star className="w-5 h-5" style={{ color: 'var(--dept-el-accent)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--ink-muted)' }}>총 포인트</span>
            </div>
            <p className="display-m relative" style={{ color: 'var(--ink)' }}>{stats.totalPoints.toLocaleString()}</p>
            <p className="text-[11px] mt-0.5 relative" style={{ color: 'var(--ink-faint)' }}>총 {stats.totalCompletions}회 완료</p>
          </div>
        </div>

        {/* 달성률 (주간 ↔ 월간 토글) — 카드 클릭 시 전환 */}
        <button
          type="button"
          onClick={() => setProgressMode((m) => (m === 'weekly' ? 'monthly' : 'weekly'))}
          className="surface-card p-4 space-y-3 w-full text-left transition-transform active:scale-[0.99]"
          aria-label={isMonthly ? '주간으로 전환' : '월간으로 전환'}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" style={{ color: 'var(--dept-el-accent)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{displayLabel}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--surface-muted)', color: 'var(--ink-muted)' }}>
                탭하여 {isMonthly ? '주간' : '월간'} 보기
              </span>
            </div>
            <span className="text-sm font-bold" style={{ color: 'var(--ink)' }}>{displayRate}%</span>
          </div>

          {/* 달성률 바 */}
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-muted)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${displayRate}%`, background: 'var(--ink)' }}
            />
          </div>

          {/* 주간: 도트 그리드 / 월간: 일수 요약 */}
          {isMonthly ? (
            <div className="flex items-center justify-between text-xs" style={{ color: 'var(--ink-muted)' }}>
              <span>{monthLabel} 완료 일수</span>
              <span style={{ color: 'var(--ink)', fontWeight: 600 }}>
                {monthlyCompletedDays}일 / {totalDaysInMonth}일
              </span>
            </div>
          ) : (
            <WeeklyDotGrid grid={weeklyGrid} />
          )}
        </button>

        {/* 뱃지 컬렉션 링크 — 위 달성률 카드와 명확한 간격 */}
        <Link href="/badges">
          <a className="flex items-center justify-between p-4 surface-card relative overflow-hidden hover:shadow-md transition-shadow !mt-6">
            <span className="dept-glow" data-dept="youth" />
            <div className="flex items-center gap-3 relative">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--dept-yt-chip)' }}>
                <Trophy className="w-5 h-5" style={{ color: 'var(--dept-yt-chip-text)' }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>뱃지 컬렉션</p>
                <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>획득한 뱃지를 확인하세요</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 relative" style={{ color: 'var(--ink-faint)' }} />
          </a>
        </Link>

        {/* 최근 암송 기록 */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold px-1" style={{ color: 'var(--ink-soft)' }}>최근 기록</h2>
          {recentCompletions.length === 0 ? (
            <div className="text-center py-8 text-sm" style={{ color: 'var(--ink-faint)' }}>
              아직 암송 기록이 없습니다
            </div>
          ) : (
            <div className="space-y-1.5">
              {recentCompletions.map((c, i) => {
                const date = new Date(c.completedAt);
                const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
                const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                const dept = difficultyDeptKey(c.difficulty);
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl surface-card"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                        style={{
                          background: `var(--dept-${dept}-chip)`,
                          color: `var(--dept-${dept}-chip-text)`,
                        }}
                      >
                        {difficultyLabel(c.difficulty)}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>{dateStr} {timeStr}</span>
                    </div>
                    <span className="text-xs font-semibold" style={{ color: 'var(--ink)' }}>+{c.pointsEarned}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
