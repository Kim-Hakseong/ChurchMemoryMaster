import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import type { Event } from '@shared/schema';
import { LocalStorage } from './storage';

// CSV 헤더 정의
const CSV_HEADERS = ['date', 'title', 'description', 'category', 'time', 'location', 'start_date', 'end_date'];

function escapeCsvField(value: string): string {
  const needsQuotes = /[",\n]/.test(value);
  let field = value.replace(/"/g, '""');
  return needsQuotes ? `"${field}"` : field;
}

function eventsToCSV(events: Event[]): string {
  const rows = [CSV_HEADERS.join(',')];
  for (const e of events) {
    const row = [
      e.date || '',
      e.title || '',
      e.description || '',
      '', // 분류: description에 포함되어 있을 수 있으나, 원본 분리 정보 없음
      '', // 시간
      '', // 장소
      e.startDate || '',
      e.endDate || '',
    ].map(v => escapeCsvField(String(v)));
    rows.push(row.join(','));
  }
  return rows.join('\n');
}

// 간단 ICS(캘린더) 포맷으로 내보내기 – iOS 호환성 개선
function eventsToICS(events: Event[]): string {
  const lines: string[] = [];
  lines.push('BEGIN:VCALENDAR');
  lines.push('VERSION:2.0');
  lines.push('PRODID:-//ChurchMemoryMaster//Korean//');
  for (const e of events) {
    const uid = `${e.id}@churchmemorymaster`;
    const dtstamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const start = (e.startDate || e.date);
    const end = (e.endDate || e.date);
    // 종일 이벤트로 정의 (TZID 없이 DATE 형식)
    const fmt = (s: string) => s.replace(/-/g, '');
    const dtStart = fmt(start);
    const dtEnd = fmt(end);

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${dtstamp}`);
    lines.push(`DTSTART;VALUE=DATE:${dtStart}`);
    // 종료일은 다음날로 지정해야 종일 범위가 포함됨 (RFC에 따라)
    const endDate = new Date((end || start) + 'T00:00:00Z');
    endDate.setUTCDate(endDate.getUTCDate() + 1);
    const endStr = endDate.toISOString().slice(0,10).replace(/-/g, '');
    lines.push(`DTEND;VALUE=DATE:${endStr}`);
    lines.push(`SUMMARY:${(e.title || '').replace(/\n/g, ' ')}`);
    if (e.description) {
      lines.push(`DESCRIPTION:${e.description.replace(/\n/g, ' ')}`);
    }
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function parseCSV(text: string): string[][] {
  // 간단 CSV 파서 (따옴표/개행 처리)
  const rows: string[][] = [];
  let field = '';
  let row: string[] = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') { field += '"'; i++; continue; }
      if (ch === '"') { inQuotes = false; continue; }
      field += ch;
      continue;
    }
    if (ch === '"') { inQuotes = true; continue; }
    if (ch === ',') { row.push(field); field = ''; continue; }
    if (ch === '\n') { row.push(field); rows.push(row); row = []; field=''; continue; }
    if (ch === '\r') { continue; }
    field += ch;
  }
  row.push(field);
  rows.push(row);
  return rows;
}

function csvRowsToEvents(rows: string[][]): Event[] {
  // 첫 행이 헤더이면 제거
  const header = rows[0]?.map(h => h.trim());
  let startIndex = 0;
  if (
    header && header.length >= 2 &&
    /(date|날짜)/i.test(header[0]) && /(title|제목)/i.test(header[1])
  ) {
    startIndex = 1;
  }
  const events: Event[] = [];
  for (let i = startIndex; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length < 2) continue;
    const date = (r[0] || '').trim();
    const title = (r[1] || '').trim();
    if (!date || !title) continue;
    const description = (r[2] || '').trim() || null;
    const startDate = (r[6] || '').trim() || null;
    const endDate = (r[7] || '').trim() || null;
    events.push({
      id: Date.now() + i,
      date,
      title,
      description,
      ageGroup: null,
      startDate,
      endDate,
    });
  }
  return events;
}

async function writeTextFilePreferDownloads(fileName: string, text: string): Promise<string> {
  const isNative = Capacitor.isNativePlatform();
  // Excel(특히 안드로이드)의 인코딩 감지를 위해 UTF-8 BOM + CRLF 강제
  const normalized = '\uFEFF' + text.replace(/\r?\n/g, '\r\n');
  if (!isNative) {
    // 웹: Blob 다운로드
    const blob = new Blob([normalized], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
    return fileName;
  }

  const tryWrite = async (directory: Directory | string, path: string) => {
    await Filesystem.writeFile({ path, data: normalized, directory: directory as any, encoding: Encoding.UTF8 });
    const uri = await Filesystem.getUri({ directory: directory as any, path });
    return uri.uri;
  };

  // iOS: Documents에 저장 후 공유 시트로 내보내기 (파일 앱/메일 등)
  try {
    if (Capacitor.getPlatform() === 'ios') {
      const uri = await tryWrite(Directory.Documents, fileName);
      try {
        await Share.share({
          title: '캘린더 CSV',
          text: 'iOS에서 CSV를 파일 앱이나 Numbers로 열 수 있습니다.',
          url: uri
        });
      } catch {}
      return uri;
    }
  } catch {}

  // 1) 공용 다운로드 영역 우선 (ExternalStorage/Download)
  try {
    const ExternalStorage: any = (Directory as any).ExternalStorage ?? 'EXTERNAL_STORAGE';
    const uri = await tryWrite(ExternalStorage, `Download/${fileName}`);
    return uri;
  } catch {}

  // 2) Documents
  try {
    const uri = await tryWrite(Directory.Documents, fileName);
    return uri;
  } catch {}

  // 3) External (앱 외부 저장)
  try {
    const uri = await tryWrite(Directory.External, fileName);
    return uri;
  } catch {}

  // 4) Cache (최후 수단)
  const uri = await tryWrite(Directory.Cache, fileName);
  return uri;
}

export async function downloadCSVTemplate(): Promise<string> {
  const sample: Event[] = [
    { id: 1, date: '2025-01-26', title: '주일예배', description: '정기 주일예배', ageGroup: null },
    { id: 2, date: '2025-02-01', title: '유치부 생일파티', description: '1월 생일자 축하', ageGroup: null },
    { id: 3, date: '2025-02-15', title: '교사회의', description: '월례 교사회의', ageGroup: null },
    { id: 4, date: '2025-03-10', title: '3차 하계수양회', description: '교회학교 여름 수양회', ageGroup: null, startDate: '2025-03-10', endDate: '2025-03-14' },
  ];
  const csv = eventsToCSV(sample);
  const fileName = `교회학교_캘린더_템플릿_${new Date().toISOString().slice(0,10)}.csv`;
  return await writeTextFilePreferDownloads(fileName, csv);
}

export async function exportEventsToCSV(): Promise<string> {
  const events = await LocalStorage.getEvents();
  // iOS: CSV 외에 ICS도 병행 생성하여 캘린더 앱으로 직접 연동 가능하게 함
  const csv = eventsToCSV(events);
  const fileName = `교회학교_캘린더_${new Date().toISOString().slice(0,10)}.csv`;
  return await writeTextFilePreferDownloads(fileName, csv);
}

export async function importEventsFromCSVFile(file: File): Promise<number> {
  const text = await file.text();
  const rows = parseCSV(text);
  const parsed = csvRowsToEvents(rows);
  if (parsed.length === 0) return 0;
  const existing = await LocalStorage.getEvents();
  const signature = (ev: Event) => `${(ev.date||'').trim()}|${(ev.title||'').trim()}|${(ev.startDate||'').trim()}|${(ev.endDate||'').trim()}|${(ev.description||'').trim()}`;
  const merged = new Map<string, Event>();
  for (const ev of existing) merged.set(signature(ev), ev);
  for (const ev of parsed) {
    const sig = signature(ev);
    if (!merged.has(sig)) merged.set(sig, ev);
  }
  await LocalStorage.saveEvents(Array.from(merged.values()));
  return parsed.length;
}


