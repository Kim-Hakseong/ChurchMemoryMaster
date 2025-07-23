import { Verse, Event } from '@shared/schema';

// Excel 날짜를 JavaScript Date로 변환하는 함수
function excelDateToJSDate(excelDate: number): string {
  const date = new Date((excelDate - 25569) * 86400 * 1000);
  return date.toISOString().split('T')[0];
}

// 초기 데이터 - 실제 Excel 파일에서 추출한 교회학교 암송 말씀
export const initialVerses: Verse[] = [
  // 유치부 데이터 (처음 10과)
  {
    id: 1,
    verse: "친구는 사랑이 끊이지 아니하고",
    reference: "잠언 17장 17절",
    date: excelDateToJSDate(45291),
    ageGroup: "kindergarten" as const,
    additionalInfo: "1과 친구야 안녕"
  },
  {
    id: 2,
    verse: "나는 주의 말씀을 지키리라",
    reference: "시편 119편 57절",
    date: excelDateToJSDate(45298),
    ageGroup: "kindergarten" as const,
    additionalInfo: "2과 나는 교회학교가 좋아요"
  },
  {
    id: 3,
    verse: "아무 사람도 보지 못하였고 또 볼 수 없는 자시니",
    reference: "디모데전서 6장 16절",
    date: excelDateToJSDate(45305),
    ageGroup: "kindergarten" as const,
    additionalInfo: "3과 보이지 않는 하나님"
  },
  {
    id: 4,
    verse: "우리가 사랑함은 그가 먼저 우리를 사랑하셨음이라",
    reference: "요한일서 4장 19절",
    date: excelDateToJSDate(45312),
    ageGroup: "kindergarten" as const,
    additionalInfo: "4과 나를 사랑하시는 하나님"
  },
  {
    id: 5,
    verse: "평생에 자기 옆에 두고 읽어서",
    reference: "신명기 17장 19절",
    date: excelDateToJSDate(45319),
    ageGroup: "kindergarten" as const,
    additionalInfo: "5과 성경은 하나님이 보내신 편지"
  },

  // 초등부 데이터 (10-20과 선별)
  {
    id: 6,
    verse: "빛이 있으라 하시매 빛이 있었고",
    reference: "창세기 1장 3절",
    date: excelDateToJSDate(45326),
    ageGroup: "elementary" as const,
    additionalInfo: "6과 빛을 만드신 하나님"
  },
  {
    id: 7,
    verse: "여호와의 말씀으로 하늘이 지음이 되었으며",
    reference: "시편 33편 6절",
    date: excelDateToJSDate(45333),
    ageGroup: "elementary" as const,
    additionalInfo: "7과 하늘을 만드신 하나님"
  },
  {
    id: 8,
    verse: "하나님이 모든 것을 지으시되 때를 따라 아름답게 하셨고",
    reference: "전도서 3장 11절",
    date: excelDateToJSDate(45340),
    ageGroup: "elementary" as const,
    additionalInfo: "8과 땅에는 나무와 꽃들이 있어요"
  },
  {
    id: 9,
    verse: "하늘의 궁창에 광명이 있어 주야를 나뉘게 하라",
    reference: "창세기 1장 14절",
    date: excelDateToJSDate(45347),
    ageGroup: "elementary" as const,
    additionalInfo: "9과 해와 달과 별을 만드신 하나님"
  },
  {
    id: 10,
    verse: "땅 위 하늘의 궁창에는 새가 날으라",
    reference: "창세기 1장 20절",
    date: excelDateToJSDate(45354),
    ageGroup: "elementary" as const,
    additionalInfo: "10과 새를 만드신 하나님"
  },

  // 중고등부 데이터 (40-50과 선별)
  {
    id: 11,
    verse: "저가 뉘기에 바람과 바다라도 순종하는고",
    reference: "마가복음 4장 41절",
    date: excelDateToJSDate(45949),
    ageGroup: "youth" as const,
    additionalInfo: "43과 거친 바다를 잔잔하게 하셨어요"
  },
  {
    id: 12,
    verse: "큰 소리로 나사로야 나오라 부르시니",
    reference: "요한복음 11장 43절",
    date: excelDateToJSDate(45956),
    ageGroup: "youth" as const,
    additionalInfo: "44과 죽은 나사로를 살리셨어요"
  },
  {
    id: 13,
    verse: "내가 잃었다가 다시 얻었노라 하니 저희가 즐거워하더라",
    reference: "누가복음 15장 24절",
    date: excelDateToJSDate(45963),
    ageGroup: "youth" as const,
    additionalInfo: "45과 다시 찾은 아들"
  },
  {
    id: 14,
    verse: "급히 내려와 즐거워하며 영접하거늘",
    reference: "누가복음 19장 6절",
    date: excelDateToJSDate(45970),
    ageGroup: "youth" as const,
    additionalInfo: "46과 삭개오는 예수님을 만났어요"
  },
  {
    id: 15,
    verse: "내가 너희를 사랑한것 같이 너희도 서로 사랑하라",
    reference: "요한복음 13장 34절",
    date: excelDateToJSDate(45977),
    ageGroup: "youth" as const,
    additionalInfo: "47과 예수님께서 제자의 발을 씻기셨어요"
  }
];

export const initialEvents: Event[] = [
  {
    id: 1,
    title: "여름성경학교",
    description: "즐거운 여름성경학교에 참여하세요!",
    date: "2024-07-25",
    ageGroup: "all" as const
  },
  {
    id: 2,
    title: "어린이 찬양대 연습",
    description: "매주 수요일 찬양대 연습이 있습니다",
    date: "2024-07-31",
    ageGroup: "elementary" as const
  },
  {
    id: 3,
    title: "청소년 수련회",
    description: "중고등부 수련회 및 특별집회",
    date: "2024-08-10",
    ageGroup: "youth" as const
  }
];