import { useEffect, useRef, useState } from "react";

/**
 * 고정(fixed) 헤더의 실제 높이를 실측해서 돌려준다.
 *
 * 헤더 내부는 rem 기반(Tailwind h-12, mb-3 …)이라 iOS 의 폰트 배율(html.platform-ios → 20px)에
 * 따라 높이가 1.25배로 커진다. 반면 본문이 비워두는 상단 여백을 px 상수로 적어두면 그 차이만큼
 * 본문이 헤더 밑으로 파고든다. (verse-overview 기준 iOS 에서 42px 겹침 → 검색창 하단이 목록과
 * 겹쳐 탭이 어려웠음)
 *
 * 폰트 배율·safe-area·텍스트 줄바꿈이 바뀌어도 따라가도록 ResizeObserver 로 추적한다.
 * 헤더의 paddingTop 에 safe-area-inset-top 이 이미 포함되므로, 반환값에 safe-area 를 또 더하면 안 된다.
 */
export function useHeaderHeight<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null);
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => setHeight(el.getBoundingClientRect().height);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);

    // 폰트 로딩이 끝나면 헤더 높이가 한 번 더 바뀔 수 있음
    if (document.fonts?.ready) {
      document.fonts.ready.then(update).catch(() => {});
    }

    window.addEventListener("orientationchange", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return { ref, height };
}
