import * as XLSX from 'xlsx';
import type { Verse, Event, AgeGroup, MonthlyVerse } from "@shared/schema";
import { LocalStorage } from './storage';
import type { CalendarEvent } from './calendar-template';

export interface ParsedExcelData {
  verses: Verse[];
  events: Event[];
  monthlyVerses: MonthlyVerse[];
}

export class ExcelParser {
  static async parseFile(file: File): Promise<ParsedExcelData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          if (!data) throw new Error('파일을 읽을 수 없습니다.');

          const workbook = XLSX.read(data, { type: 'binary' });
          const result = this.parseWorkbook(workbook);

          // Save to storage
          // 주: verses.xlsx에는 이벤트가 포함되지 않으므로, events가 비어있을 때는 덮어쓰기 금지
          LocalStorage.saveVerses(result.verses);
          if (result.events && result.events.length > 0) {
            await LocalStorage.saveEvents(result.events);
          }
          LocalStorage.saveMonthlyVerses(result.monthlyVerses);

          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('파일 읽기 오류가 발생했습니다.'));
      reader.readAsBinaryString(file);
    });
  }

  private static parseWorkbook(workbook: XLSX.WorkBook): ParsedExcelData {
    const verses: Verse[] = [];
    const events: Event[] = [];
    const monthlyVerses: MonthlyVerse[] = [];
    let id = 1;
    let eventId = 1;
    let monthlyId = 1;

    console.log('🔍 엑셀 파일 구조 분석 시작...');
    console.log('📋 시트 목록:', Object.keys(workbook.Sheets));

    // Sheet name mapping
    const sheetMapping: Record<string, AgeGroup> = {
      '유치부': 'kindergarten',
      '초등부': 'elementary',
      '중고등부': 'youth',
      '중‧고등부': 'youth',
    };

    // Parse each sheet
    Object.keys(workbook.Sheets).forEach(sheetName => {
      console.log(`\n📊 시트 처리 중: ${sheetName}`);
      
      // Handle monthly verse sheet
      if (sheetName === '초등월암송') {
        console.log('📅 월암송 시트 처리...');
        const monthlySheetVerses = this.parseMonthlyVerseSheet(workbook.Sheets[sheetName], monthlyId);
        monthlyVerses.push(...monthlySheetVerses);
        monthlyId += monthlySheetVerses.length;
        console.log(`✅ 월암송 시트 완료: ${monthlySheetVerses.length}개`);
        return;
      }
      
      // Handle regular age group sheets
      const ageGroup = sheetMapping[sheetName];
      if (!ageGroup) {
        console.log(`⚠️ 매핑되지 않은 시트: ${sheetName}`);
        return;
      }

      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      
      console.log(`📊 ${sheetName} 시트 데이터:`);
      console.log(`  - 총 행 수: ${jsonData.length}`);
      console.log(`  - 첫 3행 미리보기:`, jsonData.slice(0, 3));

      // Find header row and create column mapping
      let headerRowIndex = 0;
      let colMap = { lesson: 0, content: 1, date: 2 }; // 기본값
      
      for (let i = 0; i < Math.min(3, jsonData.length); i++) {
        const row = jsonData[i] as any[];
        if (row && row.some((cell: any) => 
          typeof cell === 'string' && 
          (cell.includes('날짜') || cell.includes('구절') || cell.includes('성경구절') || 
           cell.includes('공과명') || cell.includes('해당날짜'))
        )) {
          headerRowIndex = i;
          const headerRow = row as string[];
          console.log(`  - 헤더 행 발견: ${i + 1}행`);
          console.log(`  - 헤더 내용:`, headerRow);
          
          // 컬럼 인덱스 자동 매핑
          colMap = {
            lesson: headerRow.findIndex(h => h && h.includes('공과명')),
            content: headerRow.findIndex(h => h && (h.includes('구절') || h.includes('성경구절'))),
            date: headerRow.findIndex(h => h && (h.includes('날짜') || h.includes('해당날짜')))
          };
          
          // 매핑 실패 시 기본값 사용
          if (colMap.lesson === -1) colMap.lesson = 0;
          if (colMap.content === -1) colMap.content = 1;
          if (colMap.date === -1) colMap.date = 2;
          
          console.log(`  - 컬럼 매핑:`, colMap);
          break;
        }
      }

      // Parse data rows
      let parsedCount = 0;
      for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
        const row = jsonData[i] as any[];
        if (!row || row.length < Math.max(colMap.lesson, colMap.content, colMap.date) + 1) {
          console.log(`  - 행 ${i + 1}: 데이터 부족 (${row?.length || 0}개 컬럼, 필요: ${Math.max(colMap.lesson, colMap.content, colMap.date) + 1}개)`);
          continue;
        }

        try {
          const lessonName = row[colMap.lesson];  // 공과명
          const contentValue = row[colMap.content]; // 구절 (내용)
          const dateValue = row[colMap.date];    // 해당날짜

          console.log(`  - 행 ${i + 1} 데이터:`, {
            lessonName: lessonName,
            content: contentValue?.toString().substring(0, 50) + '...',
            date: dateValue
          });

          if (!lessonName || !contentValue || !dateValue) {
            console.log(`  - 행 ${i + 1}: 필수 데이터 누락`);
            continue;
          }

          // Parse date from Excel serial number
          let dateStr = '';
          if (typeof dateValue === 'number') {
            // Excel serial date to JavaScript date
            const excelDate = new Date((dateValue - 25569) * 86400 * 1000);
            const year = excelDate.getUTCFullYear();
            const month = String(excelDate.getUTCMonth() + 1).padStart(2, '0');
            const day = String(excelDate.getUTCDate()).padStart(2, '0');
            // 원본 연도 사용 (강제 조정 제거)
            dateStr = `${year}-${month}-${day}`;
            console.log(`  - Excel 날짜 변환: ${dateValue} → ${dateStr}`);
          } else if (typeof dateValue === 'string') {
            const parsedDate = new Date(dateValue);
            if (!isNaN(parsedDate.getTime())) {
              const year = parsedDate.getFullYear();
              const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
              const day = String(parsedDate.getDate()).padStart(2, '0');
              // 원본 연도 사용 (강제 조정 제거)
              dateStr = `${year}-${month}-${day}`;
              console.log(`  - 문자열 날짜 변환: ${dateValue} → ${dateStr}`);
            }
          }

          if (!dateStr) {
            console.log(`  - 행 ${i + 1}: 날짜 파싱 실패`);
            continue;
          }

          // Extract reference from content (usually in parentheses at the end)
          let reference = '';
          const contentStr = String(contentValue);
          const refMatch = contentStr.match(/\(([^)]+)\)\s*$/);
          if (refMatch) {
            reference = refMatch[1].trim();
            // Remove the reference from content
            const contentWithoutRef = contentStr.replace(/\s*\([^)]+\)\s*$/, '').trim();
            
            const verse: Verse = {
              id: id++,
              date: dateStr,
              reference: reference,
              content: contentWithoutRef,
              lessonName: String(lessonName).trim(),
              ageGroup,
            };

            verses.push(verse);
            parsedCount++;
            console.log(`  ✅ 행 ${i + 1} 파싱 성공: ${reference}`);
          } else {
            // If no reference found, use lesson name as reference
            const verse: Verse = {
              id: id++,
              date: dateStr,
              reference: String(lessonName).trim(),
              content: contentStr,
              lessonName: String(lessonName).trim(),
              ageGroup,
            };

            verses.push(verse);
            parsedCount++;
            console.log(`  ✅ 행 ${i + 1} 파싱 성공 (공과명 참조): ${lessonName}`);
          }

        } catch (error) {
          console.warn(`❌ 행 ${i + 1} 파싱 실패:`, error);
        }
      }
      
      console.log(`📊 ${sheetName} 시트 파싱 완료: ${parsedCount}개 구절`);
    });

    console.log(`\n🎯 전체 파싱 결과:`);
    console.log(`  - 암송구절: ${verses.length}개`);
    console.log(`  - 이벤트: ${events.length}개`);
    console.log(`  - 월암송: ${monthlyVerses.length}개`);
    
    return { verses, events, monthlyVerses };
  }

  private static parseMonthlyVerseSheet(sheet: XLSX.WorkSheet, startId: number): MonthlyVerse[] {
    const monthlyVerses: MonthlyVerse[] = [];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    
    console.log('  - 월암송 시트 데이터 구조 분석:', jsonData.slice(0, 5));
    
    // Find header row and create column mapping
    let headerRowIndex = 0;
    let colMap = { month: 0, reference: 1, content: 2 }; // 기본값
    
    for (let i = 0; i < Math.min(5, jsonData.length); i++) {
      const row = jsonData[i];
      if (row && row.some((cell: any) => 
        typeof cell === 'string' && 
        (cell.includes('해당 월') || cell.includes('월') || cell.includes('구절'))
      )) {
        headerRowIndex = i;
        const headerRow = row as string[];
        console.log('  - 헤더 행 발견:', headerRow);
        
        // 실제 엑셀 구조에 맞게 매핑
        colMap = {
          month: headerRow.findIndex(h => h && typeof h === 'string' && h.includes('해당 월')),
          reference: -1, // 별도 컬럼 없음, content에서 추출
          content: headerRow.findIndex(h => h && typeof h === 'string' && h.includes('구절'))
        };
        
        // 기본값 설정
        if (colMap.month === -1) colMap.month = 0;
        if (colMap.content === -1) colMap.content = 2;
        
        console.log('  - 월암송 컬럼 매핑:', colMap);
        break;
      }
    }
    
    // Parse data rows
    for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row || row.length === 0) continue;
      
      const monthCell = row[colMap.month];
      const contentCell = row[colMap.content];
      
      if (!monthCell || !contentCell) continue;
      
      // 월 정보 처리 (2025.1 → 1월)
      let monthStr = String(monthCell).trim();
      let monthNumber = 1;
      
      if (monthStr.includes('.')) {
        const parts = monthStr.split('.');
        if (parts.length >= 2) {
          monthNumber = parseInt(parts[1], 10);
        }
      } else if (monthStr.includes('월')) {
        monthNumber = parseInt(monthStr.replace('월', ''), 10);
      } else {
        monthNumber = parseInt(monthStr, 10);
      }
      
      if (isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) continue;
      
      // 내용에서 성경구절 추출
      const content = String(contentCell).trim();
      let reference = '';
      let cleanContent = content;
      
      // 괄호 안의 성경구절 추출 (예: (요한복음 1장 1~4절))
      const referenceMatch = content.match(/\(([^)]+)\)/);
      if (referenceMatch) {
        reference = referenceMatch[1].trim();
        cleanContent = content.replace(/\([^)]+\)/, '').trim();
      }
      
      if (!reference) {
        console.log(`  ⚠️ 행 ${i + 1}: reference 추출 실패, 건너뜀`);
        continue;
      }
      
      // 연도 추출: 'YYYY.M' 형식이면 연도 사용, 아니면 현재 연도
      let yearNumber = new Date().getFullYear();
      if (monthStr.includes('.')) {
        const parts = monthStr.split('.');
        if (parts.length >= 2) {
          const parsedYear = parseInt(parts[0], 10);
          if (!isNaN(parsedYear) && parsedYear >= 2000 && parsedYear <= 2100) {
            yearNumber = parsedYear;
          }
        }
      }

      const monthlyVerse: MonthlyVerse = {
        id: startId + monthlyVerses.length,
        year: yearNumber,
        month: monthNumber,
        reference,
        content: cleanContent || content
      };
      
      monthlyVerses.push(monthlyVerse);
      console.log(`  ✅ 월암송 ${monthNumber}월 파싱 성공: ${reference}`);
    }
    
    console.log(`  Parsed ${monthlyVerses.length} monthly verses`);
    return monthlyVerses;
  }

  // 캘린더 이벤트 전용 파싱 함수
  static async parseCalendarFile(file: File): Promise<Event[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          if (!data) throw new Error('파일을 읽을 수 없습니다.');

          const workbook = XLSX.read(data, { type: 'binary' });
          const calendarEvents = this.parseCalendarWorkbook(workbook);

          // 파일에서 최신 이벤트 로드 후 병합 (+전역 중복 제거)
          const existingEvents = await LocalStorage.getEvents();

          const signature = (ev: Event) => {
            return [
              (ev.date || '').trim(),
              (ev.title || '').trim(),
              (ev.startDate || '').trim(),
              (ev.endDate || '').trim(),
              (ev.description || '').trim(),
            ].join('|');
          };

          const mergedMap = new Map<string, Event>();
          // 기존 이벤트 우선 보존
          for (const ev of existingEvents) {
            mergedMap.set(signature(ev), ev);
          }
          // 신규 파싱 이벤트 추가(동일 시그니처는 무시)
          for (const ev of calendarEvents) {
            const sig = signature(ev);
            if (!mergedMap.has(sig)) {
              mergedMap.set(sig, ev);
            }
          }

          const deduped = Array.from(mergedMap.values());
          await LocalStorage.saveEvents(deduped);

          console.log(`캘린더 이벤트 ${calendarEvents.length}개가 추가되었습니다.`);
          resolve(calendarEvents);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('파일 읽기 오류가 발생했습니다.'));
      reader.readAsBinaryString(file);
    });
  }

  private static parseCalendarWorkbook(workbook: XLSX.WorkBook): Event[] {
    const events: Event[] = [];
    let eventId = Date.now(); // 고유 ID 생성
    
    // 첫 번째 시트 사용
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return events;
    
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
    
    // 헤더 찾기 (첫 번째 또는 두 번째 행)
    let headerRowIndex = 0;
    for (let i = 0; i < Math.min(3, jsonData.length); i++) {
      const row = jsonData[i];
      if (row && row.some((cell: any) => 
        typeof cell === 'string' && 
        (cell.includes('날짜') || cell.includes('제목') || cell.toLowerCase().includes('date') || cell.toLowerCase().includes('title'))
      )) {
        headerRowIndex = i;
        break;
      }
    }
    
    const headers = jsonData[headerRowIndex] || [];
    const dataStartIndex = headerRowIndex + 1;
    
    // 컬럼 인덱스 찾기
    const getColumnIndex = (patterns: string[]) => {
      return headers.findIndex((header: any) => 
        patterns.some(pattern => 
          String(header || '').toLowerCase().includes(pattern.toLowerCase())
        )
      );
    };
    
    const dateIndex = getColumnIndex(['날짜', 'date']);
    const titleIndex = getColumnIndex(['제목', '제목', 'title', '행사']);
    const descriptionIndex = getColumnIndex(['설명', '내용', 'description', 'desc']);
    const categoryIndex = getColumnIndex(['카테고리', '분류', 'category', '종류']);
    const timeIndex = getColumnIndex(['시간', 'time']);
    const locationIndex = getColumnIndex(['장소', '위치', 'location', '장소']);
    const startDateIndex = getColumnIndex(['시작일', '시작날짜', 'start_date', 'startdate', '시작']);
    const endDateIndex = getColumnIndex(['종료일', '종료날짜', 'end_date', 'enddate', '종료']);
    
    // 데이터 파싱
    for (let i = dataStartIndex; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row || row.length === 0) continue;
      
      const dateValue = row[dateIndex];
      const titleValue = row[titleIndex];
      
      if (!dateValue || !titleValue) continue;
      
      try {
        // 날짜 파싱
        let dateStr = '';
        if (typeof dateValue === 'number') {
          // Excel 날짜 시리얼 번호 (시간대 보정)
          const excelDate = new Date((dateValue - 25569) * 86400 * 1000);
          // 로컬 시간대로 변환하여 정확한 날짜 표시
          const year = excelDate.getUTCFullYear();
          const month = String(excelDate.getUTCMonth() + 1).padStart(2, '0');
          const day = String(excelDate.getUTCDate()).padStart(2, '0');
          dateStr = `${year}-${month}-${day}`;
        } else if (typeof dateValue === 'string') {
          // 문자열 날짜
          const parsedDate = new Date(dateValue);
          if (!isNaN(parsedDate.getTime())) {
            const year = parsedDate.getFullYear();
            const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
            const day = String(parsedDate.getDate()).padStart(2, '0');
            dateStr = `${year}-${month}-${day}`;
          }
        }
        
        if (!dateStr) continue;
        
        // 시작일/종료일 파싱
        let startDateStr: string | null = null;
        let endDateStr: string | null = null;
        
        if (startDateIndex >= 0 && row[startDateIndex]) {
          const startDateValue = row[startDateIndex];
          if (typeof startDateValue === 'number') {
            const excelDate = new Date((startDateValue - 25569) * 86400 * 1000);
            const year = excelDate.getUTCFullYear();
            const month = String(excelDate.getUTCMonth() + 1).padStart(2, '0');
            const day = String(excelDate.getUTCDate()).padStart(2, '0');
            startDateStr = `${year}-${month}-${day}`;
          } else if (typeof startDateValue === 'string') {
            const parsedDate = new Date(startDateValue);
            if (!isNaN(parsedDate.getTime())) {
              const year = parsedDate.getFullYear();
              const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
              const day = String(parsedDate.getDate()).padStart(2, '0');
              startDateStr = `${year}-${month}-${day}`;
            }
          }
        }
        
        if (endDateIndex >= 0 && row[endDateIndex]) {
          const endDateValue = row[endDateIndex];
          if (typeof endDateValue === 'number') {
            const excelDate = new Date((endDateValue - 25569) * 86400 * 1000);
            const year = excelDate.getUTCFullYear();
            const month = String(excelDate.getUTCMonth() + 1).padStart(2, '0');
            const day = String(excelDate.getUTCDate()).padStart(2, '0');
            endDateStr = `${year}-${month}-${day}`;
          } else if (typeof endDateValue === 'string') {
            const parsedDate = new Date(endDateValue);
            if (!isNaN(parsedDate.getTime())) {
              const year = parsedDate.getFullYear();
              const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
              const day = String(parsedDate.getDate()).padStart(2, '0');
              endDateStr = `${year}-${month}-${day}`;
            }
          }
        }
        
        const event: Event = {
          id: eventId++,
          date: dateStr,
          title: String(titleValue).trim(),
          description: descriptionIndex >= 0 ? String(row[descriptionIndex] || '').trim() || null : null,
          ageGroup: null, // 캘린더 이벤트는 전체 대상
          startDate: startDateStr,
          endDate: endDateStr,
        };
        
        // 추가 정보가 있으면 description에 포함
        const additionalInfo = [];
        if (categoryIndex >= 0 && row[categoryIndex]) {
          additionalInfo.push(`분류: ${row[categoryIndex]}`);
        }
        if (timeIndex >= 0 && row[timeIndex]) {
          additionalInfo.push(`시간: ${row[timeIndex]}`);
        }
        if (locationIndex >= 0 && row[locationIndex]) {
          additionalInfo.push(`장소: ${row[locationIndex]}`);
        }
        
        if (additionalInfo.length > 0) {
          event.description = event.description ? 
            `${event.description}\n${additionalInfo.join(' | ')}` : 
            additionalInfo.join(' | ');
        }
        
        events.push(event);
        
      } catch (error) {
        console.warn(`행 ${i + 1} 파싱 실패:`, error);
      }
    }
    
    console.log(`캘린더 이벤트 ${events.length}개 파싱 완료`);
    return events;
  }
}

