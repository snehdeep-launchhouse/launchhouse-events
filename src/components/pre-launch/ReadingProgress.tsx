import { useEffect, useRef, useState } from "react";

/**
 * Thin scroll-progress indicator pinned directly below the Navbar.
 * Passive scroll listener + rAF throttle. Respects reduced-motion.
 */
export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mq.matches;
    const onMqChange = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    mq.addEventListener?.("change", onMqChange);

    const compute = () => {
      rafRef.current = null;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
      setProgress(pct);
    };

    const onScroll = () => {
      if (rafRef.current != null) return;
      rafRef.current = window.requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      mq.removeEventListener?.("change", onMqChange);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="print:hidden fixed left-0 right-0 z-30 h-0.5 bg-transparent pointer-events-none"
      style={{ top: "var(--nav-height)" }}
    >
      <div
        className={
          "h-full bg-primary/70 " +
          (reducedMotionRef.current ? "" : "transition-[width] duration-150 ease-out")
        }
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
