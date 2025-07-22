import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, TrendingUp, Users, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWeeklyVerses, useVersesStats } from "@/hooks/use-verses";
import { useToast } from "@/hooks/use-toast";
import VerseCard from "@/components/verse-card";
import BottomNavigation from "@/components/bottom-navigation";
import ExcelUploader from "@/components/excel-uploader";
import CalendarModal from "@/components/calendar-modal";
import { formatDateRange, getLastWeekRange, getCurrentWeekRange, getNextWeekRange, formatDate } from "@/lib/date-utils";
import { LocalStorage } from "@/lib/storage";

export default function Home() {
  const [showCalendar, setShowCalendar] = useState(false);
  const [hasData, setHasData] = useState(() => LocalStorage.getVerses().length > 0);
  const { toast } = useToast();

  const { data: weeklyVerses } = useWeeklyVerses("elementary");
  const { data: stats } = useVersesStats();

  const lastWeekRange = getLastWeekRange();
  const thisWeekRange = getCurrentWeekRange();
  const nextWeekRange = getNextWeekRange();

  const handleMemorize = () => {
    toast({
      title: "암송 연습",
      description: "암송 연습 기능이 곧 추가될 예정입니다.",
    });
  };

  const handleShare = async () => {
    if (weeklyVerses?.thisWeek) {
      const verse = weeklyVerses.thisWeek;
      const text = `"${verse.verse}" - ${verse.reference}`;
      
      if (navigator.share) {
        try {
          await navigator.share({
            title: '이번 주 암송 말씀',
            text: text,
          });
        } catch (error) {
          // User cancelled sharing
        }
      } else {
        await navigator.clipboard.writeText(text);
        toast({
          title: "클립보드에 복사됨",
          description: "암송 말씀이 클립보드에 복사되었습니다.",
        });
      }
    }
  };

  if (!hasData) {
    return (
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <ExcelUploader onUploadComplete={() => setHasData(true)} />
        <BottomNavigation />
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-lg border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
              <i className="fas fa-bible text-white text-lg"></i>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-800">교회학교 암송</h1>
              <p className="text-xs text-gray-500">{formatDate(new Date())}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0 hover:bg-gray-100"
          >
            <Bell className="w-5 h-5 text-gray-600" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 py-6 pb-24 space-y-6">
        {/* Weekly Verses Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">이번 주 암송 말씀</h2>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-500">실시간 업데이트</span>
            </div>
          </div>

          <div className="space-y-4">
            <VerseCard
              verse={weeklyVerses?.lastWeek || null}
              weekType="last"
              dateRange={formatDateRange(lastWeekRange.start, lastWeekRange.end)}
            />
            <VerseCard
              verse={weeklyVerses?.thisWeek || null}
              weekType="current"
              dateRange={formatDateRange(thisWeekRange.start, thisWeekRange.end)}
              onMemorize={handleMemorize}
              onShare={handleShare}
            />
            <VerseCard
              verse={weeklyVerses?.nextWeek || null}
              weekType="next"
              dateRange={formatDateRange(nextWeekRange.start, nextWeekRange.end)}
            />
          </div>
        </section>

        {/* Stats Section */}
        <section className="verse-card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">이번 달 암송 현황</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold text-lg">{stats?.completed || 0}</span>
              </div>
              <p className="text-xs text-gray-500">완료</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 gradient-secondary rounded-xl flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold text-lg">{stats?.inProgress || 0}</span>
              </div>
              <p className="text-xs text-gray-500">진행중</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-accent to-green-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold text-lg">{stats?.upcoming || 0}</span>
              </div>
              <p className="text-xs text-gray-500">예정</p>
            </div>
          </div>
        </section>

        {/* Age Group Quick Access */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">연령별 바로가기</h3>
          <div className="grid grid-cols-3 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="verse-card text-center"
              onClick={() => window.location.href = '/age-group/kindergarten'}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-red-400 rounded-xl flex items-center justify-center mx-auto mb-2">
                <i className="fas fa-baby text-white"></i>
              </div>
              <p className="text-sm font-medium text-gray-700">유치부</p>
              <p className="text-xs text-gray-500">5-7세</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="verse-card text-center"
              onClick={() => window.location.href = '/age-group/elementary'}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Users className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-medium text-gray-700">초등부</p>
              <p className="text-xs text-gray-500">8-13세</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="verse-card text-center"
              onClick={() => window.location.href = '/age-group/youth'}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-xl flex items-center justify-center mx-auto mb-2">
                <i className="fas fa-user-graduate text-white"></i>
              </div>
              <p className="text-sm font-medium text-gray-700">중‧고등부</p>
              <p className="text-xs text-gray-500">14-18세</p>
            </motion.button>
          </div>
        </section>
      </main>

      <BottomNavigation />
      <CalendarModal isOpen={showCalendar} onClose={() => setShowCalendar(false)} />
    </>
  );
}
