"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import {
  GripVertical,
  ArrowUp,
  ArrowDown,
  Settings2,
  Copy,
  Trash2,
  Plus,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { type Block, type BlockType, MAX_WIDTH_PX } from "@/lib/blocks";
import { renderBlock } from "@/components/blocks/block-renderer";
import { BlockAddMenu } from "@/components/admin/block-add-menu";

type DropTarget = { parentId: string | null; beforeId: string | null };
type InsertAt = { parentId: string | null; beforeId: string | null };

interface Ctx {
  selectedId: string | null;
  onSelect: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
  dragId: string | null;
  setDragId: (id: string | null) => void;
  dropTarget: DropTarget | null;
  setDropTarget: (t: DropTarget | null) => void;
  onDropMove: (sourceId: string, parentId: string | null, beforeId: string | null) => void;
  openInsert: (at: InsertAt) => void;
}

const TYPE_LABELS: Record<string, string> = {
  section: "Kafli",
  columns: "Dálkar",
  column: "Dálkur",
  text: "Texti",
  button: "Takki",
  image: "Mynd",
  spacer: "Bil",
  counter: "Söguteljari",
  divider: "Skiptilína",
  card: "Kort",
  html: "HTML",
};

function sectionStyle(p: Record<string, unknown>): CSSProperties {
  const style: CSSProperties = {
    padding: `${Number(p.padY ?? 40)}px ${Number(p.padX ?? 24)}px`,
    borderRadius: `${Number(p.radius ?? 0)}px`,
  };
  if (p.bg) style.background = p.bg as string;
  if (p.bgImage) {
    style.backgroundImage = `linear-gradient(rgba(15,17,23,0.55), rgba(15,17,23,0.55)), url("${p.bgImage}")`;
    style.backgroundSize = "cover";
    style.backgroundPosition = "center";
  }
  return style;
}

function cardStyle(p: Record<string, unknown>): CSSProperties {
  const style: CSSProperties = {
    background: (p.bg as string) || "hsl(var(--card))",
    padding: `${Number(p.padding ?? 24)}px`,
    borderRadius: `${Number(p.radius ?? 12)}px`,
  };
  if (p.border) style.border = "1px solid hsl(var(--border))";
  if (p.shadow) style.boxShadow = "0 10px 30px -12px rgba(0,0,0,0.6)";
  return style;
}

function ratioToGridColumns(ratio: string, count: number): string {
  const parts = String(ratio || "")
    .split("/")
    .map((n) => parseFloat(n))
    .filter((n) => !Number.isNaN(n) && n > 0);
  if (parts.length === count) return parts.map((n) => `${n}fr`).join(" ");
  return `repeat(${count}, minmax(0, 1fr))`;
}

/** A gap between blocks: drop target while dragging, "+" insert otherwise. */
function Gap({
  ctx,
  parentId,
  beforeId,
}: {
  ctx: Ctx;
  parentId: string | null;
  beforeId: string | null;
}) {
  const dragging = ctx.dragId !== null;
  const active =
    ctx.dropTarget?.parentId === parentId &&
    ctx.dropTarget?.beforeId === beforeId;

  if (dragging) {
    return (
      <div
        onDragOver={(e) => {
          e.preventDefault();
          ctx.setDropTarget({ parentId, beforeId });
        }}
        onDrop={(e) => {
          e.preventDefault();
          if (ctx.dragId) ctx.onDropMove(ctx.dragId, parentId, beforeId);
        }}
        className="flex h-7 items-center"
      >
        <div
          className={cn(
            "h-1 w-full rounded-full transition-colors",
            active ? "bg-primary" : "bg-transparent",
          )}
        />
      </div>
    );
  }

  return (
    <div className="group/gap flex h-4 items-center justify-center">
      <button
        type="button"
        onClick={() => ctx.openInsert({ parentId, beforeId })}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground opacity-0 transition hover:border-primary hover:text-primary group-hover/gap:opacity-100"
        title="Bæta við blokk hér"
      >
        <Plus className="h-5 w-5 md:h-3.5 md:w-3.5" />
      </button>
    </div>
  );
}

