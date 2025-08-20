const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

function findLogo() {
  const candidates = [
    'attached_assets/logo.png',
    'client/public/logo.png',
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function generate() {
  const logo = findLogo();
  if (!logo) {
    console.error('❌ iOS 아이콘 생성 실패: logo.png를 찾을 수 없습니다. attached_assets/logo.png를 준비하세요.');
    process.exit(0);
  }

  const iconsetDir = path.join('ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset');
  await ensureDir(iconsetDir);

  // iOS 아이콘 스펙 (필수 세트)
  const specs = [
    { size: 20, scales: [2,3] },
    { size: 29, scales: [2,3] },
    { size: 40, scales: [2,3] },
    { size: 60, scales: [2,3] },
    { size: 76, scales: [2] },
    { size: 83.5, scales: [2] },
  ];

  const images = [];
  for (const spec of specs) {
    for (const scale of spec.scales) {
      const pixel = Math.round(spec.size * scale);
      const filename = `appicon-${spec.size}x${spec.size}@${scale}x.png`;
      const outPath = path.join(iconsetDir, filename);
      await sharp(logo)
        .resize(pixel, pixel, { fit: 'contain', background: { r:255, g:255, b:255, alpha:0 } })
        .png()
        .toFile(outPath);
      images.push({ size: `${spec.size}x${spec.size}`, idiom: 'iphone', scale: `${scale}x`, filename });
    }
  }

  // App Store (marketing) 1024x1024
  const marketingName = 'appicon-1024.png';
  await sharp(logo).resize(1024, 1024, { fit: 'contain', background: { r:255, g:255, b:255, alpha:0 } }).png().toFile(path.join(iconsetDir, marketingName));
  images.push({ size: '1024x1024', idiom: 'ios-marketing', scale: '1x', filename: marketingName });

  const contents = {
    images,
    info: { version: 1, author: 'xcode' }
  };
  fs.writeFileSync(path.join(iconsetDir, 'Contents.json'), JSON.stringify(contents, null, 2));
  console.log('✅ iOS AppIcon.appiconset 생성 완료:', iconsetDir);
}

if (require.main === module) {
  generate().catch(err => { console.error('❌ iOS 아이콘 생성 에러:', err); process.exit(1); });
}

module.exports = { generate };

