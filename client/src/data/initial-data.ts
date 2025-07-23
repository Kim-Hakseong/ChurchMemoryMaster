import { Verse, Event } from '@shared/schema';

// 초기 데이터 - Excel 파일에서 추출한 암송 말씀과 행사 데이터
export const initialVerses: Verse[] = [
  // 유치부 데이터
  {
    id: 1,
    verse: "하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 그를 믿는 자마다 멸망하지 않고 영생을 얻게 하려 하심이라",
    reference: "요한복음 3:16",
    date: "2024-07-21",
    ageGroup: "kindergarten" as const,
    additionalInfo: "하나님의 사랑"
  },
  {
    id: 2,
    verse: "예수께서 이르시되 내가 곧 길이요 진리요 생명이니 나로 말미암지 않고는 아버지께로 올 자가 없느니라",
    reference: "요한복음 14:6",
    date: "2024-07-28",
    ageGroup: "kindergarten" as const,
    additionalInfo: "예수님의 길"
  },
  {
    id: 3,
    verse: "쉬지 말고 기도하라",
    reference: "데살로니가전서 5:17",
    date: "2024-08-04",
    ageGroup: "kindergarten" as const,
    additionalInfo: "기도의 중요성"
  },

  // 초등부 데이터
  {
    id: 4,
    verse: "믿음이 없이는 하나님을 기쁘시게 하지 못하나니 하나님께 나아가는 자는 반드시 그가 계신 것과 또한 그가 자기를 찾는 자들에게 상을 주시는 이심을 믿어야 할지니라",
    reference: "히브리서 11:6",
    date: "2024-07-21",
    ageGroup: "elementary" as const,
    additionalInfo: "믿음의 필요성"
  },
  {
    id: 5,
    verse: "새 계명을 너희에게 주노니 서로 사랑하라 내가 너희를 사랑한 것 같이 너희도 서로 사랑하라",
    reference: "요한복음 13:34",
    date: "2024-07-28",
    ageGroup: "elementary" as const,
    additionalInfo: "서로 사랑하기"
  },
  {
    id: 6,
    verse: "모든 성경은 하나님의 감동으로 된 것으로 교훈과 책망과 바르게 함과 의로 교육하기에 유익하니",
    reference: "디모데후서 3:16",
    date: "2024-08-04",
    ageGroup: "elementary" as const,
    additionalInfo: "성경의 중요성"
  },

  // 중고등부 데이터
  {
    id: 7,
    verse: "그런즉 누구든지 그리스도 안에 있으면 새로운 피조물이라 이전 것은 지나갔으니 보라 새 것이 되었도다",
    reference: "고린도후서 5:17",
    date: "2024-07-21",
    ageGroup: "youth" as const,
    additionalInfo: "새로운 피조물"
  },
  {
    id: 8,
    verse: "오직 성령의 열매는 사랑과 희락과 화평과 오래 참음과 자비와 양선과 충성과 온유와 절제니 이같은 것을 금지할 법이 없느니라",
    reference: "갈라디아서 5:22-23",
    date: "2024-07-28",
    ageGroup: "youth" as const,
    additionalInfo: "성령의 9가지 열매"
  },
  {
    id: 9,
    verse: "하나님이 우리를 부르심은 부정한 데 있지 아니하고 거룩함에 있느니라",
    reference: "데살로니가전서 4:7",
    date: "2024-08-04",
    ageGroup: "youth" as const,
    additionalInfo: "거룩한 삶"
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