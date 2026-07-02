"use client";

import { useEffect, useRef, useState } from "react";

import { FONT_SIZES } from "@/lib/blocks";

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

export interface CounterConfig {
  label?: string;
  fontSize?: string;
  numberColor?: string;
  labelColor?: string;
  ctaText?: string;
  ctaUrl?: string;
  cta2Text?: string;
  cta2Url?: string;
  align?: "left" | "center" | "right";
}

/**
 * Configurable story counter used by the `counter` block. Fetches the approved
 * story count from /api/stats and animates it into view. Falls back to sensible
 * defaults so it also renders acceptably as a static preview in the editor.
 */
export function ConfiguredCounter({
  config,
  live = true,
}: {
  config: CounterConfig;
  live?: boolean;
}) {
  const [stories, setStories] = useState(0);
  const [visible, setVisible] = useState(!live);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!live) return;
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
  }, [live]);

  useEffect(() => {
    if (!live) return;
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
  }, [live]);

  const size = FONT_SIZES[config.fontSize ?? "3xl"] ?? config.fontSize ?? "2.75rem";
  const align = config.align ?? "center";
  const alignClass =
    align === "center"
      ? "items-center text-center"
      : align === "right"
        ? "items-end text-right"
        : "items-start text-left";

  return (
    <div ref={ref} className={`flex flex-col gap-3 ${alignClass}`}>
      <div className="flex flex-col gap-1">
        <span
          className="font-bold tabular-nums leading-none"
          style={{ fontSize: size, color: config.numberColor || "hsl(38, 92%, 50%)" }}
        >
          <CountUp value={live ? stories : 128} run={visible} />
        </span>
        <span
          className="text-sm"
          style={{ color: config.labelColor || "hsl(220, 9%, 60%)" }}
        >
          {config.label || "sögur deildar"}
        </span>
      </div>
      {(config.ctaText || config.cta2Text) && (
        <div className="flex flex-wrap gap-3">
          {config.ctaText && (
            <a
              href={config.ctaUrl || "#"}
              className="inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              {config.ctaText}
            </a>
          )}
          {config.cta2Text && (
            <a
              href={config.cta2Url || "#"}
              className="inline-flex items-center rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              {config.cta2Text}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
