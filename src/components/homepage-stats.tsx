"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Stats = { stories: number; members: number };

/** Count-up number that animates from 0 → value once `run` is true. */
function CountUp({ value, run }: { value: number; run: boolean }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!run) return;
    const duration = 1200;
    let raf = 0;
    let start: number | null = null;
    const tick = (ts: number) => {
      if (start === null) start = ts;
      const progress = Math.min(1, (ts - start) / duration);
      // easeOutCubic for a lively finish
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, value]);

  return <>{display.toLocaleString("is-IS")}</>;
}

function StatCard({
  icon,
  value,
  label,
  run,
}: {
  icon: string;
  value: number;
  label: string;
  run: boolean;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-600/20 to-blue-500/5 p-8 text-center">
      <span className="text-4xl" aria-hidden="true">
        {icon}
      </span>
      <span className="mt-3 text-5xl font-extrabold tracking-tight text-blue-300 tabular-nums">
        <CountUp value={value} run={run} />
      </span>
      <span className="mt-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

export function HomepageStats({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [stats, setStats] = useState<Stats>({ stories: 0, members: 0 });
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // Fetch real counts once.
  useEffect(() => {
    let active = true;
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d: Stats) => {
        if (active) setStats(d);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Trigger the count-up when the section scrolls into view.
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

  const primaryHref = isLoggedIn ? "/samfelag" : "/skra";

  return (
    <section className="relative py-16">
      <div className="container">
        <div
          ref={ref}
          className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-b from-blue-950/30 to-transparent p-8 sm:p-12"
        >
          {/* soft blue glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl"
          />

          <div className="relative">
            <div className="mx-auto grid max-w-2xl gap-6 sm:grid-cols-2">
              <StatCard
                icon="📝"
                value={stats.stories}
                label="Sögur deildar"
                run={visible}
              />
              <StatCard
                icon="👥"
                value={stats.members}
                label="Meðlimir"
                run={visible}
              />
            </div>

            <div className="mx-auto mt-12 max-w-2xl text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Þú ert ekki einn — og rödd þín skiptir máli
              </h2>
              <p className="mt-3 text-base text-muted-foreground">
                Deildu sögu þinni nafnlaust og hjálpaðu öðrum sem eiga í sama
                stað. Hér er öruggt, nafnlaust og ókeypis.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href={primaryHref}
                  className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-blue-500 sm:w-auto"
                >
                  Segðu þína sögu
                </Link>
                <Link
                  href="/samfelag"
                  className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-blue-500/40 px-6 text-sm font-semibold text-blue-300 transition-colors hover:bg-blue-500/10 sm:w-auto"
                >
                  Skoða sögur
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
