import { useEffect, useRef, useState } from "react";

function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRan = useRef<number>(Date.now());

  useEffect(() => {
    const timeSinceLastRun = Date.now() - lastRan.current;
    if (timeSinceLastRun >= limit) {
      // limit 이상 시간이 지났다면 즉시 업데이트
      setThrottledValue(value);
      lastRan.current = Date.now();
    } else {
      // 아직 limit 이하라면 남은 시간만큼 타이머를 걸어 업데이트
      const timeout = setTimeout(() => {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }, limit - timeSinceLastRun);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [value, limit]);

  return throttledValue;
}

export default useThrottle;
