// 뱃지 정의 & 포인트 설정

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide icon name
  category: 'streak' | 'count' | 'difficulty' | 'special';
  condition: string; // 해금 조건 설명
  color: string; // tailwind color class
}

export const BADGES: BadgeDefinition[] = [
  // streak 카테고리
  {
    id: 'first_step',
    name: '첫 걸음',
    description: '처음으로 암송을 완료했어요!',
    icon: 'Sparkles',
    category: 'streak',
    condition: '암송 1회 완료',
    color: 'text-yellow-500',
  },
  {
    id: 'streak_3',
    name: '3일 연속',
    description: '3일 연속 암송 성공!',
    icon: 'Zap',
    category: 'streak',
    condition: '3일 연속 암송',
    color: 'text-orange-500',
  },
  {
    id: 'streak_7',
    name: '일주일 전사',
    description: '7일 연속 암송 달성!',
    icon: 'Flame',
    category: 'streak',
    condition: '7일 연속 암송',
    color: 'text-red-500',
  },
  {
    id: 'streak_30',
    name: '한 달 챔피언',
    description: '30일 연속 암송! 대단해요!',
    icon: 'Crown',
    category: 'streak',
    condition: '30일 연속 암송',
    color: 'text-amber-500',
  },

  // count 카테고리
  {
    id: 'count_10',
    name: '열 번째 암송',
    description: '암송 10회 달성!',
    icon: 'Star',
    category: 'count',
    condition: '총 10회 암송 완료',
    color: 'text-blue-500',
  },
  {
    id: 'count_50',
    name: '반백 달성',
    description: '암송 50회 달성!',
    icon: 'Medal',
    category: 'count',
    condition: '총 50회 암송 완료',
    color: 'text-teal-500',
  },
  {
    id: 'count_100',
    name: '백전백승',
    description: '암송 100회 달성! 진정한 암송왕!',
    icon: 'Trophy',
    category: 'count',
    condition: '총 100회 암송 완료',
    color: 'text-teal-600',
  },

  // difficulty 카테고리
  {
    id: 'expert_first',
    name: '완전 암송 도전',
    description: '완전 암송 모드를 처음으로 통과!',
    icon: 'Shield',
    category: 'difficulty',
    condition: '완전 암송 모드 1회 완료',
    color: 'text-teal-500',
  },
  {
    id: 'all_difficulty',
    name: '전 난이도 클리어',
    description: '쉬움, 보통, 완전 암송 모두 도전!',
    icon: 'Brain',
    category: 'difficulty',
    condition: '3가지 난이도 각 1회 이상 완료',
    color: 'text-pink-500',
  },
  {
    id: 'expert_10',
    name: '암송 달인',
    description: '완전 암송 모드 10회 달성!',
    icon: 'Award',
    category: 'difficulty',
    condition: '완전 암송 모드 10회 완료',
    color: 'text-fuchsia-500',
  },
  {
    id: 'expert_30',
    name: '말씀의 사람',
    description: '완전 암송 모드 30회!',
    icon: 'BookOpen',
    category: 'difficulty',
    condition: '완전 암송 모드 30회 완료',
    color: 'text-rose-500',
  },

  // special 카테고리
  {
    id: 'points_1000',
    name: '천 포인트 돌파',
    description: '1000 포인트를 달성했어요!',
    icon: 'Gem',
    category: 'special',
    condition: '총 1000 포인트 달성',
    color: 'text-cyan-500',
  },
  {
    id: 'points_5000',
    name: '5천 포인트',
    description: '5000 포인트 돌파!',
    icon: 'Compass',
    category: 'special',
    condition: '총 5000 포인트 달성',
    color: 'text-cyan-600',
  },
  {
    id: 'points_10000',
    name: '만 포인트 달성',
    description: '10000 포인트! 최고의 암송왕!',
    icon: 'Sun',
    category: 'special',
    condition: '총 10000 포인트 달성',
    color: 'text-yellow-500',
  },
  {
    id: 'weekly_perfect',
    name: '완벽한 한 주',
    description: '한 주(월~일) 매일 암송 완료!',
    icon: 'CalendarCheck',
    category: 'special',
    condition: '월~일 7일 모두 암송 완료',
    color: 'text-emerald-600',
  },
  {
    id: 'all_groups',
    name: '모든 부서 정복',
    description: '유치부, 초등부, 중고등부 모두 암송!',
    icon: 'Users',
    category: 'special',
    condition: '3개 부서 모두 암송 완료',
    color: 'text-emerald-500',
  },

  // streak 추가
  {
    id: 'streak_14',
    name: '2주 연속',
    description: '14일 연속 암송 달성!',
    icon: 'Target',
    category: 'streak',
    condition: '14일 연속 암송',
    color: 'text-orange-400',
  },
  {
    id: 'streak_60',
    name: '두 달 챔피언',
    description: '60일 연속 암송! 놀라워요!',
    icon: 'Mountain',
    category: 'streak',
    condition: '60일 연속 암송',
    color: 'text-red-600',
  },

  // count 추가
  {
    id: 'count_200',
    name: '이백 달성',
    description: '암송 200회 달성! 꾸준함의 힘!',
    icon: 'Rocket',
    category: 'count',
    condition: '총 200회 암송 완료',
    color: 'text-blue-600',
  },
  {
    id: 'count_500',
    name: '오백 마스터',
    description: '암송 500회! 진정한 말씀의 사람!',
    icon: 'Heart',
    category: 'count',
    condition: '총 500회 암송 완료',
    color: 'text-teal-600',
  },
  {
    id: 'count_1000',
    name: '일천 마스터',
    description: '암송 1000회 달성! 위대한 여정!',
    icon: 'Crown',
    category: 'count',
    condition: '총 1000회 암송 완료',
    color: 'text-amber-600',
  },

  // difficulty 추가
  {
    id: 'expert_perfect',
    name: '무결점 챔피언',
    description: '완전 암송 1회 무실수 통과!',
    icon: 'Diamond',
    category: 'difficulty',
    condition: '완전 암송 모드 1회 무실수 완료',
    color: 'text-violet-500',
  },
  {
    id: 'triple_in_day',
    name: '삼총사',
    description: '하루에 3난이도 모두 완료!',
    icon: 'Layers',
    category: 'difficulty',
    condition: '하루에 쉬움/보통/완전 각 1회 이상 완료',
    color: 'text-indigo-500',
  },

  // special 추가
  {
    id: 'monthly_master',
    name: '월간 마스터',
    description: '한 달 매일 암송 완료!',
    icon: 'CalendarDays',
    category: 'special',
    condition: '한 달 동안 매일 1회 이상 암송',
    color: 'text-emerald-700',
  },
];

export const POINTS_CONFIG = {
  easy: 10,
  hard: 25,
  expert: 50,
  streakBonus: 5,  // 연속일 × 5
  dailyFirst: 10,  // 하루 첫 암송 보너스
} as const;

export function getBadgeById(id: string): BadgeDefinition | undefined {
  return BADGES.find((b) => b.id === id);
}
