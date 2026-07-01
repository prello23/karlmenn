"use client";

import { useState, useTransition, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { updateThreadContent } from "@/app/admin/actions";

/**
 * Admin editor for a thread's public title/content. Calls the existing
 * `updateThreadContent` server action and shows an inline "Vistað ✅"
 * confirmation (fades in, then out after ~3s), or "Villa!" on failure.
 */
export function ThreadContentEditor({
  id,
  title,
  content,
}: {
  id: string;
  title: string;
  content: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);
  const [visible, setVisible] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await updateThreadContent(formData);
        setFeedback({ kind: "success", text: "Vistað ✅" });
      } catch {
        setFeedback({ kind: "error", text: "Villa!" });
      }
      // Mount at opacity-0, fade in, then fade out after ~3s.
      setVisible(false);
      setTimeout(() => setVisible(true), 20);
      setTimeout(() => setVisible(false), 3000);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <input
        name="title"
        defaultValue={title}
        className="h-10 w-full rounded-lg border border-input bg-surface px-3 text-sm font-medium"
      />
      <textarea
        name="content"
        defaultValue={content}
        rows={8}
        className="block w-full resize-y rounded-lg border border-input bg-surface p-3 text-sm leading-relaxed text-foreground/90"
      />
      <div className="flex items-center gap-3">
        <Button type="submit" variant="outline" size="sm" disabled={isPending}>
          {isPending ? "Vista..." : "Vista texta"}
        </Button>
        {feedback && (
          <span
            className={`text-sm font-medium transition-opacity duration-500 ${
              visible ? "opacity-100" : "opacity-0"
            } ${feedback.kind === "success" ? "text-success" : "text-destructive"}`}
          >
            {feedback.text}
          </span>
        )}
      </div>
    </form>
  );
}
