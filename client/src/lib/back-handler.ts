import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

let backButtonListener: any = null;

export interface BackHandlerOptions {
  isMainTab: boolean;
  onBack?: () => void;
  onExitConfirm?: () => void;
}

/**
 * 뒤로가기 버튼 핸들러 초기화
 * @param options.isMainTab - 메인 탭(유치부/초등부/메인화면/중고등부/캘린더)인지 여부
 * @param options.onBack - 서브 페이지에서 뒤로가기 동작 (optional)
 * @param options.onExitConfirm - 메인 탭에서 종료 확인 다이얼로그 표시 (optional)
 */
export async function setupBackHandler(options: BackHandlerOptions) {
  // 네이티브 플랫폼에서만 동작
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // 기존 리스너 제거
    if (backButtonListener) {
      await backButtonListener.remove();
      backButtonListener = null;
    }

    // 새 리스너 등록
    backButtonListener = await CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (options.isMainTab) {
        // 메인 탭: 종료 확인 다이얼로그
        if (options.onExitConfirm) {
          options.onExitConfirm();
        }
      } else {
        // 서브 페이지: 뒤로가기
        if (options.onBack) {
          options.onBack();
        } else if (window.history.length > 1) {
          window.history.back();
        }
      }
    });
  } catch (error) {
    console.error('뒤로가기 핸들러 설정 실패:', error);
  }
}

/**
 * 뒤로가기 핸들러 정리
 */
export async function cleanupBackHandler() {
  if (backButtonListener) {
    try {
      await backButtonListener.remove();
      backButtonListener = null;
    } catch (error) {
      console.error('뒤로가기 핸들러 정리 실패:', error);
    }
  }
}

/**
 * 앱 종료
 */
export async function exitApp() {
  try {
    await CapacitorApp.exitApp();
  } catch (error) {
    console.error('앱 종료 실패:', error);
  }
}

