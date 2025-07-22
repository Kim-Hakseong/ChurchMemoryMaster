import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCalendarData } from "@/hooks/use-calendar";

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
const MONTHS = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월'
];

export default function CalendarModal({ isOpen, onClose }: CalendarModalProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  const { data: calendarData } = useCalendarData(currentYear, currentMonth);

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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="bg-white rounded-t-3xl sm:rounded-3xl p-6 max-h-[90vh] overflow-y-auto w-full max-w-md"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">교회학교 캘린더</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="w-10 h-10 p-0 hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-600" />
              </Button>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth('prev')}
                className="w-10 h-10 p-0 hover:bg-gray-100"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </Button>
              <h3 className="text-lg font-semibold text-gray-800">
                {currentYear}년 {MONTHS[currentMonth]}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth('next')}
                className="w-10 h-10 p-0 hover:bg-gray-100"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </Button>
            </div>

            {/* Calendar Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-6">
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
                      aspect-square flex flex-col items-center justify-center text-sm rounded-lg transition-colors relative
                      ${!isCurrentMonth ? 'text-gray-400' : ''}
                      ${today ? 'bg-primary text-white font-semibold' : 'hover:bg-gray-50'}
                      ${hasEvent && !today ? 'text-primary' : ''}
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

            {/* Events */}
            {calendarData?.events && calendarData.events.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700">이번 달 행사</h4>
                {calendarData.events.slice(0, 3).map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-xl p-3"
                    style={{backgroundColor: 'hsl(251, 82%, 67%, 0.05)'}}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {event.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(event.date + 'T00:00:00').toLocaleDateString('ko-KR', {
                            month: 'long',
                            day: 'numeric',
                            weekday: 'short'
                          })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {(!calendarData?.events || calendarData.events.length === 0) && (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">이번 달 예정된 행사가 없습니다</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
