import { useEffect, useRef } from "react";

export default function useRealtime(callback, interval = 5000) {
  const saved = useRef();

  useEffect(() => {
    saved.current = callback;
  }, [callback]);

  useEffect(() => {
    const tick = () => saved.current && saved.current();
    const id = setInterval(tick, interval);
    return () => clearInterval(id);
  }, [interval]);
}
