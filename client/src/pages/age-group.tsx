import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useWeeklyVerses } from "@/hooks/use-verses";
import { LocalStorage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import VerseCard from "@/components/verse-card";
import type { Verse, AgeGroup } from "@shared/schema";
import BottomNavigation from "@/components/bottom-navigation";
import CaptureButton from "@/components/capture-button";
import { Link } from "wouter";
import { Baby, Users, GraduationCap, Quote } from "lucide-react";
import { setupBackHandler, cleanupBackHandler, exitApp } from "@/lib/back-handler";
import ExitConfirmDialog from "@/components/exit-confirm-dialog";
import StreakCounter from "@/components/streak-counter";

const ageGroupConfig = {
  kindergarten: {
    title: "유치부",
    subtitle: "5-7세",
    icon: () => (
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center"
        style={{ background: 'var(--dept-kg-chip)' }}
      >
        <Baby className="w-4 h-4" style={{ color: 'var(--dept-kg-chip-text)' }} />
      </div>
    ),
  },
  elementary: {
    title: "초등부",
    subtitle: "8-13세",
    icon: () => (
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center"
        style={{ background: 'var(--dept-el-chip)' }}
      >
        <Users className="w-4 h-4" style={{ color: 'var(--dept-el-chip-text)' }} />
      </div>
    ),
  },
  youth: {
    title: "중고등부",
    subtitle: "14-18세",
    icon: () => (
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center"
        style={{ background: 'var(--dept-yt-chip)' }}
      >
        <GraduationCap className="w-4 h-4" style={{ color: 'var(--dept-yt-chip-text)' }} />
      </div>
    ),
  },
};

export default function AgeGroup() {
  const [location] = useLocation();
  const [match, params] = useRoute("/age-group/:group");
  const [showExitDialog, setShowExitDialog] = useState(false);
  
  // 현재 경로에서 연령 그룹 결정
  const getAgeGroupFromPath = (): AgeGroup => {
    if (location === '/kindergarten' || location === '/') return 'kindergarten';
    if (location === '/elementary') return 'elementary';
    if (location === '/youth') return 'youth';
    if (match && params?.group) return params.group as AgeGroup;
    return 'kindergarten'; // default
  };
  
  const ageGroup = getAgeGroupFromPath();
  const { toast } = useToast();
  const config = ageGroupConfig[ageGroup];
  const { data: weeklyVerses, isLoading, refetch } = useWeeklyVerses(ageGroup);

  // 활성 부서탭 재클릭 → 카드 뒤집기 (강조 ↔ 균등)
  // localStorage에 저장 → 앱 재시작/크래시 후에도 사용자 선택 유지
  const [equalMode, setEqualMode] = useState<boolean>(() => {
    try { return localStorage.getItem('cm_equal_mode') === '1'; } catch { return false; }
  });
  useEffect(() => {
    const handler = () => {
      setEqualMode((prev) => {
        const next = !prev;
        try { localStorage.setItem('cm_equal_mode', next ? '1' : '0'); } catch {}
        return next;
      });
    };
    window.addEventListener('age-group-tab-reclick', handler);
    return () => window.removeEventListener('age-group-tab-reclick', handler);
  }, []);

  // 데이터 확인 및 초기화
  useEffect(() => {
    const verses = LocalStorage.getVerses();
    if (verses.length === 0) {
      console.log('데이터 없음, 초기화');
      LocalStorage.initializeData();
      refetch();
    }
  }, [ageGroup, refetch]);

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

  const handleShare = async () => {
    if (weeklyVerses?.thisWeek) {
      const verse = weeklyVerses.thisWeek;
      const text = `"${verse.content}" - ${verse.reference}`;
      
      if (navigator.share) {
        try {
          await navigator.share({
            title: `${config.title} 이번 주 암송 말씀`,
            text: text,
          });
        } catch (error) {
          // User cancelled sharing
        }
      } else {
        // Fallback to clipboard
        try {
          await navigator.clipboard.writeText(text);
          toast({
            title: "클립보드에 복사됨",
            description: "암송 말씀이 클립보드에 복사되었습니다.",
          });
        } catch (error) {
          toast({
            title: "공유 실패",
            description: "공유 기능을 사용할 수 없습니다.",
            variant: "destructive",
          });
        }
      }
    }
  };



  if (!config) {
    return (
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="verse-card text-center">
          <h1 className="text-xl font-semibold text-gray-800 mb-2">페이지를 찾을 수 없습니다</h1>
          <Link href="/">
            <Button>홈으로 돌아가기</Button>
          </Link>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  const Icon = config.icon;

  const verses = [weeklyVerses?.lastWeek, weeklyVerses?.thisWeek, weeklyVerses?.nextWeek];

  return (
    <div className="relative z-10 min-h-screen pb-12">
      <header
        className="fixed top-0 left-0 right-0 pt-6 pb-1 px-4 z-40"
        style={{
          background: 'var(--page-bg)',
          borderBottom: '1px solid var(--border-soft)',
        }}
      >
        <div className="flex items-center justify-between h-8">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex-shrink-0"><Icon /></div>
            <h1 className="text-lg font-bold m-0 leading-7 flex-shrink-0" style={{ color: 'var(--ink)' }}>{config.title}</h1>
            {ageGroup === 'elementary' && (
              <Link href="/monthly-verse">
                <a
                  className="inline-flex items-center gap-0.5 px-2 py-1 rounded-full shadow border flex-shrink-0 transition-colors"
                  style={{
                    background: 'var(--surface)',
                    color: 'var(--ink-soft)',
                    borderColor: 'var(--border-soft)',
                  }}
                >
                  <Quote className="w-3.5 h-3.5" style={{ color: 'var(--ink)' }} />
                  <span className="text-[11px] font-medium whitespace-nowrap">초등월암송</span>
                </a>
              </Link>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <StreakCounter compact />
            <CaptureButton />
          </div>
        </div>
      </header>

      <main className="px-3 sm:px-5 mt-[58px]">
        {/* 높이: 메인화면(home)과 정확히 동일한 reserve 값(130px) 사용
            → 어느 탭을 들어가도 마지막 카드의 아랫 변 라인이 메인화면과 일치 */}
        <div
          className="flex flex-col py-2"
          style={{ height: 'calc(100dvh - 130px)' }}
        >
          {isLoading ? (
            <div className="flex flex-col gap-2 h-full">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-1 min-h-0">
                  <div className="verse-card animate-pulse p-3 h-full">
                    <div className="h-3 rounded mb-2" style={{ background: 'var(--surface-muted)' }}></div>
                    <div className="h-16 rounded mb-2" style={{ background: 'var(--surface-muted)' }}></div>
                    <div className="h-4 rounded" style={{ background: 'var(--surface-muted)' }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={equalMode ? 'equal' : 'emphasized'}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                style={{ height: '100%' }}
                className="flex flex-col gap-2"
              >
                {equalMode ? (
                  // 균등 모드 — 3장 동일 크기 + 본문 전체 표시
                  <>
                    <div className="flex-1 min-h-0">
                      <VerseCard verse={verses[0] || null} weekType="last" onShare={handleShare} compact equalMode ageGroup={ageGroup} />
                    </div>
                    <div className="flex-1 min-h-0">
                      <VerseCard verse={verses[1] || null} weekType="current" onShare={handleShare} compact equalMode ageGroup={ageGroup} />
                    </div>
                    <div className="flex-1 min-h-0">
                      <VerseCard verse={verses[2] || null} weekType="next" onShare={handleShare} compact equalMode ageGroup={ageGroup} />
                    </div>
                  </>
                ) : (
                  // 강조 모드 (기본) — 이번 주 크게, 지난/다음은 동일한 높이로 살짝 더 크게
                  <>
                    <div className="flex-shrink-0" style={{ height: '108px' }}>
                      <VerseCard verse={verses[0] || null} weekType="last" onShare={handleShare} compact ageGroup={ageGroup} />
                    </div>
                    <div className="flex-1 min-h-0">
                      <VerseCard verse={verses[1] || null} weekType="current" onShare={handleShare} compact ageGroup={ageGroup} />
                    </div>
                    <div className="flex-shrink-0" style={{ height: '108px' }}>
                      <VerseCard verse={verses[2] || null} weekType="next" onShare={handleShare} compact ageGroup={ageGroup} />
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>

      <BottomNavigation />
      
      <ExitConfirmDialog
        open={showExitDialog}
        onOpenChange={setShowExitDialog}
        onConfirm={exitApp}
      />
    </div>
  );
}
