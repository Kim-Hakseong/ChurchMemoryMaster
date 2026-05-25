const fs = require('fs');
const path = require('path');

console.log('📁 attached_assets 폴더의 엑셀 파일을 public 폴더로 복사 중...');

const attachedAssetsDir = path.join(__dirname, '..', 'attached_assets');
const publicDir = path.join(__dirname, '..', 'client', 'public');

// public 폴더가 없으면 생성
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  console.log('✅ public 폴더 생성됨');
}

// attached_assets 폴더 확인
if (!fs.existsSync(attachedAssetsDir)) {
  console.error('❌ attached_assets 폴더를 찾을 수 없습니다.');
  process.exit(1);
}

// 엑셀 파일들 복사
const excelFiles = [
  'church_verses.xlsx',
  'calendar_events.xlsx'
];

let copiedCount = 0;

excelFiles.forEach(fileName => {
  const sourcePath = path.join(attachedAssetsDir, fileName);
  const destPath = path.join(publicDir, fileName);
  
  if (fs.existsSync(sourcePath)) {
    try {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`✅ ${fileName} 복사 완료`);
      copiedCount++;
    } catch (error) {
      console.error(`❌ ${fileName} 복사 실패:`, error.message);
    }
  } else {
    console.log(`⚠️ ${fileName} 파일이 attached_assets 폴더에 없습니다.`);
  }
});

console.log(`\n📊 복사 완료: ${copiedCount}/${excelFiles.length} 파일`);
console.log('🎯 이제 앱에서 attached_assets 폴더의 엑셀 파일을 사용할 수 있습니다!'); 