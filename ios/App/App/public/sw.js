// =====================================================================
// SERVICE WORKER KILL SWITCH
// =====================================================================
// 옛 SW가 캐시한 v1 자산을 강제로 비우고 자기 자신도 unregister.
// Android WebView/PWA 양쪽에서 안전하게 동작.
//
// 동작 순서:
//   install   → skipWaiting()으로 즉시 활성화
//   activate  → 모든 cache 삭제 + clients.claim() 후 자기 자신 unregister
//   fetch     → 절대 캐시 응답하지 않음 (옛 캐시 영향 차단)
// =====================================================================

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // 1) 모든 캐시 비우기
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    } catch (e) { /* noop */ }

    // 2) 모든 클라이언트 즉시 take control
    try { await self.clients.claim(); } catch (e) { /* noop */ }

    // 3) 자기 자신 unregister
    try { await self.registration.unregister(); } catch (e) { /* noop */ }
  })());
});

// fetch 이벤트는 무조건 네트워크 직행. 캐시 사용 X.
self.addEventListener('fetch', () => {
  // 명시적 respondWith 호출하지 않으면 브라우저 기본 동작 = 네트워크 직행
});
