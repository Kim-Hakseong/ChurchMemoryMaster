import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LocalStorage } from "@/lib/storage";
import { ExcelParser } from "@/lib/excel-parser";
import { scheduleEventCleaning } from "@/lib/calendar-cleaner";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Calendar from "@/pages/calendar";
import AgeGroup from "@/pages/age-group";
import MonthlyVerse from "@/pages/monthly-verse";
import SettingsPage from "@/pages/settings";
import SplashPage from "@/pages/splash";
import SplashScreen from "@/components/splash-screen";
import ScrollToTop from "@/components/scroll-to-top";
import { useEffect, useState } from "react";
import { rescheduleFromLocalStorage } from "@/lib/notifications";

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <AgeGroup />} />
      <Route path="/kindergarten" component={() => <AgeGroup />} />
      <Route path="/elementary" component={() => <AgeGroup />} />
      <Route path="/youth" component={() => <AgeGroup />} />
      <Route path="/age-group/:group" component={AgeGroup} />
      <Route path="/monthly-verse" component={MonthlyVerse} />
      <Route path="/home" component={Home} />
      <Route path="/calendar" component={Calendar} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/splash" component={SplashPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  // 앱 시작시 seed.json 우선 로드(실패 시 기존 엑셀/폴백 순)
  useEffect(() => {
    const loadExcelData = async () => {
      try {
        console.log('📚 교회 암송구절 앱 시작...');
        
        // 📁 파일 시스템 초기화 (clearAll 전에!)
        await LocalStorage.initializeEvents();
        console.log('✅ 파일 시스템 초기화 완료');
        
        // 🔄 최신 이벤트 캐시 로드
        await LocalStorage.getEvents();
        console.log('✅ 이벤트 캐시 로드 완료');
        
        // 기존 구절 데이터만 클리어 (이벤트는 보존)
        LocalStorage.clearAll();
        
        // 1) 첫 설치 시 이벤트가 비어있다면 시드 → 과거 일정 정리 → 영구 저장
        // seed 버전이 바뀌면 강제 재시드 (엑셀 변경 반영)
        const storedSeedVersion = localStorage.getItem('cm_seed_version');
        const existingEvents = await LocalStorage.getEvents();
        let needsSeed = (!existingEvents || existingEvents.length === 0);

        if (needsSeed) {
          try {
            const seedResp = await fetch('/seed.json', { headers: { 'Cache-Control': 'no-cache' } });
            if (seedResp.ok) {
              const seed = await seedResp.json();
              if (seed.seedVersion && seed.seedVersion !== storedSeedVersion) {
                needsSeed = true;
              }
              if (Array.isArray(seed.verses) && seed.verses.length > 0) {
                LocalStorage.saveVerses(seed.verses);
              }
              if (Array.isArray(seed.monthlyVerses) && seed.monthlyVerses.length > 0) {
                LocalStorage.saveMonthlyVerses(seed.monthlyVerses);
              }
              if (Array.isArray(seed.events) && seed.events.length > 0) {
                await LocalStorage.saveEvents(seed.events);
              }
              console.log(`✅ seed.json 적용 완료: v=${seed.verses?.length ?? 0}, m=${seed.monthlyVerses?.length ?? 0}, e=${seed.events?.length ?? 0}`);
              if (seed.seedVersion) {
                localStorage.setItem('cm_seed_version', seed.seedVersion);
              }
            }
          } catch (e) {
            console.log('⚠️ seed.json 없음 또는 로드 실패, 엑셀 로드로 폴백');
          }
        }

        // 2) 엑셀 파일 폴백 로드 (iOS WebView에서도 접근 가능한 상대 경로)
        const excelUrl = `/church_verses.xlsx`;
        const calendarUrl = `/calendar_events.xlsx`;
        
        try {
          const response = await fetch(excelUrl, {
            method: 'GET',
            headers: { 'Cache-Control': 'no-cache' },
          });
          
          if (response.ok) {
            const blob = await response.blob();
            const file = new File([blob], 'church_verses.xlsx', { 
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            });
            
            const result = await ExcelParser.parseFile(file);
            console.log(`✅ 암송구절 로드 완료: ${result.verses.length}개 구절, ${result.monthlyVerses.length}개 월암송`);
            
            if (result.verses.length === 0) {
              throw new Error('암송 말씀 데이터가 없습니다');
            }
          } else {
            throw new Error(`암송 말씀 파일 로드 실패: ${response.status}`);
          }

          // 캘린더 이벤트 파일 로드 (첫 설치 시에만)
          if (needsSeed) {
            try {
              const calendarResponse = await fetch(calendarUrl, {
                method: 'GET',
                headers: { 'Cache-Control': 'no-cache' },
              });
              
              if (calendarResponse.ok) {
                const calendarBlob = await calendarResponse.blob();
                const calendarFile = new File([calendarBlob], 'calendar_events.xlsx', { 
                  type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
                });
                
                const calendarEvents = await ExcelParser.parseCalendarFile(calendarFile);
                console.log(`✅ 캘린더 이벤트 로드 완료: ${calendarEvents.length}개`);
              }
            } catch (calendarError) {
              console.log('⚠️ 캘린더 이벤트 파일 로드 실패 (선택사항)');
            }
          }
          
        } catch (fetchError) {
          console.error('❌ 엑셀 파일 로드 실패:', fetchError);
          console.log('🔄 기본 데이터로 실행...');
          
          // 3) 최종 폴백 데이터 로드
          LocalStorage.loadFallbackData();
          setDataLoaded(true);
          queryClient.invalidateQueries();
          return;
        }
        
        // 시작 화면 설정 적용
        try {
          const start = localStorage.getItem('cm_start');
          if (start) {
            const path = start === 'home' ? '/home' :
              start === 'elementary' ? '/elementary' :
              start === 'kindergarten' ? '/kindergarten' :
              start === 'youth' ? '/youth' : '/calendar';
            if (window.location.pathname === '/' && path) {
              window.history.replaceState({}, '', path);
            }
          }
        } catch {}

        // 1회성: 시드 직후 과거 일정 정리 및 완료 플래그 저장
        try {
          if (needsSeed) {
            // 과거 일정 정리
            scheduleEventCleaning();
            // 즉시 한 번 실행은 scheduleEventCleaning 내부에서 처리됨
            localStorage.setItem('cm_events_seeded', '1');
          }
        } catch {}

        // 최종 보증: 이벤트가 여전히 0개면 폴백 생성 후 저장
        try {
          const afterSeedEvents = await LocalStorage.getEvents();
          if (!afterSeedEvents || afterSeedEvents.length === 0) {
            console.log('⚠️ 이벤트 0개 감지 → 폴백 데이터 주입');
            LocalStorage.loadFallbackData();
          }
        } catch {}

        // UI 업데이트
        setDataLoaded(true);
        queryClient.invalidateQueries();
        
        // 지난 일정 자동 삭제 스케줄러 시작(상시)
        if (!needsSeed) {
          scheduleEventCleaning();
        }

        // 알림 스케줄 재등록 (앱 시작/재시작 시)
        await rescheduleFromLocalStorage();
        
        console.log('🎉 앱 초기화 완료');
        
      } catch (error) {
        console.error('❌ 앱 시작 중 오류:', error);
        setDataLoaded(true); // 오류가 있어도 앱은 계속 실행
      }
    };

    loadExcelData();
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // 스플래시 스크린 표시
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="w-full min-h-screen bg-white relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{background: 'linear-gradient(135deg, hsl(251, 82%, 67%, 0.05), transparent, hsl(166, 73%, 45%, 0.05))'}}></div>
          <div className="pb-20">
            <ScrollToTop />
            <Router />
          </div>
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
