import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { toPng } from 'html-to-image';

let isCapturing = false;

/**
 * 스크린 캡처 유틸리티
 *
 * html-to-image 사용 (SVG foreignObject 방식)
 * - 브라우저 렌더링 엔진이 직접 레이아웃을 처리하므로
 *   fixed 포지셔닝 요소의 위치가 정확함
 * - html2canvas의 고질적인 텍스트 밀림 문제 해결
 */
export const captureScreen = async (): Promise<void> => {
  try {
    if (isCapturing) return;
    isCapturing = true;

    // 캡처 버튼 숨기기
    const captureButtons = document.querySelectorAll('[data-capture-button]');
    captureButtons.forEach(btn => {
      (btn as HTMLElement).style.visibility = 'hidden';
    });

    // 하단 내비게이션 바 숨기기
    const navBar = document.querySelector('[data-bottom-nav]') as HTMLElement | null;
    if (navBar) navBar.style.visibility = 'hidden';

    // DOM 업데이트 대기
    await new Promise(resolve => setTimeout(resolve, 50));

    // html-to-image로 캡처 (SVG foreignObject → Canvas → PNG)
    // fixed 요소도 브라우저가 직접 렌더링하므로 위치 정확
    const dataUrl = await toPng(document.body, {
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: 2,
      cacheBust: true,
      filter: (node: HTMLElement) => {
        // data-capture-button 요소 제외
        if (node.hasAttribute?.('data-capture-button')) return false;
        if (node.getAttribute?.('data-bottom-nav') !== null &&
            node.hasAttribute?.('data-bottom-nav')) return false;
        return true;
      },
    });

    // 버튼/내비 복원
    captureButtons.forEach(btn => {
      (btn as HTMLElement).style.visibility = '';
    });
    if (navBar) navBar.style.visibility = '';

    // 파일 저장/공유
    await saveOrShare(dataUrl);

  } catch (error) {
    // 복원 보장
    document.querySelectorAll('[data-capture-button]').forEach(btn => {
      (btn as HTMLElement).style.visibility = '';
    });
    const nav = document.querySelector('[data-bottom-nav]') as HTMLElement | null;
    if (nav) nav.style.visibility = '';

    console.error('스크린 캡처 실패:', error);
    throw new Error('캡처에 실패했습니다.');
  } finally {
    isCapturing = false;
  }
};

/**
 * base64 이미지를 플랫폼에 맞게 저장 또는 공유
 */
async function saveOrShare(base64Data: string): Promise<void> {
  const isNative = Capacitor.isNativePlatform();

  if (!isNative) {
    const link = document.createElement('a');
    link.download = `교회암송말씀_${new Date().toISOString().slice(0, 10)}.png`;
    link.href = base64Data;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  const base64WithoutPrefix = base64Data.replace(/^data:image\/png;base64,/, '');
  const platform = Capacitor.getPlatform();

  if (platform === 'ios') {
    try {
      const media: any = await import('@capacitor-community/media');
      if (media?.Media?.savePhoto) {
        try {
          await media.Media.savePhoto({ data: base64WithoutPrefix, album: 'ChurchMemory' });
        } catch {
          await media.Media.savePhoto({ base64: base64WithoutPrefix, album: 'ChurchMemory' });
        }
        if (navigator.vibrate) navigator.vibrate(200);
        return;
      }
    } catch { /* Media 플러그인 없음 */ }

    const fileName = `capture_${Date.now()}.png`;
    await Filesystem.writeFile({ path: fileName, data: base64WithoutPrefix, directory: Directory.Cache });
    const uri = await Filesystem.getUri({ directory: Directory.Cache, path: fileName });
    await Share.share({ title: '교회 암송 말씀', url: uri.uri });
    if (navigator.vibrate) navigator.vibrate(200);
    return;
  }

  const fileName = `교회암송말씀_${new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')}.png`;
  await Filesystem.writeFile({ path: fileName, data: base64WithoutPrefix, directory: Directory.Documents });
  if (navigator.vibrate) navigator.vibrate(200);
}
