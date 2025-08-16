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

  // 디버깅: 월암송 데이터 상태 로그
  console.log('월암송 페이지 상태:', {
    currentYear,
    currentMonth,
    monthlyVerse,
    isLoading,
    error
  });

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
      <CaptureButton />
      
      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-lg border-b border-gray-100 px-4 sm:px-6 pt-12 pb-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold text-gray-800">초등월암송</h1>
            <p className="text-sm text-gray-500">{formatDate(new Date())}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 px-4 sm:px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="w-10 h-10 p-0 hover:bg-gray-100"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </Button>
            <h2 className="text-xl font-semibold text-gray-800">
              {currentYear}년 {MONTHS[currentMonth - 1]}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="w-10 h-10 p-0 hover:bg-gray-100"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
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
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Quote className="w-8 h-8 text-primary" />
                </div>
              </div>

              {/* Verse Content */}
              <div className="text-center space-y-4">
                <div className="text-lg sm:text-xl leading-relaxed text-gray-800 whitespace-pre-line px-4">
                  {monthlyVerse.content}
                </div>
                
                <div className="text-base font-medium text-gray-600 border-t pt-4">
                  {monthlyVerse.reference}
                </div>
              </div>

              {/* Copy Button */}
              <div className="flex justify-center mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="bg-white/50 hover:bg-white/70 border-gray-200"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  복사
                </Button>
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