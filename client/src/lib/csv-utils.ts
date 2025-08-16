import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
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


