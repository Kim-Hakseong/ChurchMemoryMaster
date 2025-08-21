import { useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useWeeklyVerses } from "@/hooks/use-verses";
import { LocalStorage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import VerseCard from "@/components/verse-card";
import BottomNavigation from "@/components/bottom-navigation";
import CaptureButton from "@/components/capture-button";
import { Link } from "wouter";
import { Baby, Users, GraduationCap, Quote } from "lucide-react";
import type { AgeGroup } from "@shared/schema";

const ageGroupConfig = {
  kindergarten: {
    title: "유치부",
    subtitle: "5-7세",
    icon: () => (
      <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
        <Baby className="text-pink-600 w-4 h-4" />
      </div>
    ),
  },
  elementary: {
    title: "초등부", 
    subtitle: "8-13세",
    icon: () => (
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
        <Users className="text-blue-600 w-4 h-4" />
      </div>
    ),
  },
  youth: {
    title: "중고등부",
    subtitle: "14-18세",
    icon: () => (
      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
        <GraduationCap className="text-green-600 w-4 h-4" />
      </div>
    ),
  },
};

export default function AgeGroup() {
  const [location] = useLocation();
  const [match, params] = useRoute("/age-group/:group");
  
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

  // 데이터 확인 및 초기화
  useEffect(() => {
    const verses = LocalStorage.getVerses();
    if (verses.length === 0) {
      console.log('데이터 없음, 초기화');
      LocalStorage.initializeData();
      refetch();
    }
  }, [ageGroup, refetch]);

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

  return (
    <div className="relative z-10 min-h-screen pb-16">
      <header className="fixed top-0 left-0 right-0 pt-10 pb-4 px-6 bg-gradient-to-r from-blue-50 to-purple-50 z-40">
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center gap-3">
            <Icon />
            <div>
              <h1 className="text-xl font-bold text-gray-800">{config.title}</h1>
            </div>
            {ageGroup === 'elementary' && (
              <Link href="/monthly-verse">
                <a className="ml-1 inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white shadow border text-gray-700 hover:bg-gray-50">
                  <Quote className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium">초등월암송</span>
                </a>
              </Link>
            )}
          </div>
          {/* 우측 캡처 버튼과의 시각적 간격 확보용 공간 */}
          <div className="w-16" />
        </div>
      </header>

      <main className="flex-1 px-3 py-3 sm:px-5 mt-24">
        <div>
          {isLoading ? (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="verse-card animate-pulse p-3">
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-16 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              <VerseCard
                verse={weeklyVerses?.lastWeek || null}
                weekType="last"
                onShare={handleShare}
                compact
              />
              <VerseCard
                verse={weeklyVerses?.thisWeek || null}
                weekType="current"
                onShare={handleShare}
                compact
              />
              <VerseCard
                verse={weeklyVerses?.nextWeek || null}
                weekType="next"
                onShare={handleShare}
                compact
              />
            </div>
          )}
        </div>
      </main>

      <CaptureButton />
      <BottomNavigation />
    </div>
  );
}
