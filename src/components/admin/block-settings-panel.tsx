"use client";

import { useEffect, useRef, useState } from "react";
import { X, Loader2, Upload, Bold, Italic, Underline, Link2 } from "lucide-react";

import { type Block, FONT_FAMILIES, resizeColumns } from "@/lib/blocks";

// ---- Small form primitives --------------------------------------------------

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "flex h-9 w-full rounded-lg border border-input bg-surface px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring";
const selectCls = inputCls;

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={inputCls}
    />
  );
}

function NumberInput({
  value,
  onChange,
  min,
  max,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      onChange={(e) => onChange(Number(e.target.value))}
      className={inputCls}
    />
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={selectCls}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function ColorField({
  label,
  value,
  onChange,
  allowEmpty = true,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  allowEmpty?: boolean;
}) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || "#0f1117"}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded-lg border border-input bg-surface p-1"
        />
        <input
          type="text"
          value={value}
          placeholder="sjálfgefið"
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
        />
        {allowEmpty && value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Hreinsa
          </button>
        )}
      </div>
    </Field>
  );
}

function ImageUploadField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      onChange(data.url);
    } catch {
      setError("Upphleðsla mistókst.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Field label={label}>
      <div className="space-y-2">
        {value && (
          <img
            src={value}
            alt=""
            className="max-h-32 rounded-lg border border-border object-contain"
          />
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={value}
            placeholder="https://… eða hlaða upp"
            onChange={(e) => onChange(e.target.value)}
            className={inputCls}
          />
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
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-sm hover:bg-secondary disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="inline-flex h-9 shrink-0 items-center rounded-lg border border-border px-2 text-xs hover:bg-secondary"
            >
              Fjarlægja
            </button>
          )}
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </Field>
  );
}

