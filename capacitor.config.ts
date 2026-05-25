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
};

export default config;
