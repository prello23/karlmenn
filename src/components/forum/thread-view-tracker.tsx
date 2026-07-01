"use client";

import { useEffect } from "react";

/**
 * Fires a Google Analytics `view_thread` custom event once per thread view.
 * Rendered from the (server) thread page so each thread view is tracked
 * individually.
 */
export function ThreadViewTracker({
  threadId,
  title,
  category,
}: {
  threadId: string;
  title: string;
  category: string;
}) {
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.gtag !== "function") {
      return;
    }
    window.gtag("event", "view_thread", {
      thread_id: threadId,
      thread_title: title,
      category,
    });
  }, [threadId, title, category]);

  return null;
}
