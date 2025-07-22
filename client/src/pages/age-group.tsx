import { motion } from "framer-motion";
import { ArrowLeft, Users, Baby, GraduationCap, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWeeklyVerses } from "@/hooks/use-verses";
import { useToast } from "@/hooks/use-toast";
import VerseCard from "@/components/verse-card";
import BottomNavigation from "@/components/bottom-navigation";
import { Link, useRoute } from "wouter";
import { formatDateRange, getLastWeekRange, getCurrentWeekRange, getNextWeekRange } from "@/lib/date-utils";
import type { AgeGroup } from "@shared/schema";

const ageGroupConfig = {
  kindergarten: {
    title: "유치부",
    subtitle: "5-7세",
    icon: Baby,
    bgColor: "from-pink-400 to-red-400",
    description: "어린이를 위한 쉬운 암송 말씀",
  },
  elementary: {
    title: "초등부", 
    subtitle: "8-13세",
    icon: Users,
    bgColor: "from-blue-400 to-cyan-400",
    description: "초등학생을 위한 기초 암송 말씀",
  },
  youth: {
    title: "중‧고등부",
    subtitle: "14-18세", 
    icon: GraduationCap,
    bgColor: "from-purple-400 to-indigo-400",
    description: "청소년을 위한 깊이 있는 암송 말씀",
  },
};

export default function AgeGroup() {
  const [match, params] = useRoute("/age-group/:group");
  const ageGroup = params?.group as AgeGroup;
  const { toast } = useToast();

  const config = ageGroupConfig[ageGroup];
  const { data: weeklyVerses, isLoading } = useWeeklyVerses(ageGroup);

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
            title: `${config.title} 이번 주 암송 말씀`,
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

  return (
    <>
      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-lg border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="w-10 h-10 p-0 hover:bg-gray-100">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Button>
            </Link>
            <div className={`w-10 h-10 bg-gradient-to-br ${config.bgColor} rounded-xl flex items-center justify-center`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-800">{config.title}</h1>
              <p className="text-xs text-gray-500">{config.subtitle}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 py-6 pb-24 space-y-6">
        {/* Weekly Verses */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-800">주간 암송 말씀</h3>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              <span className="text-sm text-gray-500">주간별 진도</span>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="verse-card animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : (
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
          )}
        </section>
      </main>

      <BottomNavigation />
    </>
  );
}
