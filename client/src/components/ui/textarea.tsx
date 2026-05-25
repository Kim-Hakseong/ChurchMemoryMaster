import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * 한글 IME 호환 Textarea
 * - React의 controlled textarea가 Android WebView에서 한글 조합을 방해하는 문제 해결
 * - 내부적으로 uncontrolled(defaultValue + onInput)로 동작
 */
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, value, onChange, onInput, ...props }, ref) => {
  const innerRef = React.useRef<HTMLTextAreaElement | null>(null);

  const setRef = React.useCallback(
    (node: HTMLTextAreaElement | null) => {
      innerRef.current = node;
      if (typeof ref === 'function') ref(node);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      else if (ref) (ref as any).current = node;
    },
    [ref]
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
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={setRef}
      defaultValue={value !== undefined && value !== null ? String(value) : undefined}
      onInput={(e) => {
        if (onChange) {
          onChange(e as unknown as React.ChangeEvent<HTMLTextAreaElement>);
        }
        onInput?.(e);
      }}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
