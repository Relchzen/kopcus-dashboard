import { useRef, useEffect } from "react";

export function useHoldAction({
  onHold,
  holdDuration = 500,
}: {
  onHold: () => void;
  holdDuration?: number;
}) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasHeldRef = useRef(false);

  const start = () => {
    wasHeldRef.current = false;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      wasHeldRef.current = true;
      onHold();
    }, holdDuration);
  };

  const clear = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    // keep wasHeldRef.current value until click handler checks it
    // we don't reset it here because click handler should read it immediately
  };

  // safety cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const wasHeld = () => {
    const val = wasHeldRef.current;
    // reset after read so next click won't reuse it
    wasHeldRef.current = false;
    return val;
  };

  return {
    onMouseDown: start,
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchStart: start,
    onTouchEnd: clear,
    wasHeld,
  };
}