/** Rich text editor for the text block — contenteditable with basic controls. */
function RichTextField({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Seed once; not bound to `value` so typing doesn't reset the caret.
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function exec(cmd: string, arg?: string) {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    if (ref.current) onChange(ref.current.innerHTML);
  }

  return (
    <Field label="Texti">
      <div className="rounded-lg border border-input">
        <div className="flex flex-wrap items-center gap-1 border-b border-border bg-card p-1.5">
          <button
            type="button"
            title="Feitletrað"
            onMouseDown={(e) => {
              e.preventDefault();
              exec("bold");
            }}
            className="inline-flex h-7 w-7 items-center justify-center rounded hover:bg-secondary"
          >
            <Bold className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Skáletrað"
            onMouseDown={(e) => {
              e.preventDefault();
              exec("italic");
            }}
            className="inline-flex h-7 w-7 items-center justify-center rounded hover:bg-secondary"
          >
            <Italic className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Undirstrikað"
            onMouseDown={(e) => {
              e.preventDefault();
              exec("underline");
            }}
            className="inline-flex h-7 w-7 items-center justify-center rounded hover:bg-secondary"
          >
            <Underline className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Hlekkur"
            onMouseDown={(e) => {
              e.preventDefault();
              const url = window.prompt("Slóð hlekks:", "https://");
              if (url) exec("createLink", url);
            }}
            className="inline-flex h-7 w-7 items-center justify-center rounded hover:bg-secondary"
          >
            <Link2 className="h-3.5 w-3.5" />
          </button>
        </div>
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          onInput={() => ref.current && onChange(ref.current.innerHTML)}
          className="page-content min-h-[100px] px-3 py-2 text-sm focus:outline-none"
        />
      </div>
    </Field>
  );
}

// ---- Per-type settings ------------------------------------------------------

const FONT_SIZE_OPTS = [
  { value: "sm", label: "Lítið (sm)" },
  { value: "md", label: "Venjulegt (md)" },
  { value: "lg", label: "Stórt (lg)" },
  { value: "xl", label: "Stærra (xl)" },
  { value: "2xl", label: "Mjög stórt (2xl)" },
  { value: "3xl", label: "Risastórt (3xl)" },
];

const ALIGN_OPTS = [
  { value: "left", label: "Vinstri" },
  { value: "center", label: "Miðja" },
  { value: "right", label: "Hægri" },
];

function BlockFields({
  block,
  set,
}: {
  block: Block;
  set: (patch: Record<string, unknown>) => void;
}) {
  const p = block.props;

  switch (block.type) {
    case "text":
      return (
        <>
          <RichTextField
            value={String(p.html ?? "")}
            onChange={(html) => set({ html })}
          />
          <Field label="Fyrirsagnarstig">
            <Select
              value={String(p.level ?? "p")}
              onChange={(v) => set({ level: v })}
              options={[
                { value: "p", label: "Málsgrein" },
                { value: "h1", label: "Fyrirsögn 1" },
                { value: "h2", label: "Fyrirsögn 2" },
                { value: "h3", label: "Fyrirsögn 3" },
                { value: "h4", label: "Fyrirsögn 4" },
                { value: "h5", label: "Fyrirsögn 5" },
                { value: "h6", label: "Fyrirsögn 6" },
              ]}
            />
          </Field>
          <Field label="Leturgerð">
            <Select
              value={String(p.fontFamily ?? "")}
              onChange={(v) => set({ fontFamily: v })}
              options={FONT_FAMILIES}
            />
          </Field>
          <Field label="Leturstærð">
            <Select
              value={String(p.fontSize ?? "md")}
              onChange={(v) => set({ fontSize: v })}
              options={FONT_SIZE_OPTS}
            />
          </Field>
          <ColorField
            label="Litur texta"
            value={String(p.color ?? "")}
            onChange={(v) => set({ color: v })}
          />
          <Field label="Jöfnun">
            <Select
              value={String(p.align ?? "left")}
              onChange={(v) => set({ align: v })}
              options={ALIGN_OPTS}
            />
          </Field>
        </>
      );

    case "button":
      return (
        <>
          <Field label="Texti á takka">
            <TextInput
              value={String(p.text ?? "")}
              onChange={(v) => set({ text: v })}
            />
          </Field>
          <Field label="Slóð (URL)">
            <TextInput
              value={String(p.url ?? "")}
              onChange={(v) => set({ url: v })}
              placeholder="https://…"
            />
          </Field>
          <Field label="Stíll">
            <Select
              value={String(p.style ?? "primary")}
              onChange={(v) => set({ style: v })}
              options={[
                { value: "primary", label: "Aðal (gull)" },
                { value: "secondary", label: "Útlína" },
                { value: "ghost", label: "Draugur" },
              ]}
            />
          </Field>
          <Field label="Stærð">
            <Select
              value={String(p.size ?? "md")}
              onChange={(v) => set({ size: v })}
              options={[
                { value: "sm", label: "Lítill" },
                { value: "md", label: "Miðlungs" },
                { value: "lg", label: "Stór" },
              ]}
            />
          </Field>
          <Field label="Jöfnun">
            <Select
              value={String(p.align ?? "left")}
              onChange={(v) => set({ align: v })}
              options={ALIGN_OPTS}
            />
          </Field>
          <Field label="Hornaradíus (px)">
            <NumberInput
              value={Number(p.radius ?? 10)}
              onChange={(v) => set({ radius: v })}
              min={0}
              max={40}
            />
          </Field>
          <ColorField
            label="Bakgrunnslitur"
            value={String(p.bg ?? "")}
            onChange={(v) => set({ bg: v })}
          />
          <ColorField
            label="Textalitur"
            value={String(p.color ?? "")}
            onChange={(v) => set({ color: v })}
          />
          <ColorField
            label="Rammalitur"
            value={String(p.border ?? "")}
            onChange={(v) => set({ border: v })}
          />
        </>
      );

    case "image":
      return (
        <>
          <ImageUploadField
            label="Mynd"
            value={String(p.src ?? "")}
            onChange={(v) => set({ src: v })}
          />
          <Field label="Alt-texti">
            <TextInput
              value={String(p.alt ?? "")}
              onChange={(v) => set({ alt: v })}
            />
          </Field>
          <Field label="Breidd (%)">
            <NumberInput
              value={Number(p.width ?? 100)}
              onChange={(v) => set({ width: v })}
              min={10}
              max={100}
            />
          </Field>
          <Field label="Jöfnun">
            <Select
              value={String(p.align ?? "center")}
              onChange={(v) => set({ align: v })}
              options={ALIGN_OPTS}
            />
          </Field>
          <Field label="Hornaradíus (px)">
            <NumberInput
              value={Number(p.radius ?? 8)}
              onChange={(v) => set({ radius: v })}
              min={0}
              max={40}
            />
          </Field>
          <Field label="Hlekkur (valfrjálst)">
            <TextInput
              value={String(p.href ?? "")}
              onChange={(v) => set({ href: v })}
              placeholder="https://…"
            />
          </Field>
        </>
      );

    case "spacer":
      return (
        <Field label="Hæð (px)">
          <NumberInput
            value={Number(p.height ?? 32)}
            onChange={(v) => set({ height: v })}
            min={0}
            max={400}
          />
        </Field>
      );

    case "divider":
      return (
        <>
          <ColorField
            label="Litur"
            value={String(p.color ?? "")}
            onChange={(v) => set({ color: v })}
          />
          <Field label="Þykkt (px)">
            <NumberInput
              value={Number(p.thickness ?? 1)}
              onChange={(v) => set({ thickness: v })}
              min={1}
              max={12}
            />
          </Field>
          <Field label="Bil yfir/undir (px)">
            <NumberInput
              value={Number(p.margin ?? 16)}
              onChange={(v) => set({ margin: v })}
              min={0}
              max={120}
            />
          </Field>
        </>
      );

    case "counter":
      return (
        <>
          <Field label="Merking (label)">
            <TextInput
              value={String(p.label ?? "")}
              onChange={(v) => set({ label: v })}
            />
          </Field>
          <Field label="Leturstærð tölu">
            <Select
              value={String(p.fontSize ?? "3xl")}
              onChange={(v) => set({ fontSize: v })}
              options={FONT_SIZE_OPTS}
            />
          </Field>
          <ColorField
            label="Litur tölu"
            value={String(p.numberColor ?? "")}
            onChange={(v) => set({ numberColor: v })}
          />
          <ColorField
            label="Litur merkingar"
            value={String(p.labelColor ?? "")}
            onChange={(v) => set({ labelColor: v })}
          />
          <Field label="Jöfnun">
            <Select
              value={String(p.align ?? "center")}
              onChange={(v) => set({ align: v })}
              options={ALIGN_OPTS}
            />
          </Field>
          <div className="rounded-lg border border-border p-3">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">
              Hnappur 1 (valfrjálst)
            </p>
            <div className="space-y-2">
              <TextInput
                value={String(p.ctaText ?? "")}
                onChange={(v) => set({ ctaText: v })}
                placeholder="Texti"
              />
              <TextInput
                value={String(p.ctaUrl ?? "")}
                onChange={(v) => set({ ctaUrl: v })}
                placeholder="Slóð"
              />
            </div>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">
              Hnappur 2 (valfrjálst)
            </p>
            <div className="space-y-2">
              <TextInput
                value={String(p.cta2Text ?? "")}
                onChange={(v) => set({ cta2Text: v })}
                placeholder="Texti"
              />
              <TextInput
                value={String(p.cta2Url ?? "")}
                onChange={(v) => set({ cta2Url: v })}
                placeholder="Slóð"
              />
            </div>
          </div>
        </>
      );

    case "html":
      return (
        <Field label="HTML">
          <textarea
            value={String(p.html ?? "")}
            onChange={(e) => set({ html: e.target.value })}
            spellCheck={false}
            className="block min-h-[200px] w-full resize-y rounded-lg border border-input bg-background p-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </Field>
      );

    case "card":
      return (
        <>
          <ColorField
            label="Bakgrunnslitur"
            value={String(p.bg ?? "")}
            onChange={(v) => set({ bg: v })}
          />
          <Field label="Rammi">
            <Select
              value={p.border ? "yes" : "no"}
              onChange={(v) => set({ border: v === "yes" })}
              options={[
                { value: "yes", label: "Já" },
                { value: "no", label: "Nei" },
              ]}
            />
          </Field>
          <Field label="Skuggi">
            <Select
              value={p.shadow ? "yes" : "no"}
              onChange={(v) => set({ shadow: v === "yes" })}
              options={[
                { value: "yes", label: "Já" },
                { value: "no", label: "Nei" },
              ]}
            />
          </Field>
          <Field label="Bil innan (px)">
            <NumberInput
              value={Number(p.padding ?? 24)}
              onChange={(v) => set({ padding: v })}
              min={0}
              max={80}
            />
          </Field>
          <Field label="Hornaradíus (px)">
            <NumberInput
              value={Number(p.radius ?? 12)}
              onChange={(v) => set({ radius: v })}
              min={0}
              max={40}
            />
          </Field>
        </>
      );

    case "section":
      return (
        <>
          <ColorField
            label="Bakgrunnslitur"
            value={String(p.bg ?? "")}
            onChange={(v) => set({ bg: v })}
          />
          <ImageUploadField
            label="Bakgrunnsmynd"
            value={String(p.bgImage ?? "")}
            onChange={(v) => set({ bgImage: v })}
          />
          <Field label="Bil efst/neðst (px)">
            <NumberInput
              value={Number(p.padY ?? 40)}
              onChange={(v) => set({ padY: v })}
              min={0}
              max={160}
            />
          </Field>
          <Field label="Bil vinstri/hægri (px)">
            <NumberInput
              value={Number(p.padX ?? 24)}
              onChange={(v) => set({ padX: v })}
              min={0}
              max={120}
            />
          </Field>
          <Field label="Hornaradíus (px)">
            <NumberInput
              value={Number(p.radius ?? 0)}
              onChange={(v) => set({ radius: v })}
              min={0}
              max={40}
            />
          </Field>
          <Field label="Hámarksbreidd innihalds">
            <Select
              value={String(p.maxWidth ?? "wide")}
              onChange={(v) => set({ maxWidth: v })}
              options={[
                { value: "narrow", label: "Mjó" },
                { value: "medium", label: "Miðlungs" },
                { value: "wide", label: "Breið" },
                { value: "full", label: "Full breidd" },
              ]}
            />
          </Field>
        </>
      );

    case "columns":
      return (
        <>
          <Field label="Fjöldi dálka">
            <Select
              value={String(p.count ?? 2)}
              onChange={(v) => set({ __columns: Number(v) })}
              options={[
                { value: "2", label: "2 dálkar" },
                { value: "3", label: "3 dálkar" },
              ]}
            />
          </Field>
          <Field label="Hlutföll">
            <Select
              value={String(p.ratio ?? "50/50")}
              onChange={(v) => set({ ratio: v })}
              options={
                Number(p.count ?? 2) === 3
                  ? [
                      { value: "33/33/33", label: "Jafnt (1/1/1)" },
                      { value: "50/25/25", label: "50 / 25 / 25" },
                      { value: "25/50/25", label: "25 / 50 / 25" },
                    ]
                  : [
                      { value: "50/50", label: "50 / 50" },
                      { value: "33/67", label: "33 / 67" },
                      { value: "67/33", label: "67 / 33" },
                      { value: "25/75", label: "25 / 75" },
                      { value: "75/25", label: "75 / 25" },
                    ]
              }
            />
          </Field>
          <Field label="Bil milli dálka (px)">
            <NumberInput
              value={Number(p.gap ?? 24)}
              onChange={(v) => set({ gap: v })}
              min={0}
              max={80}
            />
          </Field>
        </>
      );

    default:
      return (
        <p className="text-sm text-muted-foreground">
          Engar stillingar fyrir þessa blokk.
        </p>
      );
  }
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

export function BlockSettingsPanel({
  block,
  onChange,
  onClose,
}: {
  block: Block;
  onChange: (next: Block) => void;
  onClose: () => void;
}) {
  // Apply a props patch. The special `__columns` key rebuilds column children.
  function set(patch: Record<string, unknown>) {
    if ("__columns" in patch) {
      onChange(resizeColumns(block, Number(patch.__columns)));
      return;
    }
    onChange({ ...block, props: { ...block.props, ...patch } });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold">
          Stillingar — {TYPE_LABELS[block.type] ?? block.type}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="-mr-2 flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground md:-mr-1 md:h-8 md:w-8"
          aria-label="Loka"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <BlockFields block={block} set={set} />
      </div>
    </div>
  );
}
