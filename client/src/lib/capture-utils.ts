import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';

let isCapturing = false;

// Screen capture utility with native file saving
export const captureScreen = async (): Promise<void> => {
  try {
    if (isCapturing) {
      console.log('⚠️ 캡처 진행 중 - 중복 요청 무시');
      return;
    }
    isCapturing = true;
    console.log('=== 스크린 캡처 시작 ===');
    
    // 캡처 버튼 숨기기
    const captureButtons = document.querySelectorAll('[data-capture-button]');
    captureButtons.forEach(button => {
      (button as HTMLElement).style.display = 'none';
    });
    
    // 잠시 대기 (DOM 업데이트 시간)
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // html2canvas로 스크린샷 생성
    const html2canvas = await import('html2canvas');
    
    const element = document.body;
    console.log('html2canvas 캡처 중...');
    
    const canvas = await html2canvas.default(element, {
      height: window.innerHeight,
      width: window.innerWidth,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      scale: 2, // 고해상도
      logging: false, // 로그 비활성화
      ignoreElements: (element) => {
        // 캡처 버튼이나 관련 요소들 제외
        return element.hasAttribute('data-capture-button') || 
               element.closest('[data-capture-button]') !== null;
      }
    });
    
    // 캡처 버튼 다시 표시
    captureButtons.forEach(button => {
      (button as HTMLElement).style.display = '';
    });
    
    // 캔버스를 base64로 변환
    const base64Data = canvas.toDataURL('image/png', 1.0);
    console.log('캔버스 생성 완료, base64 길이:', base64Data.length);
    
    // 네이티브 환경인지 확인
    const isNative = Capacitor.isNativePlatform();
    console.log('네이티브 환경:', isNative);
    
    if (isNative) {
      // 네이티브 환경: Filesystem API로 파일 저장
      try {
        const platform = Capacitor.getPlatform();
        if (platform === 'ios') {
          // iOS: 1) Media 플러그인으로 갤러리에 직접 저장 시도 → 2) 실패 시 Share 시트 폴백
          const base64WithoutPrefix = base64Data.replace(/^data:image\/png;base64,/, '');
          try {
            const media: any = await import('@capacitor-community/media');
            if (media && media.Media && typeof media.Media.savePhoto === 'function') {
              // 다양한 시그니처 대비
              try {
                await media.Media.savePhoto({ data: base64WithoutPrefix, album: 'ChurchMemory' });
              } catch {
                await media.Media.savePhoto({ base64: base64WithoutPrefix, album: 'ChurchMemory' });
              }
              console.log('📸 iOS 갤러리에 저장 완료(Media)');
              if (navigator.vibrate) navigator.vibrate(200);
              return;
            }
          } catch (e) {
            console.log('Media 플러그인 불가/미설치, Share 시트로 폴백:', e);
          }

          // 폴백: Cache에 저장 후 Share로 "사진에 저장" 유도
          const fileName = `capture_${Date.now()}.png`;
          await Filesystem.writeFile({ path: fileName, data: base64WithoutPrefix, directory: Directory.Cache });
          const uri = await Filesystem.getUri({ directory: Directory.Cache, path: fileName });
          await Share.share({ title: '교회 암송 말씀', url: uri.uri });
          if (navigator.vibrate) navigator.vibrate(200);
          return;
        }
        // Android 등: 파일 저장 후 알림
        const fileName = `교회암송말씀_${new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')}.png`;
        const base64WithoutPrefix = base64Data.replace(/^data:image\/png;base64,/, '');
        await Filesystem.writeFile({ path: fileName, data: base64WithoutPrefix, directory: Directory.Documents });
        if (navigator.vibrate) navigator.vibrate(200);
        return;
      } catch (nativeError) {
        console.error('네이티브 파일 저장 실패:', nativeError);
        
        // 폴백: 웹 공유 API 시도
        try {
          // 파일 객체 생성 시도
          const blob = await fetch(base64Data).then(res => res.blob());
          const file = new File([blob], '교회암송말씀.png', { type: 'image/png' });
          
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: '교회 암송 말씀',
              files: [file],
            });
            return;
          }
        } catch (shareError) {
          console.log('웹 공유 API 실패:', shareError);
        }
        
        // 최종 폴백: 텍스트 공유
        try {
          const mainElement = document.querySelector('main');
          const verseText = mainElement?.textContent || '교회 암송 말씀';
          
          if (navigator.share) {
            await navigator.share({
              title: '교회 암송 말씀',
              text: verseText,
            });
            return;
          }
        } catch (textShareError) {
          console.log('텍스트 공유도 실패:', textShareError);
        }
        
        throw nativeError;
      }
    } else {
      // 웹 환경: 다운로드 링크 생성
      console.log('웹 환경에서 다운로드 링크 생성');
      const link = document.createElement('a');
      link.download = `교회암송말씀_${new Date().toISOString().slice(0, 10)}.png`;
      link.href = base64Data;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
  } catch (error) {
    console.error('스크린 캡처 완전 실패:', error);
    
    // 최종 최종 폴백: 프린트
    try {
      window.print();
    } catch (printError) {
      console.error('프린트도 실패:', printError);
      throw new Error('모든 캡처 방법이 실패했습니다.');
    }
  } finally {
    isCapturing = false;
  }
};