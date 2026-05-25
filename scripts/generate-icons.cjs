const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 아이콘 크기 정의
const iconSizes = {
  // Android mipmap 아이콘들
  android: [
    { size: 48, density: 'mdpi' },
    { size: 72, density: 'hdpi' },
    { size: 96, density: 'xhdpi' },
    { size: 144, density: 'xxhdpi' },
    { size: 192, density: 'xxxhdpi' }
  ],
  // PWA 아이콘들
  pwa: [
    { size: 192, name: 'icon-192.png' },
    { size: 512, name: 'icon-512.png' }
  ],
  // 추가 크기들
  extra: [
    { size: 16, name: 'favicon-16x16.png' },
    { size: 32, name: 'favicon-32x32.png' },
    { size: 180, name: 'apple-touch-icon.png' }
  ]
};

async function generateIcons() {
  try {
    // 로고 파일 찾기
    const logoPath = findLogoFile();
    if (!logoPath) {
      console.error('❌ 로고 파일을 찾을 수 없습니다.');
      console.log('📂 attached_assets 폴더에 다음 이름으로 넣어주세요:');
      console.log('   - logo.png');
      console.log('   - app-icon.png');
      console.log('   - church-logo.png');
      return;
    }

    console.log('🎨 로고 파일 발견:', logoPath);
    console.log('📱 아이콘 생성 시작...');

    // 원본 이미지 정보 확인
    const image = sharp(logoPath);
    const metadata = await image.metadata();
    console.log(`📏 원본 크기: ${metadata.width}x${metadata.height}`);

    // Android 아이콘 생성
    console.log('🤖 Android 아이콘 생성 중...');
    for (const icon of iconSizes.android) {
      await generateAndroidIcon(logoPath, icon);
    }

    // PWA 아이콘 생성
    console.log('🌐 PWA 아이콘 생성 중...');
    for (const icon of iconSizes.pwa) {
      await generatePWAIcon(logoPath, icon);
    }

    // 추가 아이콘 생성
    console.log('➕ 추가 아이콘 생성 중...');
    for (const icon of iconSizes.extra) {
      await generateExtraIcon(logoPath, icon);
    }

    console.log('✅ 모든 아이콘 생성 완료!');
    console.log('🔄 다음 단계: npx cap sync ios && npx cap sync android 실행하세요.');

  } catch (error) {
    console.error('❌ 아이콘 생성 실패:', error);
  }
}

function findLogoFile() {
  const possiblePaths = [
    'attached_assets/logo.png',
    'attached_assets/app-icon.png',
    'attached_assets/church-logo.png',
    'client/public/logo.png',
    'client/public/app-icon.png',
    'client/public/church-logo.png'
  ];

  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }
  return null;
}

async function generateAndroidIcon(logoPath, iconConfig) {
  const { size, density } = iconConfig;
  const outputDir = `android/app/src/main/res/mipmap-${density}`;
  
  // 디렉토리 생성
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 일반 아이콘 (75% 크기로 적절한 패딩 확보)
  const normalIconSize = Math.round(size * 0.75); // 75% 크기로 여백 확보
  await sharp(logoPath)
    .resize(normalIconSize, normalIconSize, { 
      fit: 'contain', 
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .extend({
      top: Math.round((size - normalIconSize) / 2),
      bottom: Math.round((size - normalIconSize) / 2),
      left: Math.round((size - normalIconSize) / 2),
      right: Math.round((size - normalIconSize) / 2),
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .png()
    .toFile(path.join(outputDir, 'ic_launcher.png'));

  // 라운드 아이콘 (70% 크기로 더 보수적인 여백)
  const roundIconSize = Math.round(size * 0.70); // 70% 크기로 안전 여백
  await sharp(logoPath)
    .resize(roundIconSize, roundIconSize, { 
      fit: 'contain', 
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .extend({
      top: Math.round((size - roundIconSize) / 2),
      bottom: Math.round((size - roundIconSize) / 2),
      left: Math.round((size - roundIconSize) / 2),
      right: Math.round((size - roundIconSize) / 2),
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .png()
    .toFile(path.join(outputDir, 'ic_launcher_round.png'));

  // 포그라운드 아이콘 (Adaptive Icon용 - 66% 크기)
  const foregroundIconSize = Math.round(size * 0.66); // 66% 크기 (Android 권장)
  await sharp(logoPath)
    .resize(foregroundIconSize, foregroundIconSize, { 
      fit: 'contain', 
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .extend({
      top: Math.round((size - foregroundIconSize) / 2),
      bottom: Math.round((size - foregroundIconSize) / 2),
      left: Math.round((size - foregroundIconSize) / 2),
      right: Math.round((size - foregroundIconSize) / 2),
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .png()
    .toFile(path.join(outputDir, 'ic_launcher_foreground.png'));

  console.log(`   ✅ ${density} (${size}x${size}) - 일반:${normalIconSize}px, 라운드:${roundIconSize}px, 포그라운드:${foregroundIconSize}px`);
}

async function generatePWAIcon(logoPath, iconConfig) {
  const { size, name } = iconConfig;
  const outputPath = path.join('client/public', name);

  // PWA 아이콘도 80% 크기로 여백 확보
  const iconSize = Math.round(size * 0.80);
  await sharp(logoPath)
    .resize(iconSize, iconSize, { 
      fit: 'contain', 
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .extend({
      top: Math.round((size - iconSize) / 2),
      bottom: Math.round((size - iconSize) / 2),
      left: Math.round((size - iconSize) / 2),
      right: Math.round((size - iconSize) / 2),
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .png()
    .toFile(outputPath);

  console.log(`   ✅ ${name} (${size}x${size} → ${iconSize}px)`);
}

async function generateExtraIcon(logoPath, iconConfig) {
  const { size, name } = iconConfig;
  const outputPath = path.join('client/public', name);

  // 작은 아이콘들은 85% 크기로 적당한 여백
  const iconSize = Math.round(size * 0.85);
  await sharp(logoPath)
    .resize(iconSize, iconSize, { 
      fit: 'contain', 
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .extend({
      top: Math.round((size - iconSize) / 2),
      bottom: Math.round((size - iconSize) / 2),
      left: Math.round((size - iconSize) / 2),
      right: Math.round((size - iconSize) / 2),
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .png()
    .toFile(outputPath);

  console.log(`   ✅ ${name} (${size}x${size} → ${iconSize}px)`);
}

// 스크립트 실행
if (require.main === module) {
  generateIcons();
}

module.exports = { generateIcons }; 