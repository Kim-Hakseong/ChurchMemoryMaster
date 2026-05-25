import { Calendar, Bookmark, Copy, GraduationCap as FlashcardIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Verse } from "@shared/schema";
import { useState, useEffect } from "react";
import { toggleBookmark, isBookmarked } from "@/lib/bookmarks";
import FlashcardModal from "@/components/flashcard-modal";
import { getFontSize, getFontSizeClass, type AgeGroup } from "@/lib/font-size-settings";

export type ContentScale = 'relaxed' | 'normal' | 'dense';

interface VerseCardProps {
  verse: Verse | null;
  weekType: "last" | "current" | "next";
  onShare?: (verse?: Verse) => void;
  compact?: boolean;
  ageGroup?: "kindergarten" | "elementary" | "youth";
  contentScale?: ContentScale;
  /** 균등 모드 — 3장이 동일한 크기로 모두 본문 표시 (축약 X) */
  equalMode?: boolean;
}

const weekLabel: Record<VerseCardProps['weekType'], string> = {
  last: '지난 주',
  current: '이번 주',
  next: '다음 주',
};

const deptKeyMap = {
  kindergarten: 'kindergarten',
  elementary: 'elementary',
  youth: 'youth',
} as const;

// 주차 (Week of Year) 계산 — 이미지 "20W", "19W", "21W"의 그 주차
function getWeekOfYear(dateStr: string): number {
  if (!dateStr) return 0;
  const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return 0;
  const start = new Date(d.getFullYear(), 0, 1);
  const days = Math.floor((d.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + start.getDay() + 1) / 7);
}

// 공과명에서 "18과" 같은 공과 번호 추출.
// "18과 이삭을 바친 아브라함" → "18과"
// 못 찾으면 null 반환 → 호출부에서 폴백 처리
function getLessonLabel(lessonName?: string | null): string | null {
  if (!lessonName) return null;
  const m = lessonName.match(/^\s*(\d+)\s*과/);
  return m ? `${m[1]}과` : null;
}

// 균등 모드(3장 동일 크기)용 자동 폰트 — 가독성 위해 한 단계 더 크게 잡고
// 글자수 임계값도 약간 완화. 카드 안에서 짤리지 않도록 max는 보수적으로.
// 글자수가 많을수록 자간(letterSpacing)·장평(scaleX)을 살짝 줄여 한 줄에 더 많이 들어가게 함.
// 카드 1/3 분할에서는 본문 영역이 좁아 짤림 방지를 위해 폰트 max·lh를 더 보수적으로 잡음.
// 60~100자 구간(중간 길이)이 가장 빈번하므로 한 줄 더 확보되도록 폰트·lh를 한 단계 더 축소.
function getEqualContentSize(len: number) {
  if (len <= 30)  return { size: 'clamp(15px, 2.4dvh, 19px)',  lh: 1.45, lessonSize: 'clamp(13px, 1.9dvh, 16px)', letterSpacing: '0',      scaleX: 1    };
  if (len <= 50)  return { size: 'clamp(14px, 2.1dvh, 16px)',  lh: 1.38, lessonSize: 'clamp(13px, 1.8dvh, 15px)', letterSpacing: '-0.1px', scaleX: 0.99 };
  if (len <= 80)  return { size: 'clamp(13px, 1.85dvh, 14px)', lh: 1.32, lessonSize: 'clamp(12px, 1.7dvh, 13px)', letterSpacing: '-0.3px', scaleX: 0.97 };
  if (len <= 120) return { size: 'clamp(12px, 1.7dvh, 13px)',  lh: 1.28, lessonSize: 'clamp(11px, 1.6dvh, 12px)', letterSpacing: '-0.5px', scaleX: 0.95 };
  if (len <= 170) return { size: 'clamp(11px, 1.55dvh, 12px)', lh: 1.26, lessonSize: 'clamp(11px, 1.5dvh, 12px)', letterSpacing: '-0.6px', scaleX: 0.94 };
  if (len <= 230) return { size: 'clamp(10px, 1.4dvh, 11px)',  lh: 1.24, lessonSize: 'clamp(10px, 1.4dvh, 11px)', letterSpacing: '-0.7px', scaleX: 0.93 };
  return            { size: 'clamp(9px, 1.25dvh, 10px)',       lh: 1.22, lessonSize: 'clamp(9px, 1.2dvh, 10px)',  letterSpacing: '-0.8px', scaleX: 0.92 };
}

