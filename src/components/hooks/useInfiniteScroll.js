import { useEffect, useRef } from "react";
export default function useInfiniteScroll({ onIntersect, triggerOnce = false }) {
  const ref = useRef();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onIntersect();
          if (triggerOnce) io.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [onIntersect, triggerOnce]);
  return { lastProductRef: ref };
}