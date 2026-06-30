"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Loader2, ImagePlus, X } from "lucide-react";

import { cn } from "@/lib/utils";

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

function Toolbar({
  editor,
  htmlMode,
  onToggleHtml,
  onOpenImage,
}: {
  editor: Editor;
  htmlMode: boolean;
  onToggleHtml: () => void;
  onOpenImage: () => void;
}) {
  const setLink = useCallback(() => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Slóð hlekks (skildu eftir autt til að fjarlægja):", prev ?? "");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-border bg-card p-2">
      <TbBtn
        title="Fyrirsögn 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </TbBtn>
      <TbBtn
        title="Fyrirsögn 3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        H3
      </TbBtn>
      <TbBtn
        title="Málsgrein"
        active={editor.isActive("paragraph")}
        onClick={() => editor.chain().focus().setParagraph().run()}
      >
        ¶
      </TbBtn>
      <span className="mx-1 h-5 w-px bg-border" />
      <TbBtn
        title="Feitletrað"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <strong>B</strong>
      </TbBtn>
      <TbBtn
        title="Skáletrað"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <em>I</em>
      </TbBtn>
      <TbBtn
        title="Listi"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        • Listi
      </TbBtn>
      <span className="mx-1 h-5 w-px bg-border" />
      <TbBtn title="Hlekkur" active={editor.isActive("link")} onClick={setLink}>
        🔗 Hlekkur
      </TbBtn>
      <TbBtn title="Mynd" onClick={onOpenImage}>
        🖼️ Mynd
      </TbBtn>
      <TbBtn
        title="Hreinsa snið"
        onClick={() =>
          editor.chain().focus().unsetAllMarks().clearNodes().run()
        }
      >
        🔄 Hreinsa
      </TbBtn>
      <span className="mx-1 h-5 w-px bg-border" />
      <TbBtn title="Sýna HTML" active={htmlMode} onClick={onToggleHtml}>
        {"</> HTML"}
      </TbBtn>
    </div>
  );
}

export function TipTapEditor({
  value,
  onChange,
  previewTitle,
}: {
  value: string;
  onChange: (html: string) => void;
  /** Shown as the H1 in the live preview (the live page heading). */
  previewTitle?: string;
}) {
  const [htmlMode, setHtmlMode] = useState(false);
  const [html, setHtml] = useState(value);
  const [showImage, setShowImage] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      Placeholder.configure({ placeholder: "Skrifaðu efni síðunnar..." }),
    ],
    content: value,
    editorProps: {
      attributes: {
        // Share the public page styling so the editor is a true WYSIWYG.
        class: "page-content tiptap-content focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      const next = editor.getHTML();
      setHtml(next);
      onChange(next);
    },
  });

  // Keep editor in sync if the parent value changes externally (rare).
  useEffect(() => {
    if (editor && !htmlMode && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
      setHtml(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  function toggleHtml() {
    if (!editor) return;
    if (!htmlMode) {
      // Going INTO html mode: capture current editor HTML.
      setHtml(editor.getHTML());
      setHtmlMode(true);
    } else {
      // Going BACK to WYSIWYG: push edited HTML into the editor.
      editor.commands.setContent(html, false);
      onChange(html);
      setHtmlMode(false);
    }
  }

  function insertImage(url: string) {
    editor?.chain().focus().setImage({ src: url }).run();
  }

  if (!editor) {
    return (
      <div className="h-64 rounded-lg border border-input bg-background" />
    );
  }

  return (
    <div className="space-y-6">
      {/* Editor */}
      <div className="overflow-hidden rounded-lg border border-input bg-background">
        <Toolbar
          editor={editor}
          htmlMode={htmlMode}
          onToggleHtml={toggleHtml}
          onOpenImage={() => setShowImage(true)}
        />

        {htmlMode ? (
          <textarea
            value={html}
            onChange={(e) => {
              setHtml(e.target.value);
              onChange(e.target.value);
            }}
            spellCheck={false}
            className="block min-h-[260px] w-full resize-y bg-background p-4 font-mono text-xs text-foreground focus:outline-none"
          />
        ) : (
          <EditorContent editor={editor} />
        )}
      </div>

      {/* Live preview — renders exactly as the public page */}
      <div>
        <div className="mb-3 flex items-center gap-3">
          <span className="text-sm font-semibold text-foreground">
            👁️ Forskoðun
          </span>
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">
            eins og síðan birtist
          </span>
        </div>
        <div className="rounded-lg border border-border bg-background p-5 sm:p-8">
          <div className="mx-auto max-w-3xl">
            {previewTitle && (
              <h1 className="mb-5 text-3xl font-bold tracking-tight sm:text-4xl">
                {previewTitle}
              </h1>
            )}
            {html.replace(/<[^>]*>/g, "").trim() ? (
              <div
                className="page-content"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Forskoðun birtist hér þegar þú skrifar efni.
              </p>
            )}
          </div>
        </div>
      </div>

      {showImage && (
        <ImageDialog
          onClose={() => setShowImage(false)}
          onInsert={insertImage}
        />
      )}
    </div>
  );
}
