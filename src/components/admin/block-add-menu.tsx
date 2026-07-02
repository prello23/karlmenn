"use client";

import type { BlockType } from "@/lib/blocks";

const PALETTE: { type: BlockType; icon: string; label: string }[] = [
  { type: "text", icon: "📝", label: "Texti" },
  { type: "button", icon: "🔘", label: "Takki" },
  { type: "image", icon: "🖼️", label: "Mynd" },
  { type: "counter", icon: "📊", label: "Teljari" },
  { type: "columns", icon: "📐", label: "Dálkar" },
  { type: "section", icon: "🟫", label: "Kafli" },
  { type: "card", icon: "📦", label: "Kort" },
  { type: "divider", icon: "➖", label: "Skiptir" },
  { type: "spacer", icon: "↕️", label: "Bil" },
  { type: "html", icon: "</>", label: "HTML" },
];

/** A grid palette of insertable block types. */
export function BlockAddMenu({
  onAdd,
  compact = false,
}: {
  onAdd: (type: BlockType) => void;
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "grid grid-cols-3 gap-1.5 sm:grid-cols-5"
          : "grid grid-cols-3 gap-2 sm:grid-cols-5"
      }
    >
      {PALETTE.map((item) => (
        <button
          key={item.type}
          type="button"
          onClick={() => onAdd(item.type)}
          className="flex flex-col items-center gap-1 rounded-lg border border-border bg-surface px-2 py-2.5 text-xs font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-secondary"
        >
          <span className="text-lg leading-none">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
}