/** Renders the ordered gaps + child nodes for a container's children. */
function ChildList({
  ctx,
  parentId,
  children,
  empty,
}: {
  ctx: Ctx;
  parentId: string | null;
  children: Block[];
  empty?: string;
}) {
  if (children.length === 0) {
    return (
      <>
        <Gap ctx={ctx} parentId={parentId} beforeId={null} />
        {empty && (
          <button
            type="button"
            onClick={() => ctx.openInsert({ parentId, beforeId: null })}
            onDragOver={(e) => {
              e.preventDefault();
              ctx.setDropTarget({ parentId, beforeId: null });
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (ctx.dragId) ctx.onDropMove(ctx.dragId, parentId, null);
            }}
            className="w-full rounded-lg border border-dashed border-border py-6 text-center text-xs text-muted-foreground hover:border-primary/50 hover:text-foreground"
          >
            {empty}
          </button>
        )}
      </>
    );
  }
  return (
    <>
      {children.map((child, i) => (
        <div key={child.id}>
          <Gap ctx={ctx} parentId={parentId} beforeId={child.id} />
          <BlockNode ctx={ctx} block={child} />
          {i === children.length - 1 && (
            <Gap ctx={ctx} parentId={parentId} beforeId={null} />
          )}
        </div>
      ))}
    </>
  );
}

function BlockNode({ ctx, block }: { ctx: Ctx; block: Block }) {
  const selected = ctx.selectedId === block.id;
  const isContainer =
    block.type === "section" || block.type === "card" || block.type === "columns";

  let body: ReactNode;
  if (block.type === "section") {
    body = (
      <div style={sectionStyle(block.props)}>
        <div
          className="mx-auto"
          style={{
            maxWidth:
              MAX_WIDTH_PX[
                (block.props.maxWidth as keyof typeof MAX_WIDTH_PX) ?? "wide"
              ],
          }}
        >
          <ChildList
            ctx={ctx}
            parentId={block.id}
            children={block.children ?? []}
            empty="Sleppa blokk hér — kafli"
          />
        </div>
      </div>
    );
  } else if (block.type === "card") {
    body = (
      <div style={cardStyle(block.props)}>
        <ChildList
          ctx={ctx}
          parentId={block.id}
          children={block.children ?? []}
          empty="Sleppa blokk hér — kort"
        />
      </div>
    );
  } else if (block.type === "columns") {
    const count = Number(block.props.count ?? 2);
    body = (
      <div
        className="grid grid-cols-1 md:[grid-template-columns:var(--cols)]"
        style={
          {
            "--cols": ratioToGridColumns(
              String(block.props.ratio ?? ""),
              count,
            ),
            gap: `${Number(block.props.gap ?? 24)}px`,
          } as CSSProperties
        }
      >
        {(block.children ?? []).map((col, ci) => (
          <div
            key={col.id}
            className="min-w-0 rounded-lg border border-dashed border-border/60 p-1.5"
          >
            <p className="mb-1 px-1 text-[10px] uppercase tracking-wide text-muted-foreground">
              Dálkur {ci + 1}
            </p>
            <ChildList
              ctx={ctx}
              parentId={col.id}
              children={col.children ?? []}
              empty="Sleppa hér"
            />
          </div>
        ))}
      </div>
    );
  } else {
    // Leaf block — static preview. pointer-events-none so clicks select it.
    body = (
      <div className="pointer-events-none p-3">{renderBlock(block, true)}</div>
    );
  }

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        ctx.onSelect(block.id);
      }}
      className={cn(
        "group/block relative rounded-lg border transition-colors",
        selected
          ? "border-primary ring-1 ring-primary"
          : "border-border/60 hover:border-border",
        ctx.dragId === block.id && "opacity-40",
      )}
    >
      {/* Top control bar */}
      <div
        className={cn(
          "absolute -top-3 right-2 z-10 flex items-center gap-1 rounded-md border border-border bg-card p-1 shadow-sm transition-opacity md:gap-0.5 md:p-0.5",
          selected ? "opacity-100" : "opacity-0 md:group-hover/block:opacity-100",
        )}
      >
        <span
          draggable
          onDragStart={(e) => {
            e.stopPropagation();
            ctx.setDragId(block.id);
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", block.id);
          }}
          onDragEnd={() => {
            ctx.setDragId(null);
            ctx.setDropTarget(null);
          }}
          title="Draga til að færa"
          className="flex h-11 w-11 cursor-grab items-center justify-center rounded text-muted-foreground hover:bg-secondary active:cursor-grabbing md:h-6 md:w-6"
        >
          <GripVertical className="h-5 w-5 md:h-3.5 md:w-3.5" />
        </span>
        <button
          type="button"
          title="Færa upp"
          onClick={(e) => {
            e.stopPropagation();
            ctx.onMove(block.id, -1);
          }}
          className="flex h-11 w-11 items-center justify-center rounded text-muted-foreground hover:bg-secondary md:h-6 md:w-6"
        >
          <ArrowUp className="h-5 w-5 md:h-3.5 md:w-3.5" />
        </button>
        <button
          type="button"
          title="Færa niður"
          onClick={(e) => {
            e.stopPropagation();
            ctx.onMove(block.id, 1);
          }}
          className="flex h-11 w-11 items-center justify-center rounded text-muted-foreground hover:bg-secondary md:h-6 md:w-6"
        >
          <ArrowDown className="h-5 w-5 md:h-3.5 md:w-3.5" />
        </button>
        <button
          type="button"
          title="Stillingar"
          onClick={(e) => {
            e.stopPropagation();
            ctx.onSelect(block.id);
          }}
          className="flex h-11 w-11 items-center justify-center rounded text-muted-foreground hover:bg-secondary md:h-6 md:w-6"
        >
          <Settings2 className="h-5 w-5 md:h-3.5 md:w-3.5" />
        </button>
        <button
          type="button"
          title="Afrita"
          onClick={(e) => {
            e.stopPropagation();
            ctx.onDuplicate(block.id);
          }}
          className="flex h-11 w-11 items-center justify-center rounded text-muted-foreground hover:bg-secondary md:h-6 md:w-6"
        >
          <Copy className="h-5 w-5 md:h-3.5 md:w-3.5" />
        </button>
        <button
          type="button"
          title="Eyða"
          onClick={(e) => {
            e.stopPropagation();
            ctx.onRemove(block.id);
          }}
          className="flex h-11 w-11 items-center justify-center rounded text-destructive hover:bg-secondary md:h-6 md:w-6"
        >
          <Trash2 className="h-5 w-5 md:h-3.5 md:w-3.5" />
        </button>
      </div>

      {/* Type label */}
      <span className="pointer-events-none absolute -top-2.5 left-2 z-10 hidden rounded bg-card px-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground md:block">
        {TYPE_LABELS[block.type] ?? block.type}
      </span>

      <div className={cn(isContainer ? "p-2 pt-4" : "")}>{body}</div>
    </div>
  );
}

