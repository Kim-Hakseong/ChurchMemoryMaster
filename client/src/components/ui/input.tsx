import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * 한글 IME 호환 Input
 * - React의 controlled input(value prop)이 Android WebView에서 한글 조합을 방해하는 문제 해결
 * - 내부적으로 uncontrolled(defaultValue + onInput)로 동작
 * - value prop 변경은 useEffect로 수동 동기화 (입력 중이 아닐 때만)
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, value, onChange, onInput, ...props }, ref) => {
    const innerRef = React.useRef<HTMLInputElement | null>(null);

    const setRef = React.useCallback(
      (node: HTMLInputElement | null) => {
        innerRef.current = node;
        if (typeof ref === 'function') ref(node);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        else if (ref) (ref as any).current = node;
      },
      [ref]
    );

    // 프로그래밍 방식 값 변경 동기화 (검색 초기화 등)
    React.useEffect(() => {
      const el = innerRef.current;
      if (el && value !== undefined) {
        const strValue = String(value);
        // 빈 값(초기화)은 항상 동기화, 그 외는 포커스 없을 때만
        if (strValue === '' || document.activeElement !== el) {
          el.value = strValue;
        }
      }
    }, [value]);

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={setRef}
        defaultValue={value !== undefined && value !== null ? String(value) : undefined}
        onInput={(e) => {
          if (onChange) {
            onChange(e as unknown as React.ChangeEvent<HTMLInputElement>);
          }
          onInput?.(e);
        }}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
