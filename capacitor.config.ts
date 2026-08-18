import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.church.memory.app',
  appName: '교회학교 암송 수첩',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    cleartext: true,
    hostname: 'localhost',
    iosScheme: 'https'
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    appendUserAgent: 'ChurchMemoryApp/1.0'
  }
  // iOS Widget Extension과의 데이터 공유는 AppDelegate.swift의 syncWidgetData()가 담당.
  // (@capacitor/preferences의 group 옵션은 App Group이 아니라 단순 키 prefix용이라 위젯이 못 읽음)
};

export default config;