export function BlockCanvas({
  blocks,
  selectedId,
  onSelect,
  onMove,
  onDuplicate,
  onRemove,
  onDropMove,
  onInsert,
}: {
  blocks: Block[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
  onDropMove: (sourceId: string, parentId: string | null, beforeId: string | null) => void;
  onInsert: (parentId: string | null, beforeId: string | null, type: BlockType) => void;
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const [insertAt, setInsertAt] = useState<InsertAt | null>(null);

  const ctx: Ctx = {
    selectedId,
    onSelect,
    onMove,
    onDuplicate,
    onRemove,
    dragId,
    setDragId,
    dropTarget,
    setDropTarget,
    onDropMove,
    openInsert: setInsertAt,
  };

  return (
    <div
      onClick={() => onSelect(null)}
      className="min-h-[400px] rounded-xl border border-border bg-[hsl(225,21%,7%)] p-4"
    >
      {blocks.length === 0 && (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Engar blokkir enn. Bættu við fyrstu blokkinni hér að neðan.
        </p>
      )}
      <ChildList ctx={ctx} parentId={null} children={blocks} />

      {insertAt && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-background/70 p-4 sm:items-center"
          onClick={() => setInsertAt(null)}
        >
          <div
            className="w-full max-w-lg rounded-xl border border-border bg-card p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-3 text-sm font-semibold">Veldu blokk</h3>
            <BlockAddMenu
              onAdd={(type) => {
                onInsert(insertAt.parentId, insertAt.beforeId, type);
                setInsertAt(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
