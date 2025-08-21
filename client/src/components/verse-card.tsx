import { motion } from "framer-motion";
import { Calendar, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatDateRange } from "@/lib/date-utils";
import CaptureButton from "@/components/capture-button";
import type { Verse } from "@shared/schema";

interface VerseCardProps {
  verse: Verse | null;
  weekType: "last" | "current" | "next";
  onShare?: (verse?: Verse) => void;
  compact?: boolean;
}

const weekTypeConfig = {
  last: {
    title: "지난 주",
    icon: "chevron-left",
    bgClass: "verse-card",
    iconBg: "bg-gray-100",
    iconColor: "text-gray-400",
    titleColor: "text-gray-500",
    titleClass: "text-lg font-medium text-gray-500",
  },
  current: {
    title: "이번 주",
    icon: "star",
    bgClass: "verse-card-active",
    iconBg: "bg-primary",
    iconColor: "text-white",
    titleColor: "text-primary font-semibold",
    titleClass: "text-xl font-semibold text-primary",
  },
  next: {
    title: "다음 주",
    icon: "chevron-right",
    bgClass: "verse-card",
    iconBg: "bg-gray-100",
    iconColor: "text-gray-400",
    titleColor: "text-gray-500",
    titleClass: "text-lg font-medium text-gray-500",
  },
};

export default function VerseCard({ verse, weekType, onShare, compact = false }: VerseCardProps) {
  const { toast } = useToast();
  const config = weekTypeConfig[weekType];

  const handleCopyVerse = async () => {
    if (!verse) return;
    
    try {
      const textToCopy = `"${verse.content}" - ${verse.reference}`;
      await navigator.clipboard.writeText(textToCopy);
      toast({
        title: "복사 완료",
        description: "암송구절이 클립보드에 복사되었습니다.",
      });
    } catch (error) {
      toast({
        title: "복사 실패",
        description: "클립보드 복사에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const wrapperClass = compact
    ? `${config.bgClass} p-3`
    : config.bgClass;

  const titleClass = compact
    ? `${config.titleClass} text-base`
    : config.titleClass;

  const lessonClass = (weekType === 'current')
    ? (compact ? 'text-base text-gray-900 font-semibold' : 'text-lg text-gray-900 font-semibold')
    : (compact ? 'text-sm text-gray-700 font-semibold' : 'text-base text-gray-700 font-semibold');

  const contentClass = (weekType === 'current')
    ? (compact ? 'text-sm text-gray-800 font-medium' : 'text-base text-gray-800 font-medium')
    : (compact ? 'text-xs text-gray-600' : 'text-sm text-gray-600');

  const citeClass = (weekType === 'current')
    ? (compact ? 'text-xs text-primary font-semibold' : 'text-sm text-primary font-semibold')
    : (compact ? 'text-[11px] text-gray-500 font-medium' : 'text-xs text-gray-500 font-medium');

  return (
    <motion.div className={wrapperClass}>
      <div className={compact ? "flex justify-between items-start mb-2" : "flex justify-between items-start mb-3"}>
        <h3 className={titleClass}>
          {config.title}
        </h3>
      </div>
      
                {verse ? (
                    <>
                      {/* 공과명 표시 (있는 경우) */}
                      {verse.lessonName && (
                        <h3 className={`font-semibold ${compact ? 'mb-1' : 'mb-2'} ${lessonClass}`}>
                          {verse.lessonName}
                        </h3>
                      )}
                      
                      <blockquote className={`leading-relaxed ${compact ? 'mb-2' : 'mb-3'} ${contentClass}`}>
                        "{verse.content}"
                      </blockquote>

                      {/* 장절과 복사 버튼을 같은 라인에 배치 */}
                      <div className="flex items-center justify-between">
                      <cite className={citeClass}>
                        {verse.reference}
                      </cite>
                          <Button
                variant="ghost"
                size={compact ? "icon" : "sm"}
                onClick={handleCopyVerse}
                className={compact ? "h-6 w-6 p-0 hover:bg-primary/10" : "h-6 w-6 p-0 hover:bg-primary/10"}
              >
              <Copy className="w-3 h-3 text-primary" />
              </Button>
            </div>
        </>
      ) : (
        <div className={compact ? "text-center py-6" : "text-center py-8"}>
          <Calendar className={compact ? "w-6 h-6 mx-auto mb-1 text-gray-400" : "w-8 h-8 mx-auto mb-2 text-gray-400"} />
          <p className={compact ? "text-xs text-gray-500" : "text-sm text-gray-500"}>
            {weekType === "current" ? "이번 주 암송구절이 없습니다" :
             weekType === "last" ? "지난 주 암송구절이 없습니다" :
             "다음 주 암송구절이 없습니다"}
          </p>
        </div>
      )}
    </motion.div>
  );
}