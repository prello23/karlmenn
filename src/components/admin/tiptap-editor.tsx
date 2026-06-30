"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Loader2, ImagePlus, X, Replace, Ruler, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { IconPicker } from "@/components/admin/icon-picker";
import { ICON_SIZES, type IconSizeKey } from "@/lib/icons";

const SIZE_KEYS = Object.keys(ICON_SIZES) as IconSizeKey[];

/** A single toolbar button. */
function TbBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-foreground hover:bg-secondary",
      )}
    >
      {children}
    </button>
  );
}

function Separator() {
  return <span className="mx-1 h-5 w-px bg-border" />;
}

function ImageDialog({
  onClose,
  onInsert,
}: {
  onClose: () => void;
  onInsert: (url: string) => void;
}) {
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setError(data.error ?? "Upphleðsla mistókst.");
        return;
      }
      onInsert(data.url);
      onClose();
    } catch {
      setError("Upphleðsla mistókst.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Setja inn mynd</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Loka"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <label className="mb-1 block text-sm font-medium">Slóð myndar (URL)</label>
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="flex h-10 w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm"
          />
          <button
            type="button"
            disabled={!url}
            onClick={() => {
              onInsert(url);
              onClose();
            }}
            className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            Setja inn
          </button>
        </div>

        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          eða
          <span className="h-px flex-1 bg-border" />
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium hover:bg-secondary disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="h-4 w-4" />
          )}
          Hlaða upp mynd
        </button>

        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}

/**
 * A contenteditable WYSIWYG editor that renders stored HTML faithfully (no
 * sanitising/stripping), using the same `.page-content` styling as the public
 * page. The DOM is seeded once per mode switch so typing never resets the
 * caret (we deliberately do NOT bind innerHTML to the changing `value` prop).
 */
