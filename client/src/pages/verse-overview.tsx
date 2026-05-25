import { motion } from "framer-motion";
import { ArrowLeft, Baby, Users, GraduationCap, Copy, Search, X, Bookmark } from "lucide-react";
import { Link, useRoute, useLocation } from "wouter";
import { useVerses } from "@/hooks/use-verses";
import type { AgeGroup, Verse } from "@shared/schema";
import BottomNavigation from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useRef } from "react";
import { getCurrentWeekRange, isDateInRange } from "@/lib/date-utils";
import { setupBackHandler, cleanupBackHandler } from "@/lib/back-handler";
import { toggleBookmark, isBookmarked } from "@/lib/bookmarks";
import FlashcardModal from "@/components/flashcard-modal";
import { getFontSize, getFontSizeClass } from "@/lib/font-size-settings";

const AGE_GROUP_INFO = {
  kindergarten: {
    name: "유치부",
    icon: Baby,
    color: "pink",
    cycle: "1년 1사이클",
    bgColor: "bg-dept-kg-soft",
    textColor: "text-[color:var(--dept-kg-chip-text)]",
    maxLessons: 52,
  },
  elementary: {
    name: "초등부",
    icon: Users,
    color: "blue",
    cycle: "2년 1사이클",
    bgColor: "bg-dept-el-soft",
    textColor: "text-[color:var(--dept-el-chip-text)]",
    maxLessons: 104,
  },
  youth: {
    name: "중고등부",
    icon: GraduationCap,
    color: "green",
    cycle: "3년 1사이클",
    bgColor: "bg-dept-yt-soft",
    textColor: "text-[color:var(--dept-yt-chip-text)]",
    maxLessons: 157,
  },
};

