// Calendar event template utility
import * as XLSX from 'xlsx';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

export interface CalendarEvent {
  date: string;
  title: string;
  description?: string;
  category?: string;
  time?: string;
  location?: string;
  startDate?: string; // 기간 일정 시작일
  endDate?: string;   // 기간 일정 종료일
}

// 샘플 데이터 (기존 calendar_events.xlsx와 동일한 구조)
const sampleEvents: CalendarEvent[] = [
  {
    date: '2025-01-26',
    title: '주일예배',
    description: '정기 주일예배',
    category: '예배',
    time: '10:00',
    location: '본당'
  },
  {
    date: '2025-02-01',
    title: '유치부 생일파티',
    description: '1월 생일자 축하',
    category: '행사',
    time: '14:00',
    location: '유치부실'
  },
  {
    date: '2025-02-15',
    title: '교사회의',
    description: '월례 교사회의',
    category: '모임',
    time: '19:00',
    location: '회의실'
  },
  {
    date: '2025-03-10',
    title: '3차 하계수양회',
    description: '교회학교 여름 수양회',
    category: '행사',
    time: '09:00',
    location: '수양관',
    startDate: '2025-03-10',
    endDate: '2025-03-14'
  },
  {
    date: '2025-04-01',
    title: '부활절 특별예배',
    description: '부활절 기념 특별예배 및 행사',
    category: '예배',
    time: '10:30',
    location: '본당',
    startDate: '2025-04-01',
    endDate: '2025-04-03'
  }
];

// Export function for downloading calendar template
export const downloadCalendarTemplate = async (): Promise<void> => {
  try {
    console.log('📋 캘린더 템플릿 생성 및 다운로드 시작...');
    
    // 플랫폼별 다운로드 방식
    const isNative = Capacitor.isNativePlatform();
    console.log(`🔍 플랫폼 감지: ${isNative ? 'Native (Mobile)' : 'Web'}`);
    
    const fileName = `교회학교_캘린더양식_${new Date().toISOString().slice(0, 10)}.xlsx`;
    
    // XLSX 워크북 생성
    const wb = XLSX.utils.book_new();
    console.log('📊 워크북 생성 완료');
    
    // 헤더 및 데이터 준비
    const headers = ['날짜', '제목', '설명', '분류', '시간', '장소', '시작일', '종료일'];
    const data = [headers, ...sampleEvents.map(event => [
      event.date,
      event.title,
      event.description || '',
      event.category || '',
      event.time || '',
      event.location || '',
      event.startDate || '',
      event.endDate || ''
    ])];
    
    console.log('📝 데이터 준비 완료:', data.length, '행');
    
    // 워크시트 생성
    const ws = XLSX.utils.aoa_to_sheet(data);
    console.log('📄 워크시트 생성 완료');
    
    // 컬럼 너비 설정
    ws['!cols'] = [
      { width: 12 }, // 날짜
      { width: 20 }, // 제목
      { width: 25 }, // 설명
      { width: 10 }, // 분류
      { width: 8 },  // 시간
      { width: 15 }, // 장소
      { width: 12 }, // 시작일
      { width: 12 }  // 종료일
    ];
    
    // 헤더 스타일링 (첫 번째 행)
    const headerStyle = { font: { bold: true }, fill: { fgColor: { rgb: 'E3F2FD' } } };
    ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1'].forEach(cell => {
      if (ws[cell]) ws[cell].s = headerStyle;
    });
    
    // 워크시트를 워크북에 추가
    XLSX.utils.book_append_sheet(wb, ws, '교회일정');
    console.log('📚 워크시트를 워크북에 추가 완료');
    
    if (isNative) {
      // 모바일 앱에서는 직접 파일 시스템에 저장
      console.log('📱 모바일 환경: 직접 파일 시스템에 저장');
      
      try {
        // XLSX를 base64로 직접 생성 (손상 방지)
        const base64String = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
        console.log('📄 XLSX(base64) 생성 완료, 길이:', base64String.length);

        // 1) Documents
        try {
          await Filesystem.writeFile({
            path: fileName,
            data: base64String,
            directory: Directory.Documents,
          });
          const fileUri = await Filesystem.getUri({ directory: Directory.Documents, path: fileName });
          console.log('✅ Documents 저장 성공:', fileUri.uri);
        } catch (documentsError) {
          console.warn('⚠️ Documents 저장 실패 → External 시도:', documentsError);
          try {
            await Filesystem.writeFile({
              path: fileName,
              data: base64String,
              directory: Directory.External,
            });
            const fileUri = await Filesystem.getUri({ directory: Directory.External, path: fileName });
            console.log('✅ External 저장 성공:', fileUri.uri);
          } catch (externalError) {
            console.warn('⚠️ External 저장 실패 → Cache 시도:', externalError);
            await Filesystem.writeFile({
              path: fileName,
              data: base64String,
              directory: Directory.Cache,
            });
            const fileUri = await Filesystem.getUri({ directory: Directory.Cache, path: fileName });
            console.log('✅ Cache 저장 성공:', fileUri.uri);
          }
        }

      } catch (mobileError) {
        console.error('❌ 모바일 저장 실패:', mobileError);
        throw new Error(`파일 저장 실패: ${mobileError instanceof Error ? mobileError.message : '알 수 없는 오류'}`);
      }
      
    } else {
      // 웹 브라우저: Blob 다운로드 (엑셀 호환성 높음)
      console.log('🌐 웹 환경: Blob 다운로드');
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      console.log('✅ Blob 방식으로 다운로드 완료');
    }
    
    console.log('🎉 캘린더 템플릿 다운로드 전체 완료');
    
  } catch (error) {
    console.error('❌ 캘린더 양식 다운로드 실패:', error);
    throw new Error(`템플릿 다운로드 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}; 