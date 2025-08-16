// 암송 말씀 엑셀 파일 템플릿 생성
import * as XLSX from 'xlsx';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

export interface VerseTemplate {
  date: string;
  reference: string;
  content: string;
  ageGroup: string;
}

export interface MonthlyVerseTemplate {
  month: number;
  reference: string;
  content: string;
}

// 샘플 데이터
const sampleVerses: VerseTemplate[] = [
  {
    date: '2025-07-20',
    reference: '잠언 17장 17절',
    content: '친구는 사랑이 끊이지 아니하고',
    ageGroup: '유치부'
  },
  {
    date: '2025-07-27',
    reference: '시편 119편 57절',
    content: '나는 주의 말씀을 지키리라',
    ageGroup: '유치부'
  },
  {
    date: '2025-08-03',
    reference: '디모데전서 6장 16절',
    content: '아무 사람도 보지 못하였고 또 볼 수 없는 자시니',
    ageGroup: '유치부'
  },
  {
    date: '2025-07-20',
    reference: '요한일서 4장 19절',
    content: '우리가 사랑함은 그가 먼저 우리를 사랑하셨음이라',
    ageGroup: '초등부'
  },
  {
    date: '2025-07-27',
    reference: '신명기 17장 19절',
    content: '평생에 자기 옆에 두고 읽어서',
    ageGroup: '초등부'
  },
  {
    date: '2025-08-03',
    reference: '창세기 1장 3절',
    content: '빛이 있으라 하시매 빛이 있었고',
    ageGroup: '초등부'
  },
  {
    date: '2025-07-20',
    reference: '시편 33편 6절',
    content: '여호와의 말씀으로 하늘이 지음이 되었으며',
    ageGroup: '중고등부'
  },
  {
    date: '2025-07-27',
    reference: '전도서 3장 11절',
    content: '하나님이 모든 것을 지으시되 때를 따라 아름답게 하셨고',
    ageGroup: '중고등부'
  },
  {
    date: '2025-08-03',
    reference: '창세기 1장 14절',
    content: '하늘의 궁창에 광명이 있어 주야를 나뉘게 하라',
    ageGroup: '중고등부'
  }
];

const sampleMonthlyVerses: MonthlyVerseTemplate[] = [
  {
    month: 7,
    reference: '데살로니가전서 5장 5-8절',
    content: '너희는 다 빛의 아들이요 낮의 아들이라 우리가 밤이나 어두움에 속하지 아니하나니 그러므로 우리는 다른 이들과 같이 자지 말고 오직 깨어 근신할지라 자는 자들은 밤에 자고 취하는 자들은 밤에 취하되 우리는 낮에 속하였으니 근신하여 믿음과 사랑의 흉배를 붙이고 구원의 소망의 투구를 쓰자'
  },
  {
    month: 8,
    reference: '시편 119편 105절',
    content: '주의 말씀은 내 발에 등이요 내 길에 빛이니이다'
  },
  {
    month: 9,
    reference: '요한복음 3장 16절',
    content: '하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 그를 믿는 자마다 멸망하지 않고 영생을 얻게 하려 하심이라'
  }
];

export async function downloadVerseTemplate(): Promise<void> {
  try {
    console.log('📋 암송 말씀 템플릿 생성 시작...');
    
    // 워크북 생성
    const wb = XLSX.utils.book_new();
    
    // 유치부 시트
    const kindergartenData = [
      ['날짜', '성경구절', '내용'],
      ...sampleVerses
        .filter(v => v.ageGroup === '유치부')
        .map(v => [v.date, v.reference, v.content])
    ];
    const wsKindergarten = XLSX.utils.aoa_to_sheet(kindergartenData);
    XLSX.utils.book_append_sheet(wb, wsKindergarten, '유치부');
    
    // 초등부 시트
    const elementaryData = [
      ['날짜', '성경구절', '내용'],
      ...sampleVerses
        .filter(v => v.ageGroup === '초등부')
        .map(v => [v.date, v.reference, v.content])
    ];
    const wsElementary = XLSX.utils.aoa_to_sheet(elementaryData);
    XLSX.utils.book_append_sheet(wb, wsElementary, '초등부');
    
    // 중고등부 시트
    const youthData = [
      ['날짜', '성경구절', '내용'],
      ...sampleVerses
        .filter(v => v.ageGroup === '중고등부')
        .map(v => [v.date, v.reference, v.content])
    ];
    const wsYouth = XLSX.utils.aoa_to_sheet(youthData);
    XLSX.utils.book_append_sheet(wb, wsYouth, '중고등부');
    
    // 초등월암송 시트
    const monthlyData = [
      ['월', '성경구절', '내용'],
      ...sampleMonthlyVerses.map(v => [v.month, v.reference, v.content])
    ];
    const wsMonthly = XLSX.utils.aoa_to_sheet(monthlyData);
    XLSX.utils.book_append_sheet(wb, wsMonthly, '초등월암송');
    
    // 파일 다운로드
    const fileName = `교회학교_암송말씀_양식_${new Date().toISOString().slice(0, 10)}.xlsx`;
    console.log('📁 파일 다운로드:', fileName);
    
    // 플랫폼별 다운로드 방식
    const isNative = Capacitor.isNativePlatform();
    console.log(`🔍 플랫폼 감지: ${isNative ? 'Native (Mobile)' : 'Web'}`);
    
    if (isNative) {
      // 모바일 앱 (Android/iOS)에서는 Share API 사용
      console.log('📱 모바일 환경: Share API 사용');
      
      try {
        // Excel 파일을 base64로 변환
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
        
        // 임시 파일로 저장
        const tempFileName = `temp_${fileName}`;
        await Filesystem.writeFile({
          path: tempFileName,
          data: wbout,
          directory: Directory.Cache,
          encoding: Encoding.UTF8
        });
        
        // 파일 URI 가져오기
        const fileUri = await Filesystem.getUri({
          directory: Directory.Cache,
          path: tempFileName
        });
        
        // Share API로 파일 공유
        await Share.share({
          title: '교회학교 암송 말씀 양식',
          text: '교회학교 암송 말씀 양식 파일입니다.',
          url: fileUri.uri,
          dialogTitle: '암송 말씀 양식 저장/공유'
        });
        
        console.log('✅ 모바일 Share API로 공유 완료');
        
        // 임시 파일 정리 (일정 시간 후)
        setTimeout(async () => {
          try {
            await Filesystem.deleteFile({
              path: tempFileName,
              directory: Directory.Cache
            });
            console.log('🗑️ 임시 파일 정리 완료');
          } catch (cleanupError) {
            console.warn('⚠️ 임시 파일 정리 실패:', cleanupError);
          }
        }, 5000);
        
      } catch (shareError) {
        console.error('❌ 모바일 공유 실패:', shareError);
        throw new Error(`모바일 공유 실패: ${shareError instanceof Error ? shareError.message : '알 수 없는 오류'}`);
      }
      
    } else {
      // 웹 브라우저에서는 기존 방식 사용
      console.log('🌐 웹 환경: 기존 다운로드 방식 사용');
      
      try {
        XLSX.writeFile(wb, fileName);
        console.log('✅ 암송 말씀 템플릿 다운로드 완료');
      } catch (writeError) {
        console.warn('⚠️ XLSX.writeFile 실패, Blob 방식으로 시도...', writeError);
        
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 100);
        
        console.log('✅ Blob 방식으로 암송 말씀 템플릿 다운로드 완료');
      }
    }
    
  } catch (error) {
    console.error('❌ 암송 말씀 템플릿 생성 실패:', error);
    throw new Error(`템플릿 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
} 