// Build-time seed generator: converts attached Excel to a single seed.json for iOS/web runtime
// - Reads attached_assets/church_verses.xlsx and calendar_events.xlsx
// - Produces client/public/seed.json with { verses, monthlyVerses, events }

/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

function safeReadWorkbook(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  파일 없음: ${filePath}`);
    return null;
  }
  try {
    const wb = XLSX.read(fs.readFileSync(filePath));
    return wb;
  } catch (e) {
    console.warn(`⚠️  엑셀 읽기 실패: ${filePath}`, e);
    return null;
  }
}

function parseVersesWorkbook(wb) {
  const verses = [];
  const monthlyVerses = [];
  if (!wb) return { verses, monthlyVerses };

  const sheetNames = wb.SheetNames || [];
  // 1) 주간 암송 구절 시트 찾기
  const verseSheetName = sheetNames.find((n) => /verse|암송|주간/i.test(n)) || sheetNames[0];
  if (verseSheetName) {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[verseSheetName], { defval: '' });
    for (const row of rows) {
      const group = String(row.group || row.부서 || row.그룹 || '').trim();
      const week = String(row.week || row.주차 || '').trim();
      const lesson = String(row.lesson || row.공과명 || '').trim();
      const reference = String(row.reference || row.성구 || '').trim();
      const content = String(row.content || row.말씀 || '').trim();
      if (group && week && (reference || content)) {
        verses.push({ group, week, lesson, reference, content });
      }
    }
  }

  // 2) 월암송 시트 찾기
  const monthlySheetName = sheetNames.find((n) => /month|월암송|월간/i.test(n));
  if (monthlySheetName) {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[monthlySheetName], { defval: '' });
    let autoId = 1;
    for (const row of rows) {
      let year = Number(row.year || row.년도 || row.연도) || undefined;
      const monthVal = Number(row.month || row.월) || undefined;
      // YYYY.M 형태 지원
      const ym = String(row['yyyy.m'] || row['YYYY.M'] || row['연월'] || '').trim();
      if (!year && ym) {
        const m = ym.match(/(\d{4})\.(\d{1,2})/);
        if (m) {
          year = Number(m[1]);
        }
      }
      const reference = String(row.reference || row.성구 || '').trim();
      const content = String(row.content || row.말씀 || '').trim();
      if (monthVal && reference) {
        monthlyVerses.push({ id: autoId++, year: year || new Date().getFullYear(), month: monthVal, reference, content });
      }
    }
  }

  return { verses, monthlyVerses };
}

function parseCalendarWorkbook(wb) {
  const events = [];
  if (!wb) return events;
  const sheetNames = wb.SheetNames || [];
  const calSheet = sheetNames.find((n) => /calendar|event|일정|캘린더/i.test(n)) || sheetNames[0];
  if (!calSheet) return events;
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[calSheet], { defval: '' });
  let autoId = 1;
  for (const row of rows) {
    const date = String(row.date || row.날짜 || '').trim();
    const title = String(row.title || row.제목 || '').trim();
    const description = String(row.description || row.설명 || '').trim();
    const start_date = String(row.start_date || row.시작 || row.시작일 || '').trim();
    const end_date = String(row.end_date || row.끝 || row.종료일 || '').trim();
    if (!date && !start_date && !end_date) continue;
    if (!title) continue;
    events.push({ id: autoId++, date, title, description, ageGroup: null, startDate: start_date || null, endDate: end_date || null });
  }
  // 현재 날짜 기준으로 과거 이벤트 제거
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const filtered = events.filter((ev) => {
    const check = (ev.endDate && ev.endDate.trim()) ? ev.endDate : ev.date;
    return check >= todayStr;
  });
  return filtered;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function main() {
  const root = process.cwd();
  const attachedDir = path.join(root, 'attached_assets');
  const publicDir = path.join(root, 'client', 'public');
  ensureDir(publicDir);

  const versesPath = path.join(attachedDir, 'church_verses.xlsx');
  const calendarPath = path.join(attachedDir, 'calendar_events.xlsx');

  const versesWb = safeReadWorkbook(versesPath);
  const calendarWb = safeReadWorkbook(calendarPath);

  const { verses, monthlyVerses } = parseVersesWorkbook(versesWb);
  const events = parseCalendarWorkbook(calendarWb);

  const seedVersion = new Date().toISOString();
  const seed = { seedVersion, verses, monthlyVerses, events };
  const outPath = path.join(publicDir, 'seed.json');
  fs.writeFileSync(outPath, JSON.stringify(seed, null, 2), 'utf-8');
  console.log(`✅ seed.json 생성 완료: ${outPath}`);
  console.log(`  - seedVersion: ${seedVersion}`);
  console.log(`  - verses: ${verses.length}, monthlyVerses: ${monthlyVerses.length}, events: ${events.length}`);
}

main();