// 본문 글자 수 기반 동적 폰트 — 카드 안에 자르지 않고 모두 들어가도록
// 큰 주차 숫자 섹션 제거로 본문에 ~70px 추가 공간 확보됨. 그래도 매우 긴 본문은
// 더 작은 사이즈로 떨어트려 reference(출처) 영역을 절대 침범하지 않게 보장.
// 자간/장평도 글자수에 따라 같이 조절되어 더 많은 글자가 들어가도록 함.
function getActiveContentSize(len: number) {
  if (len <= 30)  return { size: 'clamp(20px, 3.4dvh, 26px)', lh: 1.55, lessonSize: 'clamp(15px, 2.2dvh, 19px)', letterSpacing: '0',      scaleX: 1    };
  if (len <= 50)  return { size: 'clamp(18px, 3.0dvh, 23px)', lh: 1.5,  lessonSize: 'clamp(14px, 2.0dvh, 18px)', letterSpacing: '-0.1px', scaleX: 0.99 };
  if (len <= 80)  return { size: 'clamp(16px, 2.6dvh, 21px)', lh: 1.45, lessonSize: 'clamp(14px, 1.9dvh, 17px)', letterSpacing: '-0.2px', scaleX: 0.98 };
  if (len <= 120) return { size: 'clamp(14px, 2.1dvh, 17px)', lh: 1.38, lessonSize: 'clamp(13px, 1.8dvh, 15px)', letterSpacing: '-0.4px', scaleX: 0.96 };
  if (len <= 170) return { size: 'clamp(13px, 1.9dvh, 15px)', lh: 1.34, lessonSize: 'clamp(12px, 1.7dvh, 14px)', letterSpacing: '-0.5px', scaleX: 0.95 };
  if (len <= 230) return { size: 'clamp(12px, 1.7dvh, 14px)', lh: 1.3,  lessonSize: 'clamp(11px, 1.5dvh, 13px)', letterSpacing: '-0.6px', scaleX: 0.94 };
  return            { size: 'clamp(11px, 1.55dvh, 13px)',     lh: 1.26, lessonSize: 'clamp(10px, 1.4dvh, 12px)', letterSpacing: '-0.7px', scaleX: 0.93 };
}