export function TipTapEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [htmlMode, setHtmlMode] = useState(false);
  const [html, setHtml] = useState(value);

  const [showImage, setShowImage] = useState(false);

  // ---- Icon picker + click-to-edit floating toolbar ----
  const [showIcon, setShowIcon] = useState(false);
  const [iconMode, setIconMode] = useState<"insert" | "replace">("insert");
  const activeIconRef = useRef<HTMLElement | null>(null);
  const [floatPos, setFloatPos] = useState<{ top: number; left: number } | null>(
    null,
  );
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const savedRange = useRef<Range | null>(null);

  // Seed the contenteditable DOM from `html` whenever we (re)enter WYSIWYG
  // mode (and on first mount). Not keyed on `html`, so typing doesn't reset it.
  useEffect(() => {
    if (!htmlMode && editorRef.current) {
      editorRef.current.innerHTML = html;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [htmlMode]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const newHtml = editorRef.current.innerHTML;
      setHtml(newHtml);
      onChange(newHtml);
    }
  }, [onChange]);

  function exec(command: string, arg?: string) {
    document.execCommand(command, false, arg);
    editorRef.current?.focus();
    handleInput();
  }

  function toggleHtml() {
    if (!htmlMode) {
      // Going INTO html mode — capture current DOM as source.
      if (editorRef.current) setHtml(editorRef.current.innerHTML);
      setHtmlMode(true);
    } else {
      // Going BACK to WYSIWYG — the seeding effect applies `html` to the DOM.
      onChange(html);
      setHtmlMode(false);
    }
  }

  function insertLink() {
    const url = window.prompt("Slóð hlekks:", "https://");
    if (url) exec("createLink", url);
  }

  function insertImage(url: string) {
    exec(
      "insertHTML",
      `<img src="${url}" style="max-width:100%;height:auto;border-radius:0.5rem;margin:1rem 0" />`,
    );
  }

  // ---- Icons ----
  function openIconPicker() {
    // Remember where the caret is so we can insert there after the modal closes.
    const sel = window.getSelection();
    savedRange.current =
      sel && sel.rangeCount > 0 ? sel.getRangeAt(0).cloneRange() : null;
    setIconMode("insert");
    setShowIcon(true);
  }

  function handleIconResult(html: string) {
    if (iconMode === "replace" && activeIconRef.current) {
      activeIconRef.current.outerHTML = html;
      activeIconRef.current = null;
      handleInput();
      return;
    }
    // Insert mode — restore caret then drop the icon in.
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (savedRange.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
    exec("insertHTML", html);
  }

  function closeFloating() {
    activeIconRef.current = null;
    setFloatPos(null);
    setShowSizeMenu(false);
  }

  function handleEditorClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    const icon = target.closest(
      ".editor-icon, .shield-lg",
    ) as HTMLElement | null;
    if (icon && editorRef.current?.contains(icon)) {
      activeIconRef.current = icon;
      const r = icon.getBoundingClientRect();
      setFloatPos({ top: r.top, left: r.left + r.width / 2 });
      setShowSizeMenu(false);
    } else {
      closeFloating();
    }
  }

  function resizeActiveIcon(px: number) {
    const icon = activeIconRef.current;
    if (!icon) return;
    icon.setAttribute("width", String(px));
    icon.setAttribute("height", String(px));
    icon.style.width = `${px}px`;
    icon.style.height = `${px}px`;
    const r = icon.getBoundingClientRect();
    setFloatPos({ top: r.top, left: r.left + r.width / 2 });
    setShowSizeMenu(false);
    handleInput();
  }

  function deleteActiveIcon() {
    const icon = activeIconRef.current;
    if (!icon) return;
    // Remove an immediate icon-wrapper span if that's all that holds it.
    const parent = icon.parentElement;
    if (
      parent &&
      parent !== editorRef.current &&
      parent.classList.contains("icon-wrapper")
    ) {
      parent.remove();
    } else {
      icon.remove();
    }
    closeFloating();
    handleInput();
  }

  function replaceActiveIcon() {
    setIconMode("replace");
    setShowIcon(true);
    setShowSizeMenu(false);
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 rounded-t-lg border border-border bg-card p-2">
        <TbBtn title="Fyrirsögn 2" onClick={() => exec("formatBlock", "<h2>")}>
          H2
        </TbBtn>
        <TbBtn title="Fyrirsögn 3" onClick={() => exec("formatBlock", "<h3>")}>
          H3
        </TbBtn>
        <TbBtn title="Málsgrein" onClick={() => exec("formatBlock", "<p>")}>
          ¶
        </TbBtn>
        <Separator />
        <TbBtn title="Feitletrað" onClick={() => exec("bold")}>
          <strong>B</strong>
        </TbBtn>
        <TbBtn title="Skáletrað" onClick={() => exec("italic")}>
          <em>I</em>
        </TbBtn>
        <TbBtn title="Listi" onClick={() => exec("insertUnorderedList")}>
          • Listi
        </TbBtn>
        <Separator />
        <TbBtn title="Hlekkur" onClick={insertLink}>
          🔗 Hlekkur
        </TbBtn>
        <TbBtn title="Mynd" onClick={() => setShowImage(true)}>
          🖼️ Mynd
        </TbBtn>
        <TbBtn title="Ikon" onClick={openIconPicker}>
          🎨 Ikon
        </TbBtn>
        <TbBtn title="Hreinsa snið" onClick={() => exec("removeFormat")}>
          🔄 Hreinsa
        </TbBtn>
        <Separator />
        <TbBtn title="Sýna HTML" active={htmlMode} onClick={toggleHtml}>
          {"</> HTML"}
        </TbBtn>
      </div>

      {/* Content area — renders exactly as the live page */}
      {htmlMode ? (
        <textarea
          value={html}
          onChange={(e) => {
            setHtml(e.target.value);
            onChange(e.target.value);
          }}
          spellCheck={false}
          className="block min-h-[400px] w-full resize-y rounded-b-lg border border-t-0 border-border bg-background p-6 font-mono text-xs text-foreground focus:outline-none"
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onClick={handleEditorClick}
          className="page-content min-h-[400px] rounded-b-lg border border-t-0 border-border bg-[hsl(225,21%,7%)] p-6 focus:outline-none"
          style={{ caretColor: "hsl(38, 92%, 50%)" }}
        />
      )}

      {/* Floating toolbar for an icon clicked inside the editor */}
      {floatPos && !htmlMode && (
        <div
          className="fixed z-50 -translate-x-1/2 -translate-y-full"
          style={{ top: floatPos.top - 8, left: floatPos.left }}
        >
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 shadow-xl">
            <button
              type="button"
              title="Skipta um ikon"
              onClick={replaceActiveIcon}
              className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium hover:bg-secondary"
            >
              <Replace className="h-3.5 w-3.5" /> Skipta
            </button>
            <button
              type="button"
              title="Stærð"
              onClick={() => setShowSizeMenu((s) => !s)}
              className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium hover:bg-secondary"
            >
              <Ruler className="h-3.5 w-3.5" /> Stærð
            </button>
            <button
              type="button"
              title="Eyða"
              onClick={deleteActiveIcon}
              className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium text-destructive hover:bg-secondary"
            >
              <Trash2 className="h-3.5 w-3.5" /> Eyða
            </button>
          </div>
          {showSizeMenu && (
            <div className="mt-1 flex items-center gap-1 rounded-lg border border-border bg-card p-1 shadow-xl">
              {SIZE_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => resizeActiveIcon(ICON_SIZES[key])}
                  className="h-7 min-w-8 rounded-md bg-surface px-2 text-xs font-semibold hover:bg-secondary"
                >
                  {key}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {showImage && (
        <ImageDialog
          onClose={() => setShowImage(false)}
          onInsert={insertImage}
        />
      )}

      {showIcon && (
        <IconPicker
          mode={iconMode}
          onClose={() => setShowIcon(false)}
          onInsert={handleIconResult}
        />
      )}
    </>
  );
}
