"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Undo2, Redo2, Settings, RotateCcw } from "lucide-react";

import {
  type Block,
  type BlockType,
  type PageDocument,
  defaultBlock,
  parseDocument,
  serializeDocument,
} from "@/lib/blocks";
import {
  duplicateBlock,
  findBlock,
  insertBefore,
  moveBlock,
  nudgeBlock,
  removeBlock,
  updateBlock,
} from "@/lib/block-tree";
import { BlockCanvas } from "@/components/admin/block-canvas";
import { BlockAddMenu } from "@/components/admin/block-add-menu";
import { BlockSettingsPanel } from "@/components/admin/block-settings-panel";
import { MAX_WIDTH_PX } from "@/lib/blocks";

const selectCls =
  "flex h-9 w-full rounded-lg border border-input bg-surface px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

/**
 * Block-based page builder. Controlled: parses the stored content/version into
 * a block document, and emits a serialised JSON document via onDocChange
 * whenever the document changes. The parent (PageEditor) persists it with
 * contentVersion 2.
 */
export function BlockEditor({
  initialContent,
  initialVersion,
  pageKey,
  onDocChange,
}: {
  initialContent: string;
  initialVersion: number;
  pageKey: string;
  onDocChange: (serialized: string) => void;
}) {
  const initialDoc = useMemo(
    () => parseDocument(initialContent, initialVersion),
    [initialContent, initialVersion],
  );

  const [doc, setDoc] = useState<PageDocument>(initialDoc);
  const [past, setPast] = useState<PageDocument[]>([]);
  const [future, setFuture] = useState<PageDocument[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showPageSettings, setShowPageSettings] = useState(false);
  const [draftFound, setDraftFound] = useState<string | null>(null);

  const storageKey = `ekkieinn:block-draft:${pageKey}`;

  // Emit serialised document to the parent whenever it changes.
  const onDocChangeRef = useRef(onDocChange);
  onDocChangeRef.current = onDocChange;
  useEffect(() => {
    onDocChangeRef.current(serializeDocument(doc));
  }, [doc]);

  // ---- history-aware commit -------------------------------------------------
  const apply = useCallback(
    (next: PageDocument) => {
      setPast((p) => [...p.slice(-49), doc]);
      setFuture([]);
      setDoc(next);
    },
    [doc],
  );

  const setBlocks = useCallback(
    (fn: (blocks: Block[]) => Block[]) => {
      apply({ ...doc, blocks: fn(doc.blocks) });
    },
    [apply, doc],
  );

  const undo = useCallback(() => {
    setPast((p) => {
      if (p.length === 0) return p;
      const prev = p[p.length - 1];
      setFuture((f) => [doc, ...f].slice(0, 50));
      setDoc(prev);
      return p.slice(0, -1);
    });
  }, [doc]);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const next = f[0];
      setPast((p) => [...p, doc].slice(-50));
      setDoc(next);
      return f.slice(1);
    });
  }, [doc]);

  // ---- keyboard shortcuts ---------------------------------------------------
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const editing =
        target &&
        (target.isContentEditable ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT");
      if (editing) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (
        (e.ctrlKey || e.metaKey) &&
        (e.key.toLowerCase() === "y" ||
          (e.shiftKey && e.key.toLowerCase() === "z"))
      ) {
        e.preventDefault();
        redo();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  // ---- localStorage autosave (every 30s) ------------------------------------
  useEffect(() => {
    // Offer to restore a newer local draft, if one exists and differs.
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved && saved !== serializeDocument(initialDoc)) {
        setDraftFound(saved);
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const docRef = useRef(doc);
  docRef.current = doc;
  useEffect(() => {
    const t = setInterval(() => {
      try {
        localStorage.setItem(storageKey, serializeDocument(docRef.current));
      } catch {
        /* ignore quota */
      }
    }, 30000);
    return () => clearInterval(t);
  }, [storageKey]);

  function restoreDraft() {
    if (!draftFound) return;
    try {
      const parsed = parseDocument(draftFound, 2);
      apply(parsed);
    } catch {
      /* ignore */
    }
    setDraftFound(null);
  }
  function discardDraft() {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
    setDraftFound(null);
  }

  // ---- block operations -----------------------------------------------------
  const handleInsert = useCallback(
    (parentId: string | null, beforeId: string | null, type: BlockType) => {
      const node = defaultBlock(type);
      apply({
        ...doc,
        blocks: insertBefore(doc.blocks, parentId, beforeId, node),
      });
      setSelectedId(node.id);
    },
    [apply, doc],
  );

  const handleRemove = useCallback(
    (id: string) => {
      if (!window.confirm("Eyða þessari blokk?")) return;
      setBlocks((b) => removeBlock(b, id).blocks);
      setSelectedId((cur) => (cur === id ? null : cur));
    },
    [setBlocks],
  );

  const handleUpdateBlock = useCallback(
    (next: Block) => {
      setBlocks((b) => updateBlock(b, next.id, () => next));
    },
    [setBlocks],
  );

  const selectedBlock = selectedId ? findBlock(doc.blocks, selectedId) : null;

  return (
    <div className="relative">
      {draftFound && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/40 bg-primary/10 px-4 py-2.5 text-sm">
          <span className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Óvistuð staðbundin drög fundust.
          </span>
          <span className="flex gap-2">
            <button
              type="button"
              onClick={restoreDraft}
              className="rounded-md bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
            >
              Endurheimta
            </button>
            <button
              type="button"
              onClick={discardDraft}
              className="rounded-md border border-border px-3 py-1 text-xs"
            >
              Henda
            </button>
          </span>
        </div>
      )}

      {/* Toolbar */}
      <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-2">
        <button
          type="button"
          onClick={undo}
          disabled={past.length === 0}
          title="Afturkalla (Ctrl+Z)"
          className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm hover:bg-secondary disabled:opacity-40"
        >
          <Undo2 className="h-4 w-4" /> Afturkalla
        </button>
        <button
          type="button"
          onClick={redo}
          disabled={future.length === 0}
          title="Endurgera (Ctrl+Y)"
          className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm hover:bg-secondary disabled:opacity-40"
        >
          <Redo2 className="h-4 w-4" /> Endurgera
        </button>
        <span className="mx-1 h-5 w-px bg-border" />
        <button
          type="button"
          onClick={() => setShowPageSettings((s) => !s)}
          className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm hover:bg-secondary ${
            showPageSettings ? "bg-secondary" : ""
          }`}
        >
          <Settings className="h-4 w-4" /> Síðustillingar
        </button>
      </div>

      {showPageSettings && (
        <div className="mb-3 grid gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">
              Bakgrunnslitur síðu
            </span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={doc.settings.bg || "#0f1117"}
                onChange={(e) =>
                  apply({
                    ...doc,
                    settings: { ...doc.settings, bg: e.target.value },
                  })
                }
                className="h-9 w-12 cursor-pointer rounded-lg border border-input bg-surface p-1"
              />
              {doc.settings.bg && (
                <button
                  type="button"
                  onClick={() =>
                    apply({ ...doc, settings: { ...doc.settings, bg: "" } })
                  }
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Hreinsa
                </button>
              )}
            </div>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">
              Hámarksbreidd
            </span>
            <select
              value={doc.settings.maxWidth}
              onChange={(e) =>
                apply({
                  ...doc,
                  settings: {
                    ...doc.settings,
                    maxWidth: e.target.value as PageDocument["settings"]["maxWidth"],
                  },
                })
              }
              className={selectCls}
            >
              <option value="narrow">Mjó</option>
              <option value="medium">Miðlungs</option>
              <option value="wide">Breið</option>
              <option value="full">Full breidd</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">
              Bil efst/neðst (px)
            </span>
            <input
              type="number"
              value={doc.settings.padding}
              min={0}
              max={160}
              onChange={(e) =>
                apply({
                  ...doc,
                  settings: { ...doc.settings, padding: Number(e.target.value) },
                })
              }
              className={selectCls}
            />
          </label>
        </div>
      )}

      {/* Canvas, framed to the chosen page width so the editor mirrors output */}
      <div
        className="mx-auto"
        style={{ maxWidth: MAX_WIDTH_PX[doc.settings.maxWidth] }}
      >
        <BlockCanvas
          blocks={doc.blocks}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onMove={(id, dir) => setBlocks((b) => nudgeBlock(b, id, dir))}
          onDuplicate={(id) => setBlocks((b) => duplicateBlock(b, id))}
          onRemove={handleRemove}
          onDropMove={(sourceId, parentId, beforeId) =>
            setBlocks((b) => moveBlock(b, sourceId, parentId, beforeId))
          }
          onInsert={handleInsert}
        />
      </div>

      {/* Persistent add-block palette (appends to end) */}
      <div className="mt-4 rounded-xl border border-border bg-card p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          + Bæta við blokk
        </p>
        <BlockAddMenu onAdd={(type) => handleInsert(null, null, type)} />
      </div>

      {/* Settings panel — slides in from the right */}
      {selectedBlock && (
        <div className="fixed inset-y-0 right-0 z-40 w-full max-w-sm border-l border-border bg-card shadow-2xl">
          <BlockSettingsPanel
            key={selectedBlock.id}
            block={selectedBlock}
            onChange={handleUpdateBlock}
            onClose={() => setSelectedId(null)}
          />
        </div>
      )}
    </div>
  );
}
