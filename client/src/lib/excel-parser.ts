import * as XLSX from 'xlsx';
import type { Verse, Event, AgeGroup } from "@shared/schema";
import { LocalStorage } from './storage';

export interface ParsedExcelData {
  verses: Verse[];
  events: Event[];
}

export class ExcelParser {
  static async parseFile(file: File): Promise<ParsedExcelData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (!data) throw new Error('파일을 읽을 수 없습니다.');
          
          const workbook = XLSX.read(data, { type: 'binary' });
          const result = this.parseWorkbook(workbook);
          
          // Save to local storage
          LocalStorage.saveVerses(result.verses);
          LocalStorage.saveEvents(result.events);
          
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
    let id = 1;
    let eventId = 1;

    // Sheet name mapping
    const sheetMapping: Record<string, AgeGroup> = {
      '유치부': 'kindergarten',
      '초등부': 'elementary',
      '중고등부': 'youth',
      '중‧고등부': 'youth',
    };

    // Parse each sheet
    Object.keys(workbook.Sheets).forEach(sheetName => {
      const ageGroup = sheetMapping[sheetName];
      if (!ageGroup) return;

      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      // Skip header row
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i] as any[];
        if (!row || row.length < 2) continue;

        const dateValue = row[0];
        const verseText = row[1];
        const additionalInfo = row[2];

        if (!dateValue || !verseText) continue;

        // Parse date
        let date: Date;
        if (dateValue instanceof Date) {
          date = dateValue;
        } else if (typeof dateValue === 'number') {
          // Excel serial date
          date = new Date((dateValue - 25569) * 86400 * 1000);
        } else if (typeof dateValue === 'string') {
          date = new Date(dateValue);
        } else {
          continue;
        }

        if (isNaN(date.getTime())) continue;

        // Extract reference from verse text (usually in parentheses at the end)
        const verseMatch = verseText.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
        const verse = verseMatch ? verseMatch[1].trim() : verseText;
        const reference = verseMatch ? verseMatch[2].trim() : '';

        verses.push({
          id: id++,
          date: date.toISOString().split('T')[0],
          verse,
          reference,
          ageGroup,
          additionalInfo: additionalInfo || null,
        });

        // If additional info looks like an event, create an event
        if (additionalInfo && typeof additionalInfo === 'string') {
          const eventPattern = /(발표회|대회|행사|예배|모임)/;
          if (eventPattern.test(additionalInfo)) {
            events.push({
              id: eventId++,
              date: date.toISOString().split('T')[0],
              title: additionalInfo,
              description: `${ageGroup} 관련 행사`,
              ageGroup,
            });
          }
        }
      }
    });

    return { verses, events };
  }

  static async loadSampleData(): Promise<ParsedExcelData> {
    // Create sample data for demonstration
    const now = new Date();
    const verses: Verse[] = [];
    const events: Event[] = [];
    let id = 1;
    let eventId = 1;

    const ageGroups: AgeGroup[] = ['kindergarten', 'elementary', 'youth'];
    const sampleVerses = [
      { verse: "너희는 먼저 그의 나라와 그의 의를 구하라 그리하면 이 모든 것을 너희에게 더하시리라", reference: "마태복음 6:33" },
      { verse: "내가 너희에게 평안을 끼치노니 곧 나의 평안을 너희에게 주노라", reference: "요한복음 14:27" },
      { verse: "수고하고 무거운 짐 진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라", reference: "마태복음 11:28" },
      { verse: "여호와는 나의 목자시니 내게 부족함이 없으리로다", reference: "시편 23:1" },
      { verse: "하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니", reference: "요한복음 3:16" },
    ];

    // Generate verses for the past few weeks and next few weeks
    for (let weekOffset = -3; weekOffset <= 3; weekOffset++) {
      const baseDate = new Date(now);
      baseDate.setDate(baseDate.getDate() + (weekOffset * 7));
      
      // Set to Sunday
      const sunday = new Date(baseDate);
      sunday.setDate(baseDate.getDate() - baseDate.getDay());

      ageGroups.forEach((ageGroup) => {
        const verseIndex = Math.abs(weekOffset + ageGroups.indexOf(ageGroup)) % sampleVerses.length;
        const sample = sampleVerses[verseIndex];
        
        verses.push({
          id: id++,
          date: sunday.toISOString().split('T')[0],
          verse: sample.verse,
          reference: sample.reference,
          ageGroup,
          additionalInfo: null,
        });
      });
    }

    // Add some sample events
    const sampleEvents = [
      { title: "주일 암송 발표회", description: "매월 첫째 주일 암송 발표" },
      { title: "새학기 암송대회", description: "학기별 암송 대회" },
    ];

    sampleEvents.forEach((eventData, index) => {
      const eventDate = new Date(now);
      eventDate.setDate(eventDate.getDate() + (index * 7));
      
      events.push({
        id: eventId++,
        date: eventDate.toISOString().split('T')[0],
        title: eventData.title,
        description: eventData.description,
        ageGroup: null,
      });
    });

    // Save to local storage
    LocalStorage.saveVerses(verses);
    LocalStorage.saveEvents(events);

    return { verses, events };
  }
}
