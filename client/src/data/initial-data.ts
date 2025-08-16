import type { Verse, Event, MonthlyVerse } from "@shared/schema";

// 현재 주 기준으로 날짜 생성하는 함수
function getCurrentWeekDate(weekOffset: number): string {
  const now = new Date();
  const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  
  // 이번 주 일요일 계산
  const currentSunday = new Date(localNow);
  currentSunday.setDate(localNow.getDate() - localNow.getDay());
  currentSunday.setHours(0, 0, 0, 0);
  
  // 목표 주의 일요일 계산
  const targetSunday = new Date(currentSunday);
  targetSunday.setDate(currentSunday.getDate() + (weekOffset * 7));
  
  const year = targetSunday.getFullYear();
  const month = String(targetSunday.getMonth() + 1).padStart(2, '0');
  const day = String(targetSunday.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

export const initialVerses: Verse[] = [
  // 유치부 데이터 (현재 주 기준)
  {
    id: 1,
    content: "친구는 사랑이 끊이지 아니하고",
    reference: "잠언 17장 17절",
    date: getCurrentWeekDate(-1), // 지난주
    ageGroup: "kindergarten" as const,
  },
  {
    id: 2,
    content: "나는 주의 말씀을 지키리라",
    reference: "시편 119편 57절",
    date: getCurrentWeekDate(0), // 이번주
    ageGroup: "kindergarten" as const,
  },
  {
    id: 3,
    content: "아무 사람도 보지 못하였고 또 볼 수 없는 자시니",
    reference: "디모데전서 6장 16절",
    date: getCurrentWeekDate(1), // 다음주
    ageGroup: "kindergarten" as const,
  },
  {
    id: 4,
    content: "우리가 사랑함은 그가 먼저 우리를 사랑하셨음이라",
    reference: "요한일서 4장 19절",
    date: getCurrentWeekDate(-1), // 지난주
    ageGroup: "elementary" as const,
  },
  {
    id: 5,
    content: "평생에 자기 옆에 두고 읽어서",
    reference: "신명기 17장 19절",
    date: getCurrentWeekDate(0), // 이번주
    ageGroup: "elementary" as const,
  },
  {
    id: 6,
    content: "빛이 있으라 하시매 빛이 있었고",
    reference: "창세기 1장 3절",
    date: getCurrentWeekDate(1), // 다음주
    ageGroup: "elementary" as const,
  },
  {
    id: 7,
    content: "여호와의 말씀으로 하늘이 지음이 되었으며",
    reference: "시편 33편 6절",
    date: getCurrentWeekDate(-1), // 지난주
    ageGroup: "youth" as const,
  },
  {
    id: 8,
    content: "하나님이 모든 것을 지으시되 때를 따라 아름답게 하셨고",
    reference: "전도서 3장 11절",
    date: getCurrentWeekDate(0), // 이번주
    ageGroup: "youth" as const,
  },
  {
    id: 9,
    content: "하늘의 궁창에 광명이 있어 주야를 나뉘게 하라",
    reference: "창세기 1장 14절",
    date: getCurrentWeekDate(1), // 다음주
    ageGroup: "youth" as const,
  }
];

export const initialEvents: Event[] = [
  {
    id: 1,
    title: "여름성경학교",
    description: "즐거운 여름성경학교에 참여하세요!",
    date: getCurrentWeekDate(0), // 이번주
    ageGroup: null
  },
  {
    id: 2,
    title: "어린이 찬양대 연습",
    description: "매주 수요일 찬양대 연습이 있습니다",
    date: getCurrentWeekDate(1), // 다음주
    ageGroup: "elementary" as const
  },
  {
    id: 3,
    title: "청소년 수련회",
    description: "중고등부 수련회 및 특별집회",
    date: getCurrentWeekDate(-1), // 지난주
    ageGroup: "youth" as const
  }
];

// 초등월암송 초기 데이터
export const initialMonthlyVerses: MonthlyVerse[] = [
  {
    id: 1,
    year: 2025,
    month: 7,
    reference: "데살로니가전서 5장 5-8절",
    content: "너희는 다 빛의 아들이요 낮의 아들이라 우리가 밤이나 어두움에 속하지 아니하나니 그러므로 우리는 다른 이들과 같이 자지 말고 오직 깨어 근신할지라 자는 자들은 밤에 자고 취하는 자들은 밤에 취하되 우리는 낮에 속하였으니 근신하여 믿음과 사랑의 흉배를 붙이고 구원의 소망의 투구를 쓰자"
  },
  {
    id: 2,
    year: 2025,
    month: 8,
    reference: "시편 119편 105절",
    content: "주의 말씀은 내 발에 등이요 내 길에 빛이니이다"
  },
  {
    id: 3,
    year: 2025,
    month: 9,
    reference: "요한복음 3장 16절",
    content: "하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 그를 믿는 자마다 멸망하지 않고 영생을 얻게 하려 하심이라"
  }
];

console.log('=== Initial Data 날짜 정보 ===');
console.log('지난주:', getCurrentWeekDate(-1));
console.log('이번주:', getCurrentWeekDate(0));
console.log('다음주:', getCurrentWeekDate(1));