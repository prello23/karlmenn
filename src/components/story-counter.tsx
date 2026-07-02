"use client";

import { useEffect, useRef, useState } from "react";

/** Count-up number that animates from 0 → value once `run` is true. */
function CountUp({ value, run }: { value: number; run: boolean }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!run) return;
    const duration = 1000;
    let raf = 0;
    let start: number | null = null;
    const tick = (ts: number) => {
      if (start === null) start = ts;
      const progress = Math.min(1, (ts - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setDisplay(Math.round(eased * value));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, value]);

  return <>{display.toLocaleString("is-IS")}</>;
}

/**
 * Compact, inline story counter rendered wherever the [sogur-teljari] shortcode
 * appears in editable page content. Shows ONLY the approved-stories count.
 * Fetches /api/stats and animates the number when scrolled into view.
 */
export function StoryCounter() {
  const [stories, setStories] = useState(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d: { stories?: number }) => {
        if (active) setStories(d.stories ?? 0);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <span
      ref={ref}
      className="sogur-teljari inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 align-middle text-sm leading-none"
    >
      <span aria-hidden="true">📝</span>
      <span className="text-lg font-bold tabular-nums text-blue-300">
        <CountUp value={stories} run={visible} />
      </span>
      <span className="text-muted-foreground">sögur deildar</span>
    </span>
  );
}
