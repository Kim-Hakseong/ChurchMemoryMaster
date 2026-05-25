/**
 * 위젯 데이터 관리
 * - 네이티브 위젯에 데이터 제공
 * - Preferences API를 통해 네이티브 코드가 접근 가능
 */

import { Preferences } from '@capacitor/preferences';
import { LocalStorage } from './storage';
import { getCurrentWeekRange, getLastWeekRange, getNextWeekRange, isDateInRange } from './date-utils';
import type { Verse, AgeGroup } from '@shared/schema';

export interface WidgetVerseData {
  lessonName: string;
  content: string;
  reference: string;
  date: string;
}

export interface WidgetData {
  ageGroup: AgeGroup;
  lastWeek: WidgetVerseData | null;
  thisWeek: WidgetVerseData | null;
  nextWeek: WidgetVerseData | null;
  lastUpdated: number;
}

const WIDGET_DATA_KEYS = {
  kindergarten: 'widget_data_kindergarten',
  elementary: 'widget_data_elementary',
  youth: 'widget_data_youth',
};

/**
 * Verse를 WidgetVerseData로 변환
 */
function verseToWidgetData(verse: Verse | null): WidgetVerseData | null {
  if (!verse) return null;
  
  return {
    lessonName: verse.lessonName || '',
    content: verse.content,
    reference: verse.reference,
    date: verse.date,
  };
}

/**
 * 부서별 위젯 데이터 가져오기
 */
function getWeeklyVerses(ageGroup: AgeGroup): {
  lastWeek: Verse | null;
  thisWeek: Verse | null;
  nextWeek: Verse | null;
} {
  const verses = LocalStorage.getVersesByAgeGroup(ageGroup);
  const currentDate = new Date();
  
  const lastWeekRange = getLastWeekRange(currentDate);
  const thisWeekRange = getCurrentWeekRange(currentDate);
  const nextWeekRange = getNextWeekRange(currentDate);
  
  const lastWeek = verses.find(v => {
    const verseDate = new Date(v.date + 'T00:00:00');
    return isDateInRange(verseDate, lastWeekRange);
  }) || null;
  
  const thisWeek = verses.find(v => {
    const verseDate = new Date(v.date + 'T00:00:00');
    return isDateInRange(verseDate, thisWeekRange);
  }) || null;
  
  const nextWeek = verses.find(v => {
    const verseDate = new Date(v.date + 'T00:00:00');
    return isDateInRange(verseDate, nextWeekRange);
  }) || null;
  
  return { lastWeek, thisWeek, nextWeek };
}

/**
 * 특정 부서의 위젯 데이터 업데이트
 */
export async function updateWidgetData(ageGroup: AgeGroup): Promise<void> {
  try {
    const { lastWeek, thisWeek, nextWeek } = getWeeklyVerses(ageGroup);
    
    const widgetData: WidgetData = {
      ageGroup,
      lastWeek: verseToWidgetData(lastWeek),
      thisWeek: verseToWidgetData(thisWeek),
      nextWeek: verseToWidgetData(nextWeek),
      lastUpdated: Date.now(),
    };
    
    const key = WIDGET_DATA_KEYS[ageGroup];
    await Preferences.set({
      key,
      value: JSON.stringify(widgetData),
    });
    
    console.log(`✅ 위젯 데이터 업데이트: ${ageGroup}`);
  } catch (error) {
    console.error(`❌ 위젯 데이터 업데이트 실패: ${ageGroup}`, error);
  }
}

/**
 * 모든 부서의 위젯 데이터 업데이트
 */
export async function updateAllWidgetData(): Promise<void> {
  try {
    await Promise.all([
      updateWidgetData('kindergarten'),
      updateWidgetData('elementary'),
      updateWidgetData('youth'),
    ]);
    
    console.log('✅ 모든 위젯 데이터 업데이트 완료');
  } catch (error) {
    console.error('❌ 위젯 데이터 업데이트 실패', error);
  }
}

/**
 * 특정 부서의 위젯 데이터 가져오기 (디버깅용)
 */
export async function getWidgetData(ageGroup: AgeGroup): Promise<WidgetData | null> {
  try {
    const key = WIDGET_DATA_KEYS[ageGroup];
    const { value } = await Preferences.get({ key });
    
    if (value) {
      return JSON.parse(value) as WidgetData;
    }
    
    return null;
  } catch (error) {
    console.error(`❌ 위젯 데이터 가져오기 실패: ${ageGroup}`, error);
    return null;
  }
}

/**
 * 위젯 데이터 초기화
 */
export async function initializeWidgetData(): Promise<void> {
  console.log('🔄 위젯 데이터 초기화 시작...');
  await updateAllWidgetData();
}

