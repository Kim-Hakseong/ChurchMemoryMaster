import type { DayStatus } from '@/lib/progress-storage';

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

interface WeeklyDotGridProps {
  grid: DayStatus[];
}

export default function WeeklyDotGrid({ grid }: WeeklyDotGridProps) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex items-center justify-between gap-1">
      {grid.map((day, i) => {
        const isToday = day.date === today;
        const dotColor = day.completed
          ? 'bg-emerald-500'
          : isToday
          ? 'bg-gray-300'
          : 'bg-gray-200';
        const ringClass = isToday ? 'ring-2 ring-emerald-300 ring-offset-1' : '';

        return (
          <div key={day.date} className="flex flex-col items-center gap-0.5">
            <span className="text-[9px] text-gray-400 font-medium">
              {DAY_LABELS[i]}
            </span>
            <div
              className={`w-5 h-5 rounded-full ${dotColor} ${ringClass} flex items-center justify-center`}
            >
              {day.completed && day.count > 0 && (
                <span className="text-[8px] font-bold text-white">
                  {day.count > 9 ? '9+' : day.count}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
