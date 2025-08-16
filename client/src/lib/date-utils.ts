export interface WeekRange {
  start: Date;
  end: Date;
}

export function getCurrentWeekRange(date = new Date()): WeekRange {
  const current = new Date(date);
  const currentDay = current.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Calculate the start of the week (Monday)
  // 월요일 기준: 일요일(0)이면 6일 전, 월-토(1-6)이면 (currentDay-1)일 전
  const daysToSubtract = currentDay === 0 ? 6 : currentDay - 1;
  const start = new Date(current);
  start.setDate(current.getDate() - daysToSubtract);
  start.setHours(0, 0, 0, 0);
  
  // Calculate the end of the week (Sunday)
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

export function getLastWeekRange(date = new Date()): WeekRange {
  const current = getCurrentWeekRange(date);
  const start = new Date(current.start);
  start.setDate(current.start.getDate() - 7);
  
  const end = new Date(current.end);
  end.setDate(current.end.getDate() - 7);
  
  return { start, end };
}

export function getNextWeekRange(date = new Date()): WeekRange {
  const current = getCurrentWeekRange(date);
  const start = new Date(current.start);
  start.setDate(current.start.getDate() + 7);
  
  const end = new Date(current.end);
  end.setDate(current.end.getDate() + 7);
  
  return { start, end };
}

export function formatDateRange(start: Date, end: Date): string {
  const startMonth = start.getMonth() + 1;
  const startDate = start.getDate();
  const endMonth = end.getMonth() + 1;
  const endDate = end.getDate();
  
  if (startMonth === endMonth) {
    return `${startMonth}월 ${startDate}일 - ${endDate}일`;
  } else {
    return `${startMonth}월 ${startDate}일 - ${endMonth}월 ${endDate}일`;
  }
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dayName = dayNames[date.getDay()];
  
  return `${year}년 ${month}월 ${day}일 (${dayName})`;
}

export function isDateInRange(date: Date, range: WeekRange): boolean {
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  
  return checkDate >= range.start && checkDate <= range.end;
}
