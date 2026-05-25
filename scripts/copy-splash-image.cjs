const fs = require('fs');
const path = require('path');

function copySplashImage() {
  try {
    console.log('🖼️  스플래시 이미지 복사 시작...');
    
    // 스플래시 이미지 파일 찾기
    const possibleFiles = [
      'attached_assets/splash-image.png',
      'attached_assets/splash-image.jpg',
      'attached_assets/splash.png',
      'attached_assets/splash.jpg',
      'attached_assets/loading.png',
      'attached_assets/loading.jpg'
    ];
    
    let sourceFile = null;
    for (const filePath of possibleFiles) {
      if (fs.existsSync(filePath)) {
        sourceFile = filePath;
        console.log('📁 스플래시 이미지 발견:', filePath);
        break;
      }
    }
    
    if (!sourceFile) {
      console.log('⚠️  스플래시 이미지를 찾을 수 없습니다.');
      console.log('📂 attached_assets 폴더에 다음 이름으로 넣어주세요:');
      console.log('   - splash-image.png (추천)');
      console.log('   - splash-image.jpg');
      console.log('   - splash.png');
      console.log('   - splash.jpg');
      return false;
    }
    
    // 파일 확장자 확인
    const ext = path.extname(sourceFile);
    const targetFileName = `splash-image${ext}`;
    const targetPath = path.join('client/public', targetFileName);
    
    // client/public 디렉토리 확인/생성
    const publicDir = 'client/public';
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
      console.log('📁 public 디렉토리 생성');
    }
    
    // 파일 복사
    fs.copyFileSync(sourceFile, targetPath);
    console.log(`✅ 복사 완료: ${sourceFile} → ${targetPath}`);
    
    // 파일 크기 확인
    const stats = fs.statSync(targetPath);
    const fileSizeKB = Math.round(stats.size / 1024);
    console.log(`📏 파일 크기: ${fileSizeKB}KB`);
    
    if (fileSizeKB > 500) {
      console.log('⚠️  파일 크기가 500KB를 초과합니다. 압축을 권장합니다.');
    }
    
    // PNG와 JPG 모두 복사 (우선순위를 위해)
    if (ext === '.png') {
      // PNG가 있으면 JPG 버전도 확인
      const jpgSource = sourceFile.replace('.png', '.jpg');
      if (fs.existsSync(jpgSource)) {
        const jpgTarget = path.join('client/public', 'splash-image.jpg');
        fs.copyFileSync(jpgSource, jpgTarget);
        console.log(`✅ JPG 버전도 복사: ${jpgSource} → ${jpgTarget}`);
      }
    }
    
    console.log('🎉 스플래시 이미지 설정 완료!');
    return true;
    
  } catch (error) {
    console.error('❌ 스플래시 이미지 복사 실패:', error);
    return false;
  }
}

// 스크립트 실행
if (require.main === module) {
  copySplashImage();
}

module.exports = { copySplashImage }; 