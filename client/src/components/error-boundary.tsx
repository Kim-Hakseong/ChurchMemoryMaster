import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * 최상위 에러 바운더리.
 * - WebView 렌더러 크래시 직후 fall-through로 이상한 fallback 화면이 뜨는 것 방지
 * - 에러 발생 시 사용자에게 명확한 메시지 + 재시도 버튼 + 캐시/스토리지 비우기 옵션
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: unknown) {
    // 콘솔/리모트 로깅 (네이티브 logcat에서도 보이도록)
    console.error("[ErrorBoundary]", error, info);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  private handleHardReset = async () => {
    try {
      // 1) localStorage / sessionStorage 비우기
      try { localStorage.clear(); } catch {}
      try { sessionStorage.clear(); } catch {}

      // 2) Service Worker 모두 unregister
      if ("serviceWorker" in navigator) {
        try {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.allSettled(regs.map((r) => r.unregister()));
        } catch {}
      }

      // 3) Cache API 비우기
      if (typeof caches !== "undefined") {
        try {
          const keys = await caches.keys();
          await Promise.allSettled(keys.map((k) => caches.delete(k)));
        } catch {}
      }
    } finally {
      // 4) 페이지 새로 로드
      window.location.replace("/");
    }
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px",
          gap: "16px",
          background: "var(--page-bg, #FAFAF7)",
          color: "var(--ink, #0E0E0C)",
          fontFamily: "'Noto Sans KR', sans-serif",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "20px", fontWeight: 700 }}>
          앱에 일시적인 오류가 발생했습니다
        </div>
        <div style={{ fontSize: "14px", color: "var(--ink-muted, #7A7873)", maxWidth: 320 }}>
          잠시 후 다시 시도해 주세요. 문제가 계속되면 데이터 초기화를 눌러주세요.
        </div>
        <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
          <button
            onClick={this.handleRetry}
            style={{
              padding: "12px 18px",
              borderRadius: "12px",
              background: "var(--ink, #0E0E0C)",
              color: "var(--surface, #FFFFFF)",
              fontWeight: 600,
              border: "none",
              fontSize: "14px",
            }}
          >
            다시 시도
          </button>
          <button
            onClick={this.handleHardReset}
            style={{
              padding: "12px 18px",
              borderRadius: "12px",
              background: "var(--surface-muted, #F5F2EC)",
              color: "var(--ink-soft, #3A3A36)",
              fontWeight: 600,
              border: "1px solid var(--border-soft, rgba(0,0,0,0.06))",
              fontSize: "14px",
            }}
          >
            데이터 초기화
          </button>
        </div>
        {this.state.error && (
          <details style={{ marginTop: "16px", fontSize: "11px", color: "var(--ink-faint, #B5B2AA)", maxWidth: 320 }}>
            <summary style={{ cursor: "pointer" }}>상세</summary>
            <pre style={{ whiteSpace: "pre-wrap", textAlign: "left", marginTop: 8 }}>
              {this.state.error.message}
            </pre>
          </details>
        )}
      </div>
    );
  }
}
