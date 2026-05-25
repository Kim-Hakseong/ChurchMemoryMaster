import { motion, AnimatePresence } from 'framer-motion';
import { Star, Award } from 'lucide-react';
import type { PointsBreakdown } from '@/lib/points-calculator';
import type { BadgeDefinition } from '@/lib/badge-definitions';

interface PointsEarnedToastProps {
  points: PointsBreakdown | null;
  newBadges: BadgeDefinition[];
  show: boolean;
}

export default function PointsEarnedToast({ points, newBadges, show }: PointsEarnedToastProps) {
  if (!points) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="space-y-2"
        >
          {/* 포인트 표시 */}
          <div className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
            <Star className="w-5 h-5 text-amber-500" />
            <span className="text-lg font-bold text-amber-700">+{points.total}</span>
            <span className="text-sm text-amber-600">포인트</span>
          </div>

          {/* 포인트 상세 */}
          <div className="flex items-center justify-center gap-3 text-[11px] text-gray-500">
            <span>기본 {points.base}</span>
            {points.streakBonus > 0 && (
              <span className="text-orange-500">연속 +{points.streakBonus}</span>
            )}
            {points.dailyFirst > 0 && (
              <span className="text-emerald-500">첫 암송 +{points.dailyFirst}</span>
            )}
          </div>

          {/* 새 뱃지 알림 */}
          {newBadges.map((badge) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 p-3 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-200"
            >
              <Award className="w-5 h-5 text-teal-500" />
              <div>
                <p className="text-sm font-semibold text-teal-700">
                  뱃지 획득: {badge.name}
                </p>
                <p className="text-xs text-teal-500">{badge.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
