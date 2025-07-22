import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCalendarData } from "@/hooks/use-calendar";
import BottomNavigation from "@/components/bottom-navigation";
import { Link } from "wouter";
import { formatDate } from "@/lib/date-utils";

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
const MONTHS = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월'
];

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  const { data: calendarData, isLoading } = useCalendarData(currentYear, currentMonth);

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

  const hasEventOnDate = (date: Date) => {
    if (!calendarData) return false;
    const dateStr = date.toISOString().split('T')[0];
    return calendarData.events.some(event => event.date === dateStr) ||
           calendarData.verses.some(verse => verse.date === dateStr);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

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
            <div>
              <h1 className="text-lg font-semibold text-gray-800">교회학교 캘린더</h1>
              <p className="text-xs text-gray-500">{formatDate(new Date())}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 py-6 pb-24 space-y-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('prev')}
            className="w-10 h-10 p-0 hover:bg-gray-100"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </Button>
          <h2 className="text-xl font-semibold text-gray-800">
            {currentYear}년 {MONTHS[currentMonth]}
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

        {/* Calendar */}
        <div className="verse-card">
          {/* Calendar Header */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {DAYS.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-3">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth().map((dayInfo, index) => {
              const { date, isCurrentMonth } = dayInfo;
              const hasEvent = hasEventOnDate(date);
              const today = isToday(date);
              
              return (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    aspect-square flex flex-col items-center justify-center text-sm rounded-xl transition-all duration-200 relative
                    ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                    ${today ? 'bg-primary text-white font-semibold shadow-lg' : ''}
                    ${hasEvent && !today ? 'text-primary font-medium' : ''}
                    ${!hasEvent && !today && isCurrentMonth ? 'hover:bg-gray-50' : ''}
                  `}
                  style={hasEvent && !today ? {backgroundColor: 'hsl(251, 82%, 67%, 0.1)'} : undefined}
                >
                  {date.getDate()}
                  {hasEvent && !today && (
                    <div className="w-1.5 h-1.5 bg-primary rounded-full absolute bottom-1" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Events List */}
        {calendarData?.events && calendarData.events.length > 0 ? (
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">이번 달 행사</h3>
            {calendarData.events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="verse-card"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-3 h-3 bg-primary rounded-full flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h4 className="text-base font-medium text-gray-800 mb-1">
                      {event.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {new Date(event.date + 'T00:00:00').toLocaleDateString('ko-KR', {
                        month: 'long',
                        day: 'numeric',
                        weekday: 'long'
                      })}
                    </p>
                    {event.description && (
                      <p className="text-sm text-gray-500">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </section>
        ) : (
          <div className="verse-card text-center py-12">
            <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">행사가 없습니다</h3>
            <p className="text-sm text-gray-500">이번 달에 예정된 행사가 없습니다.</p>
          </div>
        )}

        {/* Monthly Verses Summary */}
        {calendarData?.verses && calendarData.verses.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">이번 달 암송 말씀</h3>
            <div className="verse-card">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary mb-1">
                    {calendarData.verses.filter(v => v.ageGroup === 'kindergarten').length}
                  </div>
                  <p className="text-xs text-gray-500">유치부</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-secondary mb-1">
                    {calendarData.verses.filter(v => v.ageGroup === 'elementary').length}
                  </div>
                  <p className="text-xs text-gray-500">초등부</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent mb-1">
                    {calendarData.verses.filter(v => v.ageGroup === 'youth').length}
                  </div>
                  <p className="text-xs text-gray-500">중‧고등부</p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <BottomNavigation />
    </>
  );
}