export default function VerseOverview() {
  const [, params] = useRoute("/verse-overview/:ageGroup");
  const [, setLocation] = useLocation();
  const ageGroup = params?.ageGroup as AgeGroup;
  const { data: allVerses } = useVerses(ageGroup);
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarkedVerses, setBookmarkedVerses] = useState<Set<number>>(new Set());
  const currentWeekVerseRef = useRef<HTMLDivElement>(null);
  const [flashcardModalOpen, setFlashcardModalOpen] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);

  const info = AGE_GROUP_INFO[ageGroup];
  const Icon = info?.icon;
  
  // 부서별 폰트 크기 가져오기
  const fontSizeClass = getFontSizeClass(getFontSize(ageGroup as AgeGroup));

  // 뒤로가기 핸들러 (서브 페이지 - 일반 뒤로가기)
  useEffect(() => {
    setupBackHandler({
      isMainTab: false,
      onBack: () => setLocation("/home"),
    });

    return () => {
      cleanupBackHandler();
    };
  }, [setLocation]);
  
  // 중고등부의 경우 순서 재정렬: 105~157을 1~53으로, 1~52는 54~105로, 53~104는 106~157로
  let reorderedVerses = allVerses;
  if (ageGroup === 'youth' && allVerses && allVerses.length >= 157) {
    // 현재: 1~52, 53~104, 105~157
    // 목표: [105~157 → 1~53], [1~52 → 54~105], [53~104 → 106~157]
    const part1 = allVerses.slice(0, 52);    // 현재 1~52과
    const part2 = allVerses.slice(52, 104);  // 현재 53~104과
    const part3 = allVerses.slice(104, 157); // 현재 105~157과
    reorderedVerses = [...part3, ...part1, ...part2];
  }
  
  // 1사이클만 표시 (maxLessons까지만)
  const cycleVerses = reorderedVerses?.slice(0, info?.maxLessons || reorderedVerses?.length);
  
  // 이번 주 암송 구절 찾기 (전체 구절에서 먼저 검색 후, 표시 목록에서 매칭)
  const currentWeekRange = getCurrentWeekRange(new Date());
  const currentWeekVerseFromAll = allVerses?.find(verse => {
    if (!verse.date) return false;
    const verseDate = new Date(verse.date + 'T00:00:00');
    return isDateInRange(verseDate, currentWeekRange);
  });
  // 표시 목록(cycleVerses)에서 동일 구절 찾기 (ID 또는 reference 기준)
  const currentWeekVerse = currentWeekVerseFromAll
    ? cycleVerses?.find(v => v.id === currentWeekVerseFromAll.id || v.reference === currentWeekVerseFromAll.reference)
    : undefined;
  
  // 검색 필터링
  const verses = cycleVerses?.filter(verse => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      verse.content.toLowerCase().includes(query) ||
      verse.reference.toLowerCase().includes(query) ||
      verse.lessonName?.toLowerCase().includes(query)
    );
  });
  
  // 이번 주 암송으로 스크롤
  useEffect(() => {
    if (currentWeekVerse && currentWeekVerseRef.current) {
      setTimeout(() => {
        currentWeekVerseRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 500);
    }
  }, [currentWeekVerse?.id, verses?.length]);

  // 북마크 상태 로드
  useEffect(() => {
    const loadBookmarks = async () => {
      if (!verses) return;
      const bookmarkedSet = new Set<number>();
      for (const verse of verses) {
        const bookmarked = await isBookmarked(verse.id, verse.ageGroup);
        if (bookmarked) {
          bookmarkedSet.add(verse.id);
        }
      }
      setBookmarkedVerses(bookmarkedSet);
    };
    loadBookmarks();
  }, [verses]);

  if (!info) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">잘못된 부서 정보입니다.</p>
          <Link href="/home">
            <a className="text-primary hover:underline mt-4">홈으로 돌아가기</a>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative pb-16">
      {/* 상단 고정 바 */}
      <header
        className="fixed top-0 left-0 right-0 pt-10 pb-4 px-6 z-50"
        style={{
          background: 'var(--page-bg)',
          borderBottom: '1px solid var(--border-soft)',
        }}
      >
        <div className="flex items-center justify-between h-12 mb-3">
          <div className="flex items-center gap-3">
            <Link href="/home">
              <a
                className="w-8 h-8 rounded-full shadow-sm flex items-center justify-center transition-colors"
                style={{ background: 'var(--surface)' }}
              >
                <ArrowLeft className="w-4 h-4" style={{ color: 'var(--ink-soft)' }} />
              </a>
            </Link>
            <div className={`w-8 h-8 rounded-full ${info.bgColor} flex items-center justify-center`}>
              {Icon && <Icon className={`${info.textColor} w-4 h-4`} />}
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--ink)' }}>{info.name}</h1>
              <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>{info.cycle}</p>
            </div>
          </div>
        </div>

        {/* 검색창 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--ink-faint)' }} />
          <Input
            type="text"
            placeholder="공과명, 내용, 장절 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 h-10"
            style={{ background: 'var(--surface)', color: 'var(--ink)', borderColor: 'var(--border-soft)' }}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchQuery("")}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-6 space-y-6 mt-36">
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="verse-card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              전체 암송 목록 ({verses?.length || 0}개)
              {searchQuery && <span className="text-sm font-normal text-gray-600 ml-2">검색 결과</span>}
            </h2>
            
            {verses && verses.length > 0 ? (
              <div className="space-y-3">
                {verses.map((verse, index) => {
                  // 이번 주 암송 구절인지 확인 (ID로 비교)
                  const isCurrentWeek = currentWeekVerse?.id === verse.id;
                  const isBookmarked = bookmarkedVerses.has(verse.id);
                  
                  const handleCopyVerse = async () => {
                    try {
                      const textToCopy = `"${verse.content}" - ${verse.reference}`;
                      await navigator.clipboard.writeText(textToCopy);
                      toast({
                        title: "복사 완료",
                        description: "암송구절이 클립보드에 복사되었습니다.",
                      });
                    } catch (error) {
                      toast({
                        title: "복사 실패",
                        description: "클립보드 복사에 실패했습니다.",
                        variant: "destructive",
                      });
                    }
                  };

                  const handleToggleBookmark = async () => {
                    try {
                      const newState = await toggleBookmark(verse);
                      setBookmarkedVerses(prev => {
                        const newSet = new Set(prev);
                        if (newState) {
                          newSet.add(verse.id);
                        } else {
                          newSet.delete(verse.id);
                        }
                        return newSet;
                      });
                      toast({
                        title: newState ? "북마크 추가" : "북마크 제거",
                        description: newState ? "암송 구절이 북마크에 추가되었습니다." : "북마크가 제거되었습니다.",
                      });
                    } catch (error) {
                      toast({
                        title: "북마크 실패",
                        description: "북마크 처리에 실패했습니다.",
                        variant: "destructive",
                      });
                    }
                  };

                  const handlePractice = () => {
                    setSelectedVerse(verse);
                    setFlashcardModalOpen(true);
                  };
                  
                  // 내용에서 lessonName 중복 제거
                  let displayContent = verse.content;
                  if (verse.lessonName && verse.content.startsWith(verse.lessonName)) {
                    displayContent = verse.content.substring(verse.lessonName.length).trim();
                  }

                  return (
                    <motion.div
                      key={verse.id}
                      ref={isCurrentWeek ? currentWeekVerseRef : null}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`verse-card hover:shadow-md transition-all ${
                        isCurrentWeek ? 'ring-2 ring-primary shadow-lg' : ''
                      }`}
                    >
                      {isCurrentWeek && (
                        <div className="mb-2 flex items-center gap-2">
                          <span
                            className="text-xs font-semibold px-2 py-1 rounded-full"
                            style={{ background: 'var(--surface-muted)', color: 'var(--ink)' }}
                          >
                            📖 이번 주 암송
                          </span>
                        </div>
                      )}
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full ${info.bgColor} flex items-center justify-center font-semibold ${info.textColor} text-sm`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          {verse.lessonName && (
                            <div className="text-sm font-semibold mb-1" style={{ color: 'var(--ink)' }}>
                              {verse.lessonName}
                            </div>
                          )}
                          <div className={`${fontSizeClass} mb-2 whitespace-pre-line overflow-hidden`} style={{ color: 'var(--ink-soft)' }}>
                            {displayContent}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className={`text-xs ${info.textColor} font-medium`}>
                              {verse.reference}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={handlePractice}
                                className="h-6 w-6 p-0 hover:bg-surface-muted transition-colors"
                                title="암송 연습"
                              >
                                <GraduationCap className="w-3 h-3" style={{ color: 'var(--ink-soft)' }} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleToggleBookmark}
                                className={`h-6 w-6 p-0 hover:bg-surface-muted transition-colors ${
                                  isBookmarked ? 'text-ink' : 'text-ink-faint'
                                }`}
                                title="북마크"
                              >
                                <Bookmark className={`w-3 h-3 ${isBookmarked ? 'fill-current' : ''}`} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleCopyVerse}
                                className="h-6 w-6 p-0 hover:bg-surface-muted"
                                title="복사"
                              >
                                <Copy className="w-3 h-3" style={{ color: 'var(--ink-soft)' }} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className={`w-16 h-16 rounded-full ${info.bgColor} flex items-center justify-center mx-auto mb-4`}>
                  {Icon && <Icon className={`${info.textColor} w-8 h-8`} />}
                </div>
                <p className="text-gray-600">
                  {searchQuery ? '검색 결과가 없습니다.' : '아직 등록된 암송 구절이 없습니다.'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {searchQuery ? '다른 검색어를 입력해보세요.' : '설정에서 Excel 파일을 업로드해주세요.'}
                </p>
              </div>
            )}
          </div>
        </motion.section>
      </main>

      <BottomNavigation />

      {/* Flashcard Modal */}
      {selectedVerse && (
        <FlashcardModal
          open={flashcardModalOpen}
          onOpenChange={setFlashcardModalOpen}
          verse={selectedVerse}
        />
      )}
    </div>
  );
}

