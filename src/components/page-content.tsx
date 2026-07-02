"use client";

import { useEffect, useRef } from "react";
import { createRoot, type Root } from "react-dom/client";

import { StoryCounter } from "@/components/story-counter";
import { COUNTER_MOUNT_CLASS } from "@/lib/shortcodes";

/**
 * Renders page HTML that has already had its [sogur-teljari] shortcodes turned
 * into empty `.sogur-teljari-mount` spans on the server (see injectCounterMounts).
 * On the client, a live StoryCounter is mounted into each span. The admin's
 * surrounding HTML is left exactly as authored.
 */
export function PageContent({
  html,
  className = "page-content",
}: {
  html: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    const mounts = Array.from(
      container.querySelectorAll<HTMLElement>(`.${COUNTER_MOUNT_CLASS}`),
    );
    const roots: Root[] = [];
    mounts.forEach((el) => {
      const root = createRoot(el);
      root.render(<StoryCounter />);
      roots.push(root);
    });
    return () => {
      // Defer unmount to avoid "unmount during render" warnings.
      setTimeout(() => roots.forEach((root) => root.unmount()), 0);
    };
  }, [html]);

  return (
    <div
      ref={ref}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
