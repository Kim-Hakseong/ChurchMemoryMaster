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
        const fileName = `교회암송말씀_${new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')}.png`;
        
        // base64에서 data:image/png;base64, 부분 제거
        const base64WithoutPrefix = base64Data.replace(/^data:image\/png;base64,/, '');
        
        console.log('파일 저장 시도:', fileName);
        
        // Documents 디렉토리에 저장 (base64 데이터)
        const result = await Filesystem.writeFile({
          path: fileName,
          data: base64WithoutPrefix,
          directory: Directory.Documents,
          // 이미지 파일은 encoding 생략 (자동으로 base64로 처리됨)
        });
        
        console.log('파일 저장 성공:', result.uri);
        let fileUrl = result.uri;
        try {
          const uri = await Filesystem.getUri({ directory: Directory.Documents, path: fileName });
          if (uri?.uri) fileUrl = uri.uri;
        } catch {}
        
        // iOS에서는 Documents에만 저장하면 사용자가 접근하기 어려우므로 공유 시트 표시
        try {
          const platform = Capacitor.getPlatform();
          if (platform === 'ios') {
            await Share.share({
              title: '교회 암송 말씀',
              text: '이미지를 사진 앱에 저장하거나 공유하세요.',
              url: fileUrl
            });
          }
        } catch (shareErr) {
          console.warn('공유 시트 표시 실패(무시 가능):', shareErr);
        }
        
        // 저장 성공을 사용자에게 알림
        if (navigator.vibrate) {
          navigator.vibrate(200); // 성공 진동
        }
        
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