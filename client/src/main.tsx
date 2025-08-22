import { createRoot } from "react-dom/client";
import { Capacitor } from '@capacitor/core';
import App from "./App";
import "./index.css";

// PWA Service Worker: 네이티브(Android/iOS)에서는 등록하지 않고, 기존 등록/캐시는 정리
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    if (Capacitor.isNativePlatform()) {
      // 네이티브: 기존 SW/캐시 제거 (흰 화면 방지)
      navigator.serviceWorker.getRegistrations()
        .then(regs => Promise.allSettled(regs.map(r => r.unregister())))
        .catch(() => {});
      // 캐시 비우기
      try {
        // 일부 WebView에선 caches가 없을 수 있음
        (caches as any)?.keys?.().then((keys: string[]) => {
          return Promise.allSettled(keys.map(k => (caches as any).delete(k)));
        }).catch(() => {});
      } catch {}
    } else {
      // 웹에서만 SW 등록
      navigator.serviceWorker.register('/sw.js')
        .then(() => {
          console.log('Service Worker registered successfully');
        })
        .catch(() => {
          console.log('Service Worker registration failed');
        });
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
