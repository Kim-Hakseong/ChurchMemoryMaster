// 폰트 크기 설정 관리

export type FontSize = 'sm' | 'base' | 'lg';
export type AgeGroup = 'kindergarten' | 'elementary' | 'youth';

interface FontSizeSettings {
  kindergarten: FontSize;
  elementary: FontSize;
  youth: FontSize;
}

const STORAGE_KEY = 'font_size_settings';

const DEFAULT_SETTINGS: FontSizeSettings = {
  kindergarten: 'base',
  elementary: 'base',
  youth: 'base',
};

// 폰트 크기 설정 가져오기
export function getFontSizeSettings(): FontSizeSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (error) {
    console.error('폰트 크기 설정 불러오기 실패:', error);
  }
  return DEFAULT_SETTINGS;
}

// 특정 부서의 폰트 크기 가져오기
export function getFontSize(ageGroup: AgeGroup): FontSize {
  const settings = getFontSizeSettings();
  return settings[ageGroup];
}

// 특정 부서의 폰트 크기 설정하기
export function setFontSize(ageGroup: AgeGroup, size: FontSize): void {
  try {
    const settings = getFontSizeSettings();
    settings[ageGroup] = size;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('폰트 크기 설정 저장 실패:', error);
  }
}

// 폰트 크기를 Tailwind CSS 클래스로 변환
export function getFontSizeClass(size: FontSize): string {
  switch (size) {
    case 'sm':
      return 'text-sm';
    case 'base':
      return 'text-base';
    case 'lg':
      return 'text-lg';
    default:
      return 'text-base';
  }
}

// 폰트 크기 라벨
export const FONT_SIZE_LABELS: Record<FontSize, string> = {
  sm: '작게',
  base: '보통',
  lg: '크게',
};

