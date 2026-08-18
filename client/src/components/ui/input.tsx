import * as React from "react"
import { Capacitor } from "@capacitor/core"

import { cn } from "@/lib/utils"

const IS_ANDROID = Capacitor.getPlatform() === 'android';

/**
 * 한글 IME 호환 Input
 * - Android WebView: controlled value가 한글 조합을 방해하므로 uncontrolled(defaultValue+onInput)
 * - iOS WKWebView / Web: 일반 controlled (value + onChange). iOS는 IME compositionend 이후
 *   onChange가 정상 트리거되며, controlled가 아닌 경우 검색 입력이 동기화되지 않음
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, value, onChange, onInput, ...props }, ref) => {
    const baseClass = cn(
      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
      className
    );

    // Android 외 플랫폼: 표준 controlled input
    if (!IS_ANDROID) {
      return (
        <input
          type={type}
          className={baseClass}
          ref={ref}
          value={value !== undefined && value !== null ? String(value) : ''}
          onChange={onChange}
          onInput={onInput}
          {...props}
        />
      );
    }

    // Android: uncontrolled + 수동 동기화 (한글 IME 워크어라운드)
    return <AndroidImeInput
      className={baseClass}
      type={type}
      value={value}
      onChange={onChange}
      onInput={onInput}
      forwardedRef={ref}
      {...props}
    />;
  }
)
Input.displayName = "Input"

interface AndroidImeInputProps extends Omit<React.ComponentProps<"input">, 'ref'> {
  forwardedRef: React.ForwardedRef<HTMLInputElement>;
}

function AndroidImeInput({ className, type, value, onChange, onInput, forwardedRef, ...props }: AndroidImeInputProps) {
  const innerRef = React.useRef<HTMLInputElement | null>(null);

  const setRef = React.useCallback(
    (node: HTMLInputElement | null) => {
      innerRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      else if (forwardedRef) (forwardedRef as any).current = node;
    },
    [forwardedRef]
  );

  React.useEffect(() => {
    const el = innerRef.current;
    if (el && value !== undefined) {
      const strValue = String(value);
      if (strValue === '' || document.activeElement !== el) {
        el.value = strValue;
      }
    }
  }, [value]);

  return (
    <input
      type={type}
      className={className}
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
  );
}

export { Input }
