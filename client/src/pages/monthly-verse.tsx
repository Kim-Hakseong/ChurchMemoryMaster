import { useState } from "react";
import { motion } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNavigation from "@/components/bottom-navigation";
import CaptureButton from "@/components/capture-button";
import { useToast } from "@/hooks/use-toast";
import { useMonthlyVerse } from "@/hooks/use-monthly-verse";
import { formatDate } from "@/lib/date-utils";

const MONTHS = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월'
];

export default function MonthlyVerse() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { toast } = useToast();
  
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  const { data: monthlyVerse, isLoading, error } = useMonthlyVerse(currentYear, currentMonth);


  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleCopy = async () => {
    if (!monthlyVerse) return;
    
    try {
      const textToCopy = `${monthlyVerse.content}\n\n${monthlyVerse.reference}`;
      await navigator.clipboard.writeText(textToCopy);
      
      toast({
        title: "복사 완료",
        description: "암송구절이 클립보드에 복사되었습니다.",
      });
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
      toast({
        title: "복사 실패",
        description: "클립보드 복사에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col pb-16">
      {/* Header */}
      <header
        className="relative z-10 px-4 sm:px-6 pt-8 pb-2"
        style={{
          background: 'var(--page-bg)',
          borderBottom: '1px solid var(--border-soft)',
        }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-lg font-bold" style={{ color: 'var(--ink)' }}>초등월암송</h1>
              <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>{formatDate(new Date())}</p>
            </div>
            <CaptureButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 px-4 sm:px-6 py-3">
        <div className="max-w-4xl mx-auto space-y-4">

          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="w-10 h-10 p-0 hover:bg-surface-muted"
            >
              <ChevronLeft className="w-5 h-5" style={{ color: 'var(--ink-soft)' }} />
            </Button>
            <h2 className="text-xl font-semibold" style={{ color: 'var(--ink)' }}>
              {currentYear}년 {MONTHS[currentMonth - 1]}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="w-10 h-10 p-0 hover:bg-surface-muted"
            >
              <ChevronRight className="w-5 h-5" style={{ color: 'var(--ink-soft)' }} />
            </Button>
          </div>

          {/* Monthly Verse Card */}
          {isLoading ? (
            <div className="verse-card animate-pulse">
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-400">로딩 중...</div>
              </div>
            </div>
          ) : monthlyVerse ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="verse-card relative"
            >
              {/* Quote Icon */}
              <div className="flex items-center justify-center mb-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Quote className="w-6 h-6 text-primary" />
                </div>
              </div>

              {/* Verse Content */}
              <div className="text-center space-y-3">
                <div
                  className="text-sm sm:text-base leading-relaxed px-2"
                  style={{
                    color: 'var(--ink)',
                    // 엑셀 줄바꿈은 무시하고 띄어쓰기만 살려 자연스럽게 흐르게 하되,
                    // 한글 단어 중간에서 줄이 끊기지 않도록 keep-all
                    whiteSpace: 'normal',
                    wordBreak: 'keep-all',
                  }}
                >
                  {monthlyVerse.content.replace(/\s+/g, ' ').trim()}
                </div>

                <div className="flex items-center justify-center gap-3 border-t pt-3" style={{ borderColor: 'var(--border-soft)' }}>
                  <span className="text-sm font-medium" style={{ color: 'var(--ink-soft)' }}>
                    {monthlyVerse.reference}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="h-7 px-2"
                    style={{ background: 'var(--surface-muted)', color: 'var(--ink-soft)', borderColor: 'var(--border-soft)' }}
                  >
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    <span className="text-xs">복사</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="verse-card text-center py-12">
              <Quote className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">이달의 암송구절이 없습니다</h3>
              <p className="text-sm text-gray-500">
                {currentYear}년 {MONTHS[currentMonth - 1]}에 해당하는 암송구절을 찾을 수 없습니다.
              </p>
            </div>
          )}

        </div>
      </main>

      <BottomNavigation />
    </div>
  );
} 