export default function VerseCard({ verse, weekType, onShare, compact = false, ageGroup, contentScale = 'normal', equalMode = false }: VerseCardProps) {
  const { toast } = useToast();
  const [bookmarked, setBookmarked] = useState(false);
  const [showFlashcard, setShowFlashcard] = useState(false);
  const isCurrent = weekType === 'current';

  const fontSizeClass = ageGroup ? getFontSizeClass(getFontSize(ageGroup as AgeGroup)) : 'text-base';
  const deptKey = ageGroup ? deptKeyMap[ageGroup] : 'elementary';

  useEffect(() => {
    const checkBookmark = async () => {
      if (verse) {
        const result = await isBookmarked(verse.id, verse.ageGroup);
        setBookmarked(result);
      }
    };
    checkBookmark();
  }, [verse]);

  const handleCopyVerse = async () => {
    if (!verse) return;
    try {
      const textToCopy = `"${verse.content}" - ${verse.reference}`;
      await navigator.clipboard.writeText(textToCopy);
      toast({ title: '복사 완료', description: '암송구절이 클립보드에 복사되었습니다.' });
    } catch {
      toast({ title: '복사 실패', description: '클립보드 복사에 실패했습니다.', variant: 'destructive' });
    }
  };

  const handleToggleBookmark = async () => {
    if (!verse) return;
    try {
      const newState = await toggleBookmark(verse);
      setBookmarked(newState);
      toast({
        title: newState ? "북마크 추가" : "북마크 제거",
        description: newState ? "암송 구절이 북마크에 추가되었습니다." : "북마크가 제거되었습니다.",
      });
    } catch {
      toast({ title: "북마크 실패", description: "북마크 처리에 실패했습니다.", variant: "destructive" });
    }
  };

  // ============================================================
  // 비활성 카드 (지난 주 / 다음 주) — 작고 1~2줄 truncate
  // ============================================================
  // 균등 모드 — 3장 동일 크기, 본문 전체 표시(축약 X), 글자수 자동 폰트
  // ============================================================
  if (equalMode) {
    const ecs = getEqualContentSize(verse?.content?.length ?? 0);
    return (
      <>
      <div
        className="surface-card flex flex-col h-full relative overflow-hidden"
        style={{
          padding: '12px 14px',
          borderRadius: '18px',
          // 이번 주만 부서 액센트 보더로 살짝 강조
          ...(isCurrent ? { borderColor: `var(--dept-${deptKey === 'kindergarten' ? 'kg' : deptKey === 'elementary' ? 'el' : 'yt'}-accent)`, borderWidth: '1.5px' } : {}),
        }}
        data-verse-card={verse?.id}
      >
        {isCurrent && <span className="dept-glow" data-dept={deptKey} />}
        {verse ? (
          <>
            {/* 상단: 주차 라벨 + 플래시카드/북마크 액션 */}
            <div className="flex items-center justify-between mb-1 relative flex-shrink-0">
              <span
                className="eyebrow"
                style={{
                  color: isCurrent
                    ? `var(--dept-${deptKey === 'kindergarten' ? 'kg' : deptKey === 'elementary' ? 'el' : 'yt'}-chip-text)`
                    : 'var(--ink-muted)',
                  fontWeight: isCurrent ? 700 : 600,
                }}
              >
                {weekLabel[weekType]}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowFlashcard(true)}
                  aria-label="학습"
                  className="flex items-center justify-center transition-colors active:scale-95"
                  style={{ width: 22, height: 22, borderRadius: 6, color: 'var(--ink-soft)' }}
                >
                  <FlashcardIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleToggleBookmark}
                  aria-label="북마크"
                  className="flex items-center justify-center transition-colors active:scale-95"
                  style={{ width: 22, height: 22, borderRadius: 6, color: bookmarked ? 'var(--ink)' : 'var(--ink-faint)' }}
                >
                  <Bookmark className="w-3.5 h-3.5" fill={bookmarked ? 'currentColor' : 'transparent'} />
                </button>
              </div>
            </div>

            {verse.lessonName && (
              <h3
                className="font-semibold leading-tight relative flex-shrink-0 mb-0.5"
                style={{ color: 'var(--ink)', fontSize: ecs.lessonSize }}
              >
                {verse.lessonName}
              </h3>
            )}
            <div
              className="leading-snug relative flex-1 min-h-0 overflow-hidden"
              style={{
                color: 'var(--ink-soft)',
                fontSize: ecs.size,
                lineHeight: ecs.lh,
                wordBreak: 'keep-all',
                letterSpacing: ecs.letterSpacing,
              }}
            >
              <div
                style={{
                  transform: ecs.scaleX !== 1 ? `scaleX(${ecs.scaleX})` : 'none',
                  transformOrigin: 'left top',
                  width: ecs.scaleX !== 1 ? `${(100 / ecs.scaleX).toFixed(2)}%` : '100%',
                }}
              >
                {verse.content}
              </div>
            </div>

            {/* 하단: reference + 복사 버튼 */}
            <div className="flex items-center justify-between mt-1 relative flex-shrink-0">
              <span style={{ color: 'var(--ink-muted)', fontSize: 'clamp(10px, 1.3dvh, 12px)' }}>
                {verse.reference}
              </span>
              <button
                type="button"
                onClick={handleCopyVerse}
                aria-label="복사"
                className="flex items-center justify-center transition-colors active:scale-95"
                style={{ width: 22, height: 22, borderRadius: 6, color: 'var(--ink-soft)' }}
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs" style={{ color: 'var(--ink-muted)' }}>
            <Calendar className="w-3.5 h-3.5 mr-1" /> {weekLabel[weekType]} 암송구절이 없습니다
          </div>
        )}
      </div>
      {verse && (
        <FlashcardModal
          open={showFlashcard}
          onOpenChange={setShowFlashcard}
          verse={verse}
        />
      )}
      </>
    );
  }

  // ============================================================
  // 비활성 카드 (지난 주 / 다음 주) — 작고 1~2줄 truncate (강조 모드)
  // ============================================================
  if (!isCurrent) {
    const week = verse ? getWeekOfYear(verse.date) : 0;
    const lessonLabel = getLessonLabel(verse?.lessonName);
    return (
      <div
        className="surface-card flex items-start"
        style={{
          padding: '12px 16px',
          borderRadius: '18px',
          opacity: verse ? 0.9 : 1,
          height: '100%',
        }}
        data-verse-card={verse?.id}
      >
        {verse ? (
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between mb-0.5">
              <span className="eyebrow" style={{ color: 'var(--ink-muted)' }}>{weekLabel[weekType]}</span>
              <span className="eyebrow" style={{ color: 'var(--ink-faint)' }}>{lessonLabel ?? `${week}W`}</span>
            </div>
            <p
              className="clamp-2 leading-snug"
              style={{ color: 'var(--ink-soft)', fontSize: 'clamp(13px, 1.7dvh, 15px)' }}
            >
              {verse.content}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--ink-muted)' }}>{verse.reference}</p>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs" style={{ color: 'var(--ink-muted)' }}>
            <Calendar className="w-3.5 h-3.5 mr-1" /> {weekLabel[weekType]} 암송구절이 없습니다
          </div>
        )}
      </div>
    );
  }

  // ============================================================
  // 액티브 카드 (이번 주) — 부서 글로우 + 북마크 + 본문(자동 폰트) + 복사
  // ============================================================
  const cs = getActiveContentSize(verse?.content?.length ?? 0);

  return (
    <>
      <div
        className="verse-card-active flex flex-col h-full"
        data-verse-card={verse?.id}
      >
        {/* 부서 글로우 (코너 장식) */}
        <span className="dept-glow" data-dept={deptKey} />

        {/* 상단: 부서 chip(주차 숫자 제거) + 북마크 */}
        <div className="flex items-start justify-between relative mb-2 flex-shrink-0">
          <div className="dept-chip" data-dept={deptKey}>
            {weekLabel[weekType]}
          </div>
          {verse && (
            <button
              onClick={handleToggleBookmark}
              aria-label="북마크"
              className="flex items-center justify-center transition-transform active:scale-95"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '999px',
                background: bookmarked ? `var(--dept-${deptKey === 'kindergarten' ? 'kg' : deptKey === 'elementary' ? 'el' : 'yt'}-accent)` : 'var(--surface-muted)',
                color: bookmarked ? 'var(--surface)' : 'var(--ink-soft)',
              }}
            >
              <Bookmark className="w-4 h-4" fill={bookmarked ? 'currentColor' : 'transparent'} />
            </button>
          )}
        </div>

        {verse ? (
          <>
            {/* 공과명 (있으면) — 주차 큰 숫자 섹션 제거하고 그 자리 활용 */}
            {verse.lessonName && (
              <h3
                className="font-semibold mb-2 relative flex-shrink-0"
                style={{ color: 'var(--ink)', fontSize: cs.lessonSize, lineHeight: 1.3 }}
              >
                {verse.lessonName}
              </h3>
            )}

            {/* 본문 — 가용 공간 전부 사용. overflow-hidden으로 reference 침범 방지 */}
            <blockquote
              className={`${fontSizeClass} font-medium leading-relaxed relative flex-1 min-h-0 overflow-hidden`}
              style={{
                color: 'var(--ink)',
                fontSize: cs.size,
                lineHeight: cs.lh,
                wordBreak: 'keep-all',
                letterSpacing: cs.letterSpacing,
              }}
            >
              <div
                style={{
                  transform: cs.scaleX !== 1 ? `scaleX(${cs.scaleX})` : 'none',
                  transformOrigin: 'left top',
                  width: cs.scaleX !== 1 ? `${(100 / cs.scaleX).toFixed(2)}%` : '100%',
                }}
              >
                {verse.content}
              </div>
            </blockquote>

            {/* 하단: reference + 복사 + 암송연습 버튼 */}
            <div className="flex items-center justify-between mt-3 relative flex-shrink-0">
              <cite
                className="not-italic font-medium"
                style={{ color: 'var(--ink-muted)', fontSize: '13px' }}
              >
                — {verse.reference}
              </cite>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyVerse}
                  aria-label="복사"
                  className="flex items-center justify-center transition-transform active:scale-95"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '999px',
                    background: 'var(--surface-muted)',
                    color: 'var(--ink-soft)',
                  }}
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowFlashcard(true)}
                  aria-label="암송연습"
                  className="flex items-center justify-center transition-transform active:scale-95"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '999px',
                    background: 'var(--surface-muted)',
                    color: 'var(--ink-soft)',
                  }}
                >
                  <FlashcardIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <Calendar className="w-8 h-8 mb-2" style={{ color: 'var(--ink-faint)' }} />
            <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>이번 주 암송구절이 없습니다</p>
          </div>
        )}
      </div>

      {verse && (
        <FlashcardModal
          open={showFlashcard}
          onOpenChange={setShowFlashcard}
          verse={verse}
        />
      )}
    </>
  );
}
