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

export default function VerseCard({ verse, weekType, onShare }: VerseCardProps) {
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

  return (
    <motion.div className={config.bgClass}>
      <div className="flex justify-between items-start mb-3">
        <h3 className={config.titleClass}>
          {config.title}
        </h3>
      </div>
      
                {verse ? (
                    <>
                      {/* 공과명 표시 (있는 경우) */}
                      {verse.lessonName && (
                        <h3 className={`font-semibold mb-2 ${
                          weekType === 'current' ? 'text-lg text-gray-900' : 'text-base text-gray-700'
                        }`}>
                          {verse.lessonName}
                        </h3>
                      )}
                      
                      <blockquote className={`leading-relaxed mb-3 ${
                        weekType === 'current' ? 'text-base text-gray-800 font-medium' : 'text-sm text-gray-600'
                      }`}>
                        "{verse.content}"
                      </blockquote>

                      {/* 장절과 복사 버튼을 같은 라인에 배치 */}
                      <div className="flex items-center justify-between">
                      <cite className={`${
                        weekType === 'current' ? 'text-sm text-primary font-semibold' : 'text-xs text-gray-500 font-medium'
                      }`}>
                        {verse.reference}
                      </cite>
                          <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyVerse}
                className="h-6 w-6 p-0 hover:bg-primary/10"
              >
              <Copy className="w-3 h-3 text-primary" />
              </Button>
            </div>
        </>
      ) : (
        <div className="text-center py-8">
          <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-500">
            {weekType === "current" ? "이번 주 암송구절이 없습니다" :
             weekType === "last" ? "지난 주 암송구절이 없습니다" :
             "다음 주 암송구절이 없습니다"}
          </p>
        </div>
      )}
    </motion.div>
  );
}