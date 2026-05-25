import { useState, useRef, useEffect } from "react";
import { Capacitor } from '@capacitor/core';
import { motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Download, Upload, Plus, X, Trash2, Minus, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCalendarData } from "@/hooks/use-calendar";
import BottomNavigation from "@/components/bottom-navigation";
import CaptureButton from "@/components/capture-button";
import { Link } from "wouter";
import { formatDate } from "@/lib/date-utils";
import { exportEventsToCSV, importEventsFromCSVFile } from "@/lib/csv-utils";
import { ExcelParser } from "@/lib/excel-parser";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { LocalStorage } from "@/lib/storage";
import { setupBackHandler, cleanupBackHandler, exitApp } from "@/lib/back-handler";
import ExitConfirmDialog from "@/components/exit-confirm-dialog";
import type { Event } from "@shared/schema";

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
const MONTHS = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월'
];

// 이벤트 색상 배열
const EVENT_COLORS = [
  'bg-blue-500', 'bg-green-500', 'bg-teal-500', 'bg-red-500',
  'bg-yellow-500', 'bg-pink-500', 'bg-cyan-500', 'bg-orange-500'
];

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  const { data: calendarData, isLoading } = useCalendarData(currentYear, currentMonth);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showExitDialog, setShowExitDialog] = useState(false);
  
  // CSV 팝업 상태
  const [showCsvModal, setShowCsvModal] = useState(false);

  // 일정 추가 모달 상태
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showDeleteEventModal, setShowDeleteEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    date: '',
    title: '',
    description: '',
    category: '',
    time: '',
    location: '',
    startDate: '',
    endDate: ''
  });

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

  // CSV 내보내기
  const handleExportCsv = async () => {
    try {
      await exportEventsToCSV();
      const isIOS = Capacitor.getPlatform() === 'ios';
      toast({ 
        title: "CSV 내보내기 완료", 
        description: isIOS ? "iOS에서는 공유 시트가 열립니다." : "현재 일정이 CSV로 저장되었습니다." 
      });
    } catch (error) {
      toast({ title: "내보내기 실패", description: "CSV 저장 중 오류가 발생했습니다.", variant: "destructive" });
    }
  };

  // 엑셀/CSV 파일 업로드
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      console.log('캘린더 파일 업로드 시작:', file.name);

      let added = 0;
      if (file.name.toLowerCase().endsWith('.csv')) {
        added = await importEventsFromCSVFile(file);
      } else if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
        const events = await ExcelParser.parseCalendarFile(file);
        added = events.length;
      } else {
        throw new Error('지원 형식: .csv, .xlsx, .xls');
      }
      
      // 데이터 새로고침 (캘린더와 이벤트 모두)
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      
      toast({
        title: "업로드 완료",
        description: `${added}개의 일정이 추가되었습니다.`,
      });
      
    } catch (error) {
      console.error('캘린더 파일 업로드 실패:', error);
      toast({
        title: "업로드 실패",
        description: error instanceof Error ? error.message : "파일 업로드 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 파일 선택 창 열기
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // 일정 추가 모달 열기
  const handleAddEventClick = (selectedDate?: string) => {
    setNewEvent({
      date: selectedDate || new Date().toISOString().split('T')[0],
      title: '',
      description: '',
      category: '',
      time: '',
      location: '',
      startDate: '',
      endDate: ''
    });
    setShowAddEventModal(true);
  };

  // 일정 삭제 모달 열기
  const handleDeleteEventClick = () => {
    setShowDeleteEventModal(true);
  };

  // 특정 일정 삭제
  const handleDeleteEvent = async (eventId: number) => {
    try {
      const success = await LocalStorage.deleteEvent(eventId);
      console.log('📁 파일에서 이벤트 삭제:', success ? '성공' : '실패');

      // 데이터 새로고침
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      
      toast({
        title: "일정 삭제 완료",
        description: "선택한 일정이 삭제되었습니다.",
      });
      
      setShowDeleteEventModal(false);
    } catch (error) {
      console.error('일정 삭제 실패:', error);
      toast({
        title: "삭제 실패",
        description: "일정 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // 일정 추가 저장
  const handleSaveEvent = async () => {
    console.log('📝 일정 저장 시작:', newEvent);
    
    if (!newEvent.title.trim() || !newEvent.startDate) {
      toast({
        title: "입력 오류", 
        description: "제목과 시작일은 필수 입력 항목입니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      // 날짜 설정: 시작일이 있으면 시작일을, 없으면 오늘 날짜 사용
      const eventDate = newEvent.startDate || new Date().toISOString().split('T')[0];
      
      // 새 이벤트 생성 (제목에 날짜 추가하지 않음)
      const event = {
        date: eventDate,
        title: newEvent.title.trim(),
        description: [
          newEvent.description,
          newEvent.category && `분류: ${newEvent.category}`,
          newEvent.time && `시간: ${newEvent.time}`,
          newEvent.location && `장소: ${newEvent.location}`
        ].filter(Boolean).join('\n') || null,
        ageGroup: null,
        startDate: newEvent.startDate || null,
        endDate: newEvent.endDate || null
      };

      console.log('💾 생성된 이벤트:', event);

      // 파일에 이벤트 저장
      const eventId = await LocalStorage.saveEvent(event);
      console.log('📁 파일에 이벤트 저장 완료, ID:', eventId);

      // 저장 후 확인
      const savedEvents = await LocalStorage.getEvents();
      console.log('✅ 최종 저장 확인 - 현재 이벤트 수:', savedEvents.length);

      // 데이터 새로고침 (캘린더와 이벤트 모두)
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });

      // 폼 초기화
      setNewEvent({
        date: '',
        title: '',
        description: '',
        category: '',
        time: '',
        location: '',
        startDate: '',
        endDate: ''
      });
      setShowAddEventModal(false);
      
      toast({
        title: "일정 추가 완료",
        description: `새 일정이 성공적으로 추가되었습니다. (총 ${savedEvents.length}개)`,
      });

    } catch (error) {
      console.error('❌ 일정 추가 실패:', error);
      toast({
        title: "일정 추가 실패",
        description: "일정 추가 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const getDaysInMonth = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for previous month days
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = new Date(currentYear, currentMonth, -startingDayOfWeek + i + 1);
      days.push({ date: prevDate, isCurrentMonth: false });
    }

    // Add current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      days.push({ date, isCurrentMonth: true });
    }

    return days;
  };

  // 이벤트가 이미 지난 일정인지 확인 (종료일 또는 date가 오늘 이전)
  const isEventPast = (event: Event): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventEnd = new Date((event.endDate || event.date) + 'T00:00:00');
    eventEnd.setHours(0, 0, 0, 0);
    return eventEnd < today;
  };

  // 해당 날짜의 이벤트들과 색상 정보 반환
  const getEventsOnDate = (date: Date) => {
    // SQLite 캐시에서 가져오기 + 과거 이벤트 필터링
    const allEvents = LocalStorage.getEventsSync().filter((ev: Event) => !isEventPast(ev));
    // 시간대 문제를 피하기 위해 로컬 시간대로 날짜 문자열 생성
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const eventsOnDate = allEvents.filter((event: Event) => {
      // 기본 이벤트 날짜 확인
      if (event.date === dateStr) {
        return true;
      }
      
      // 기간 이벤트인 경우 해당 날짜가 기간 내에 있는지 확인
      if (event.startDate && event.endDate) {
        const targetDate = new Date(year, date.getMonth(), date.getDate());
        const startDate = new Date(event.startDate + 'T00:00:00');
        const endDate = new Date(event.endDate + 'T00:00:00');
        
        // 시간대 문제를 방지하기 위해 날짜만 비교
        targetDate.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);
        
        return targetDate >= startDate && targetDate <= endDate;
      }
      
      return false;
    });

    // 중복 제거 (같은 이벤트가 중복 표시되지 않도록)
    const signature = (ev: Event) => `${ev.title}|${ev.date}|${ev.startDate||''}|${ev.endDate||''}`;
    const map = new Map<string, Event>();
    for (const ev of eventsOnDate) {
      const sig = signature(ev);
      if (!map.has(sig)) map.set(sig, ev);
    }
    return Array.from(map.values());
  };

  const hasEventOnDate = (date: Date) => {
    return getEventsOnDate(date).length > 0;
  };

  // 이벤트 색상 가져오기 (이벤트 ID 기반)
  const getEventColor = (eventId: number) => {
    return EVENT_COLORS[eventId % EVENT_COLORS.length];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="min-h-screen flex flex-col pb-12">
      <CaptureButton />
      
      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 pt-6 pb-1 shadow-sm"
        style={{
          background: 'var(--page-bg)',
          borderBottom: '1px solid var(--border-soft)',
        }}
      >
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {/* 왼쪽: 제목과 날짜 */}
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--surface-muted)' }}
            >
              <CalendarIcon className="w-3.5 h-3.5" style={{ color: 'var(--ink)' }} />
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: 'var(--ink)' }}>캘린더</h1>
              <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>{formatDate(new Date())}</p>
            </div>
          </div>

          {/* 오른쪽: CSV 파일 버튼 */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCsvModal(true)}
            className="h-8 text-xs mr-4"
            style={{
              background: 'var(--surface)',
              color: 'var(--ink-soft)',
              borderColor: 'var(--border-soft)',
            }}
          >
            <FileSpreadsheet className="w-3 h-3 mr-1" />
            CSV파일
          </Button>
        </div>
        
        {/* 숨겨진 파일 입력 */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileUpload}
          className="hidden"
        />
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 px-4 sm:px-6 py-4 pb-16 pt-16">
        <div className="max-w-4xl mx-auto space-y-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mt-1.5 mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('prev')}
            className="w-10 h-10 p-0 hover:bg-surface-muted"
          >
            <ChevronLeft className="w-5 h-5" style={{ color: 'var(--ink-soft)' }} />
          </Button>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--ink)' }}>
            {currentYear}년 {MONTHS[currentMonth]}
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

        {/* Calendar */}
        <div className="verse-card">
          {/* Calendar Header */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {DAYS.map((day) => (
              <div key={day} className="text-center text-sm font-medium py-3" style={{ color: 'var(--ink-muted)' }}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth().map((dayInfo, index) => {
              const { date, isCurrentMonth } = dayInfo;
              const eventsOnDate = getEventsOnDate(date);
              const hasEvent = eventsOnDate.length > 0;
              const today = isToday(date);

              const cellColor = !isCurrentMonth
                ? 'var(--ink-faint)'
                : today
                  ? 'var(--surface)'
                  : 'var(--ink-soft)';

              return (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="aspect-square flex flex-col items-center justify-center text-sm rounded-xl transition-all duration-200 relative"
                  style={{
                    color: cellColor,
                    fontWeight: today || (hasEvent && !today) ? 600 : 400,
                    background: today
                      ? 'var(--ink)'
                      : hasEvent && !today
                        ? 'var(--surface-muted)'
                        : 'transparent',
                    boxShadow: today ? '0 4px 12px rgba(0,0,0,0.18)' : undefined,
                  }}
                >
                  {date.getDate()}
                  {/* 다중 이벤트 점들 표시 */}
                  {hasEvent && !today && (
                    <div className="absolute bottom-1 flex space-x-0.5">
                      {eventsOnDate.slice(0, 3).map((event: Event, eventIndex: number) => (
                        <div
                          key={event.id}
                          className={`w-1.5 h-1.5 rounded-full ${getEventColor(event.id)}`}
                        />
                      ))}
                      {eventsOnDate.length > 3 && (
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--ink-faint)' }} />
                      )}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Events List */}
        {(() => {
          // 과거 이벤트 필터링
          const activeEvents = (calendarData?.events || []).filter(ev => !isEventPast(ev));
          return activeEvents.length > 0 ? (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-lg text-base font-semibold whitespace-nowrap" style={{ color: 'var(--ink)' }}>이번 달 행사</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteEventClick}
                  className="bg-red-50 hover:bg-red-100 border-red-200 text-red-600 scale-75 origin-right z-10"
                >
                  <Minus className="w-3 h-3 mr-1" />
                  일정 삭제
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddEventClick()}
                  className="bg-primary/10 hover:bg-primary/20 border-primary/20 scale-75 origin-left"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  일정 추가
                </Button>
              </div>
            </div>
            {activeEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="verse-card"
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${getEventColor(event.id)}`} />
                  <div className="flex-1">
                    <h4 className="text-base font-medium mb-1" style={{ color: 'var(--ink)' }}>
                      {event.title}
                    </h4>
                    <p className="text-sm mb-2" style={{ color: 'var(--ink-soft)' }}>
                      {event.startDate && event.endDate ? (
                        // 기간 이벤트인 경우
                        <>
                          {new Date(event.startDate + 'T00:00:00').toLocaleDateString('ko-KR', {
                            month: 'long',
                            day: 'numeric',
                            weekday: 'short'
                          })}
                          {' ~ '}
                          {new Date(event.endDate + 'T00:00:00').toLocaleDateString('ko-KR', {
                            month: 'long',
                            day: 'numeric',
                            weekday: 'short'
                          })}
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            {Math.ceil((new Date(event.endDate).getTime() - new Date(event.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1}일간
                          </span>
                        </>
                      ) : (
                        // 단일 이벤트인 경우
                        new Date(event.date + 'T00:00:00').toLocaleDateString('ko-KR', {
                          month: 'long',
                          day: 'numeric',
                          weekday: 'long'
                        })
                      )}
                    </p>
                    {event.description && (
                      <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </section>
        ) : (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-lg text-base font-semibold whitespace-nowrap" style={{ color: 'var(--ink)' }}>이번 달 행사</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddEventClick()}
                className="bg-primary/10 hover:bg-primary/20 border-primary/20 scale-75 origin-right"
              >
                <Plus className="w-3 h-3 mr-1" />
                일정 추가
              </Button>
            </div>
            <div className="verse-card text-center py-12">
              <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">행사가 없습니다</h3>
              <p className="text-sm text-gray-500 mb-4">이번 달에 예정된 행사가 없습니다.</p>
              <Button
                variant="default"
                size="sm"
                onClick={() => handleAddEventClick()}
                className="bg-primary hover:bg-primary/90 scale-75"
              >
                <Plus className="w-3 h-3 mr-2" />
                첫 번째 일정 추가하기
              </Button>
            </div>
          </section>
        );
        })()}


        </div>
      </main>

      {/* 일정 추가 모달 */}
      <Dialog open={showAddEventModal} onOpenChange={setShowAddEventModal}>
        <DialogContent className="sm:max-w-md max-w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>새 일정 추가</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* 제목 */}
            <div className="space-y-2">
              <Label htmlFor="event-title">제목 *</Label>
              <Input
                id="event-title"
                type="text"
                value={newEvent.title}
                onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                className="w-full"
                placeholder="행사 제목을 입력하세요"
                autoComplete="off"
              />
            </div>
            
            {/* 설명 */}
            <div className="space-y-2">
              <Label htmlFor="event-description">설명</Label>
              <Textarea
                id="event-description"
                value={newEvent.description}
                onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                className="w-full"
                placeholder="행사 설명을 입력하세요"
                rows={3}
              />
            </div>
            
            {/* 카테고리 */}
            <div className="space-y-2">
              <Label htmlFor="event-category">분류</Label>
              <Input
                id="event-category"
                value={newEvent.category}
                onChange={(e) => setNewEvent(prev => ({ ...prev, category: e.target.value }))}
                className="w-full"
                placeholder="예배, 행사, 모임 등"
              />
            </div>
            
            {/* 시간 */}
            <div className="space-y-2">
              <Label htmlFor="event-time">시간</Label>
              <Input
                id="event-time"
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                className="w-full"
              />
            </div>
            
            {/* 장소 */}
            <div className="space-y-2">
              <Label htmlFor="event-location">장소</Label>
              <Input
                id="event-location"
                value={newEvent.location}
                onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                className="w-full"
                placeholder="장소를 입력하세요"
              />
            </div>
            
            {/* 기간 일정 */}
            <div className="border-t pt-4 space-y-4">
              <h4 className="text-sm font-medium text-gray-700">일정 기간</h4>
              
              {/* 시작일 */}
              <div className="space-y-2">
                <Label htmlFor="event-start-date">시작일 *</Label>
                <Input
                  id="event-start-date"
                  type="date"
                  value={newEvent.startDate}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full"
                />
              </div>
              
              {/* 종료일 */}
              <div className="space-y-2">
                <Label htmlFor="event-end-date">종료일</Label>
                <Input
                  id="event-end-date"
                  type="date"
                  value={newEvent.endDate}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full"
                />
              </div>
              
              <p className="text-xs text-gray-500">
                * 시작일은 필수입니다. 종료일을 설정하지 않으면 단일 날짜 일정으로 등록됩니다.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowAddEventModal(false)}
            >
              취소
            </Button>
            <Button onClick={handleSaveEvent}>
              저장
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 일정 삭제 모달 */}
      <Dialog open={showDeleteEventModal} onOpenChange={setShowDeleteEventModal}>
        <DialogContent className="sm:max-w-md max-w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>일정 삭제</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600 mb-4">삭제할 일정을 선택하세요:</p>
            
            {(() => {
              const deleteActiveEvents = (calendarData?.events || []).filter(ev => !isEventPast(ev));
              return deleteActiveEvents.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {deleteActiveEvents.map((event) => (
                  <div 
                    key={event.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getEventColor(event.id)}`} />
                      <div>
                        <h4 className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{event.title}</h4>
                        <p className="text-xs text-gray-500">
                          {new Date(event.date + 'T00:00:00').toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteEvent(event.id)}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">삭제할 일정이 없습니다.</p>
            );
            })()}
          </div>
          
          <div className="flex justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowDeleteEventModal(false)}
            >
              닫기
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* CSV 파일 팝업 */}
      <Dialog open={showCsvModal} onOpenChange={setShowCsvModal}>
        <DialogContent className="sm:max-w-xs max-w-[calc(100vw-2rem)]">
          <DialogHeader>
            <DialogTitle>CSV 파일</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <Button
              variant="outline"
              onClick={() => { setShowCsvModal(false); handleExportCsv(); }}
              className="w-full justify-start gap-2 h-12"
            >
              <Download className="w-4 h-4" />
              <div className="text-left">
                <div className="text-sm font-medium">내보내기</div>
                <div className="text-xs text-gray-500">현재 일정을 CSV로 저장</div>
              </div>
            </Button>
            <Button
              variant="outline"
              onClick={() => { setShowCsvModal(false); handleUploadClick(); }}
              className="w-full justify-start gap-2 h-12"
            >
              <Upload className="w-4 h-4" />
              <div className="text-left">
                <div className="text-sm font-medium">업로드</div>
                <div className="text-xs text-gray-500">CSV/Excel 파일에서 일정 가져오기</div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNavigation />

      <ExitConfirmDialog
        open={showExitDialog}
        onOpenChange={setShowExitDialog}
        onConfirm={exitApp}
      />
    </div>
  );
}
