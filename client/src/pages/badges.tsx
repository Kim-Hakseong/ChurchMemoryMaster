import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ChevronLeft, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BADGES, type BadgeDefinition } from '@/lib/badge-definitions';
import { useProgress } from '@/hooks/use-progress';
import BadgeCard from '@/components/badge-card';

export default function BadgesPage() {
  const { unlockedBadgeIds, loading } = useProgress();
  const [selectedBadge, setSelectedBadge] = useState<BadgeDefinition | null>(null);

  // 안드로이드 뒤로가기로 팝업 닫기
  useEffect(() => {
    if (!selectedBadge) return;
    const handler = (e: PopStateEvent) => {
      e.preventDefault?.();
      setSelectedBadge(null);
    };
    // 팝업 열릴 때 history 한 칸 푸시 → 뒤로가기 시 popstate 발동 → 팝업 닫힘
    window.history.pushState({ badgePopup: true }, '');
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [selectedBadge]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const unlockedCount = unlockedBadgeIds.length;
  const totalCount = BADGES.length;

  const categories = [
    { key: 'streak', label: '연속 암송' },
    { key: 'count', label: '횟수 달성' },
    { key: 'difficulty', label: '난이도 도전' },
    { key: 'special', label: '특별 업적' },
  ] as const;

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-xl mx-auto p-5 space-y-5">
        {/* 헤더 */}
        <div className="relative flex items-center justify-between mt-4">
          <Link href="/my-progress">
            <a className="inline-flex items-center gap-1" style={{ color: 'var(--ink-soft)' }}>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">암송 뱃지</span>
            </a>
          </Link>
          <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-semibold" style={{ color: 'var(--ink)' }}>뱃지 컬렉션</h1>
          <div className="w-16" />
        </div>

        {/* 진행도 */}
        <div className="surface-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: 'var(--ink-soft)' }}>수집 진행률</span>
            <span className="text-sm font-bold" style={{ color: 'var(--ink)' }}>
              {unlockedCount}/{totalCount}
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-muted)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(unlockedCount / totalCount) * 100}%`, background: 'var(--ink)' }}
            />
          </div>
        </div>

        {/* 카테고리별 뱃지 */}
        {categories.map((cat) => {
          const badges = BADGES.filter((b) => b.category === cat.key);
          return (
            <div key={cat.key} className="space-y-2">
              <h2 className="text-sm font-semibold px-1" style={{ color: 'var(--ink-soft)' }}>{cat.label}</h2>
              <div className="grid grid-cols-3 gap-2">
                {badges.map((badge) => (
                  <BadgeCard
                    key={badge.id}
                    badge={badge}
                    unlocked={unlockedBadgeIds.includes(badge.id)}
                    onClick={() => setSelectedBadge(badge)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 뱃지 말풍선 팝업 — 외부 탭/X 버튼/뒤로가기로 닫힘 */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            style={{ background: 'rgba(0,0,0,0.25)' }}
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 4 }}
              transition={{ type: 'spring', stiffness: 380, damping: 26 }}
              className="relative"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border-soft)',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-glass)',
                padding: '14px 16px 14px 16px',
                maxWidth: '260px',
                width: '100%',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* X 버튼 */}
              <button
                onClick={() => setSelectedBadge(null)}
                className="absolute flex items-center justify-center transition-opacity hover:opacity-100"
                style={{
                  top: 6,
                  right: 6,
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  color: 'var(--ink-muted)',
                  opacity: 0.7,
                }}
                aria-label="닫기"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-start gap-2.5 pr-5">
                <span className="text-lg flex-shrink-0">
                  {unlockedBadgeIds.includes(selectedBadge.id) ? '🏆' : '🔒'}
                </span>
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-sm font-semibold leading-tight mb-1"
                    style={{ color: 'var(--ink)', wordBreak: 'keep-all' }}
                  >
                    {selectedBadge.name}
                  </h3>
                  <p
                    className="text-xs leading-snug"
                    style={{ color: 'var(--ink-muted)', wordBreak: 'keep-all' }}
                  >
                    {selectedBadge.condition}
                  </p>
                  {unlockedBadgeIds.includes(selectedBadge.id) && (
                    <p
                      className="text-[11px] mt-1.5 font-medium"
                      style={{ color: 'var(--dept-el-accent)' }}
                    >
                      ✓ 획득 완료
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
