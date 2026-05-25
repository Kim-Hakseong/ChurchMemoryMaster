import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Bookmark, Copy, Trash2, GraduationCap as FlashcardIcon } from "lucide-react";
import { Link, useLocation } from "wouter";
import { getBookmarks, removeBookmark, type BookmarkedVerse } from "@/lib/bookmarks";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import BottomNavigation from "@/components/bottom-navigation";
import FlashcardModal from "@/components/flashcard-modal";
import { getFontSize, getFontSizeClass, type AgeGroup } from "@/lib/font-size-settings";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { setupBackHandler, cleanupBackHandler } from "@/lib/back-handler";

const AGE_GROUP_INFO = {
  kindergarten: { name: "유치부", textColor: "text-pink-600" },
  elementary: { name: "초등부", textColor: "text-blue-600" },
  youth: { name: "중고등부", textColor: "text-green-600" },
};

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkedVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<BookmarkedVerse | null>(null);
  const [flashcardModalOpen, setFlashcardModalOpen] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<BookmarkedVerse | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const loadBookmarks = async () => {
    try {
      const data = await getBookmarks();
      setBookmarks(data);
    } catch (error) {
      toast({
        title: "불러오기 실패",
        description: "북마크를 불러올 수 없습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, []);

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

  const handleCopyVerse = async (verse: BookmarkedVerse) => {
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

  const handleRemoveBookmark = async () => {
    if (!deleteTarget) return;

    try {
      await removeBookmark(deleteTarget.id, deleteTarget.ageGroup);
      setBookmarks(prev => prev.filter(b => !(b.id === deleteTarget.id && b.ageGroup === deleteTarget.ageGroup)));
      toast({
        title: "북마크 제거",
        description: "북마크가 제거되었습니다.",
      });
    } catch (error) {
      toast({
        title: "제거 실패",
        description: "북마크 제거에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  const handlePractice = (verse: BookmarkedVerse) => {
    setSelectedVerse(verse);
    setFlashcardModalOpen(true);
  };

  return (
    <div className="min-h-screen relative pb-16">
      {/* 상단 고정 바 */}
      <header
        className="fixed top-0 left-0 right-0 pt-10 pb-4 px-6 z-40"
        style={{
          background: 'var(--page-bg)',
          borderBottom: '1px solid var(--border-soft)',
        }}
      >
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center gap-3">
            <Link href="/home">
              <a
                className="w-8 h-8 rounded-full shadow-sm flex items-center justify-center transition-colors"
                style={{ background: 'var(--surface)', borderColor: 'var(--border-soft)' }}
              >
                <ArrowLeft className="w-4 h-4" style={{ color: 'var(--ink-soft)' }} />
              </a>
            </Link>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'var(--surface-muted)' }}
            >
              <Bookmark className="w-4 h-4" style={{ color: 'var(--ink)' }} />
            </div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--ink)' }}>북마크</h1>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-6 space-y-6 mt-24">
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="verse-card">
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--ink)' }}>
              저장된 암송 구절 ({bookmarks.length}개)
            </h2>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 mx-auto" style={{ borderColor: 'var(--surface-muted)', borderTopColor: 'var(--ink)' }}></div>
                <p className="mt-4" style={{ color: 'var(--ink-soft)' }}>불러오는 중...</p>
              </div>
            ) : bookmarks.length > 0 ? (
              <div className="space-y-3">
                {bookmarks.map((verse, index) => {
                  const info = AGE_GROUP_INFO[verse.ageGroup as keyof typeof AGE_GROUP_INFO];

                  // 부서별 폰트 크기 가져오기
                  const fontSizeClass = getFontSizeClass(getFontSize(verse.ageGroup as AgeGroup));

                  // 내용에서 lessonName 중복 제거
                  let displayContent = verse.content;
                  if (verse.lessonName && verse.content.startsWith(verse.lessonName)) {
                    displayContent = verse.content.substring(verse.lessonName.length).trim();
                  }

                  return (
                    <motion.div
                      key={`${verse.id}-${verse.ageGroup}-${verse.bookmarkedAt}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="verse-card hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-semibold ${info.textColor}`}>
                              {info.name}
                            </span>
                            {verse.lessonName && (
                              <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>• {verse.lessonName}</span>
                            )}
                          </div>
                          <div className={`${fontSizeClass} mb-2 whitespace-pre-line overflow-hidden`} style={{ color: 'var(--ink)' }}>
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
                                onClick={() => handlePractice(verse)}
                                className="h-6 w-6 p-0 hover:bg-teal-100 transition-colors"
                                title="암송 연습"
                              >
                                <FlashcardIcon className="w-3 h-3 text-teal-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCopyVerse(verse)}
                                className="h-6 w-6 p-0 hover:bg-primary/10"
                                title="복사"
                              >
                                <Copy className="w-3 h-3 text-primary" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteTarget(verse)}
                                className="h-6 w-6 p-0 hover:bg-red-100"
                                title="북마크 제거"
                              >
                                <Trash2 className="w-3 h-3 text-red-500" />
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
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--surface-muted)' }}>
                  <Bookmark className="w-8 h-8" style={{ color: 'var(--ink-soft)' }} />
                </div>
                <p style={{ color: 'var(--ink-soft)' }}>아직 북마크한 암송 구절이 없습니다.</p>
                <p className="text-sm mt-2" style={{ color: 'var(--ink-muted)' }}>
                  각 부서 탭에서 암송 구절을 북마크하세요.
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

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>북마크 제거</AlertDialogTitle>
            <AlertDialogDescription>
              이 암송 구절을 북마크에서 제거하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveBookmark}>
              확인
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

