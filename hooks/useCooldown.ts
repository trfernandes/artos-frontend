import { useCallback, useEffect, useRef, useState } from 'react';

export function useCooldown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(0);
  const timer = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (seconds > 0) {
      timer.current = setTimeout(() => setSeconds((s) => s - 1), 1000);
    } else if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
    };
  }, [seconds]);

  return { seconds, start, isActive: seconds > 0 };
}
