import { useEffect, useRef, useState } from "react";

// Рахує від реального часу старту, тому не «плива», якщо інтервал пропустить тік
export function useStopwatch(active: boolean) {
  const startRef = useRef<number | null>(null);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!active) return;
    if (startRef.current === null) startRef.current = Date.now();

    const tick = () =>
      setSeconds(Math.floor((Date.now() - (startRef.current as number)) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [active]);

  return seconds;
}

export function formatDuration(total: number) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}