import { motion } from "framer-motion";
import { Calendar, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateRange } from "@/lib/date-utils";
import type { Verse } from "@shared/schema";

interface VerseCardProps {
  verse: Verse | null;
  weekType: "last" | "current" | "next";
  dateRange: string;
  onShare?: () => void;
}

const weekTypeConfig = {
  last: {
    title: "지난주",
    icon: "chevron-left",
    bgClass: "verse-card",
    iconBg: "bg-gray-100",
    iconColor: "text-gray-400",
    titleColor: "text-gray-500",
  },
  current: {
    title: "이번주",
    icon: "star",
    bgClass: "verse-card-active",
    iconBg: "bg-primary",
    iconColor: "text-white",
    titleColor: "text-primary font-semibold",
  },
  next: {
    title: "다음주",
    icon: "chevron-right",
    bgClass: "verse-card",
    iconBg: "bg-orange-100",
    iconColor: "text-secondary",
    titleColor: "text-gray-600 font-medium",
  },
};

export default function VerseCard({ verse, weekType, dateRange, onShare }: VerseCardProps) {
  const config = weekTypeConfig[weekType];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={config.bgClass}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 ${config.iconBg} rounded-lg flex items-center justify-center`}>
            {weekType === "last" && <i className={`fas fa-chevron-left ${config.iconColor} text-sm`} />}
            {weekType === "current" && <i className={`fas fa-star ${config.iconColor} text-sm`} />}
            {weekType === "next" && <i className={`fas fa-chevron-right ${config.iconColor} text-sm`} />}
          </div>
          <span className={`text-sm ${config.titleColor}`}>{config.title}</span>
        </div>
        <span className={`text-xs ${weekType === 'current' ? 'font-medium' : 'text-gray-400'}`} style={{color: weekType === 'current' ? 'hsl(251, 82%, 67%, 0.7)' : undefined}}>
          {dateRange}
        </span>
      </div>

      {verse ? (
        <>
          <blockquote className={`leading-relaxed mb-3 ${
            weekType === 'current' ? 'text-base text-gray-800 font-medium' : 'text-sm text-gray-600'
          }`}>
            "{verse.verse}"
          </blockquote>
          <cite className={`${
            weekType === 'current' ? 'text-sm text-primary font-semibold' : 'text-xs text-gray-500 font-medium'
          }`}>
            {verse.reference}
          </cite>
          
          {weekType === 'current' && onShare && (
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={onShare}
                className="w-10 h-8 p-0 bg-white/50 hover:bg-white/70 border-none"
              >
                <Share2 className="w-4 h-4 text-primary" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-4">
          <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">암송 말씀이 없습니다</p>
        </div>
      )}
    </motion.div>
  );
}
