"use client";

import { useEffect, useRef, useState } from "react";
import {
  X,
  Upload,
  Trash2,
  Loader2,
  // ---- catalogue icons (must match LUCIDE_ICONS in @/lib/icons) ----
  Heart,
  Users,
  UserPlus,
  HandHeart,
  Shield,
  ShieldCheck,
  Star,
  Award,
  Handshake,
  Phone,
  PhoneCall,
  AlertTriangle,
  Siren,
  LifeBuoy,
  Cross,
  Ambulance,
  HeartPulse,
  MessageCircle,
  Mail,
  Send,
  Globe,
  Link as LinkIcon,
  ExternalLink,
  Home,
  BookOpen,
  FileText,
  CheckCircle,
  ArrowRight,
  Clock,
  Calendar,
  MapPin,
  Lock,
  Unlock,
  Eye,
  Settings,
  Info,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  ICON_COLORS,
  ICON_SIZES,
  LUCIDE_CATEGORIES,
  type IconSizeKey,
} from "@/lib/icons";

// Maps catalogue names -> the actual Lucide component. "Link" is aliased to
// avoid clashing with next/link naming conventions elsewhere.
const ICON_MAP: Record<string, LucideIcon> = {
  Heart,
  Users,
  UserPlus,
  HandHeart,
  Shield,
  ShieldCheck,
  Star,
  Award,
  Handshake,
  Phone,
  PhoneCall,
  AlertTriangle,
  Siren,
  LifeBuoy,
  Cross,
  Ambulance,
  HeartPulse,
  MessageCircle,
  Mail,
  Send,
  Globe,
  Link: LinkIcon,
  ExternalLink,
  Home,
  BookOpen,
  FileText,
  CheckCircle,
  ArrowRight,
  Clock,
  Calendar,
  MapPin,
  Lock,
  Unlock,
  Eye,
  Settings,
  Info,
  HelpCircle,
};

type IconEntry = { name: string; path: string; type: string };
type IconData = { logos: IconEntry[]; custom: IconEntry[]; lucide: string[] };

type Selection =
  | { kind: "lucide"; iconName: string }
  | { kind: "logo" | "custom"; entry: IconEntry };

type Tab = "logos" | "lucide" | "custom";

const SIZE_KEYS = Object.keys(ICON_SIZES) as IconSizeKey[];

export function IconPicker({
  mode = "insert",
  onClose,
  onInsert,
}: {
  mode?: "insert" | "replace";
  onClose: () => void;
  onInsert: (html: string) => void;
}) {
  const [tab, setTab] = useState<Tab>("logos");
  const [data, setData] = useState<IconData>({ logos: [], custom: [], lucide: [] });
  const [selected, setSelected] = useState<Selection | null>(null);
  const [sizeKey, setSizeKey] = useState<IconSizeKey | "custom">("L");
  const [customPx, setCustomPx] = useState(96);
  const [color, setColor] = useState(ICON_COLORS[0].value);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hiddenRef = useRef<HTMLDivElement>(null);
  const logoFileRef = useRef<HTMLInputElement>(null);
  const customFileRef = useRef<HTMLInputElement>(null);

  const px =
    sizeKey === "custom"
      ? Math.min(256, Math.max(16, customPx || 64))
      : ICON_SIZES[sizeKey];

  async function loadIcons() {
    try {
      const res = await fetch("/api/admin/icons");
      if (res.ok) setData(await res.json());
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    loadIcons();
  }, []);

  // Pick a sensible default size when selecting a new icon.
  function select(sel: Selection) {
    setSelected(sel);
    setSizeKey(sel.kind === "lucide" ? "M" : "L");
  }

  async function handleUpload(file: File, dest: "logos" | "custom") {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("dest", dest);
      const res = await fetch("/api/admin/icons/upload", {
        method: "POST",
        body: fd,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error ?? "Upphleðsla mistókst.");
        return;
      }
      await loadIcons();
      select({ kind: dest === "logos" ? "logo" : "custom", entry: body });
    } catch {
      setError("Upphleðsla mistókst.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteCustom(entry: IconEntry) {
    try {
      await fetch(`/api/admin/icons/custom/${encodeURIComponent(entry.name)}`, {
        method: "DELETE",
      });
      if (selected?.kind === "custom" && selected.entry.name === entry.name) {
        setSelected(null);
      }
      await loadIcons();
    } catch {
      /* ignore */
    }
  }

  function buildHtml(): string | null {
    if (!selected) return null;

    if (selected.kind === "lucide") {
      // The hidden container always renders the current selection at the
      // chosen size/color, so we can lift its SVG markup directly.
      const svg = hiddenRef.current?.querySelector("svg");
      if (!svg) return null;
      const clone = svg.cloneNode(true) as SVGElement;
      clone.setAttribute("width", String(px));
      clone.setAttribute("height", String(px));
      clone.classList.add("editor-icon");
      clone.setAttribute("data-icon-name", selected.iconName);
      clone.setAttribute("data-icon-type", "lucide");
      const markup = clone.outerHTML;
      return `<span class="icon-wrapper" style="display:inline-block;vertical-align:middle;">${markup}</span>`;
    }

    // Logo / custom — inserted as <img>.
    const { entry, kind } = selected;
    return `<img src="${entry.path}" width="${px}" height="${px}" class="editor-icon" data-icon-type="${kind}" data-icon-name="${entry.name}" style="display:inline-block;vertical-align:middle;object-fit:contain;" alt="${entry.name}" />`;
  }

  function handleInsert() {
    const html = buildHtml();
    if (!html) {
      setError("Veldu ikon fyrst.");
      return;
    }
    onInsert(html);
    onClose();
  }

  const SelectedLucide =
    selected?.kind === "lucide" ? ICON_MAP[selected.iconName] : null;

  return (
    <div className="fixed inset-0 z-[60] flex items-stretch justify-center bg-background/80 p-0 sm:items-center sm:p-4">
      <div className="flex h-full w-full flex-col overflow-hidden border-border bg-card shadow-xl sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-xl sm:border">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-lg font-semibold">
            {mode === "replace" ? "Skipta um ikon" : "Setja inn ikon"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Loka"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border px-2">
          {(
            [
              ["logos", "Lógó"],
              ["lucide", "Ikon"],
              ["custom", "Sérsniðið"],
            ] as [Tab, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                "border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                tab === key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Grid area */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {tab === "logos" && (
            <>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {data.logos.map((entry) => (
                  <Tile
                    key={entry.path}
                    label={entry.name}
                    active={
                      selected?.kind === "logo" && selected.entry.path === entry.path
                    }
                    onClick={() => select({ kind: "logo", entry })}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={entry.path}
                      alt={entry.name}
                      className="h-12 w-12 object-contain"
                    />
                  </Tile>
                ))}
                <UploadTile
                  label="Hlaða upp lógói"
                  uploading={uploading}
                  onClick={() => logoFileRef.current?.click()}
                />
              </div>
              <input
                ref={logoFileRef}
                type="file"
                accept="image/png,image/svg+xml,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUpload(f, "logos");
                  e.target.value = "";
                }}
              />
            </>
          )}

          {tab === "lucide" &&
            LUCIDE_CATEGORIES.map((cat) => (
              <div key={cat.key} className="mb-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {cat.label}
                </p>
                <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                  {cat.icons.map((name) => {
                    const Icon = ICON_MAP[name];
                    if (!Icon) return null;
                    return (
                      <Tile
                        key={name}
                        label={name}
                        active={
                          selected?.kind === "lucide" && selected.iconName === name
                        }
                        onClick={() => select({ kind: "lucide", iconName: name })}
                      >
                        <Icon className="h-7 w-7 text-foreground" />
                      </Tile>
                    );
                  })}
                </div>
              </div>
            ))}

          {tab === "custom" && (
            <>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {data.custom.map((entry) => (
                  <div key={entry.path} className="group relative">
                    <Tile
                      label={entry.name}
                      active={
                        selected?.kind === "custom" &&
                        selected.entry.path === entry.path
                      }
                      onClick={() => select({ kind: "custom", entry })}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={entry.path}
                        alt={entry.name}
                        className="h-12 w-12 object-contain"
                      />
                    </Tile>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCustom(entry);
                      }}
                      className="absolute right-1 top-1 hidden rounded-md bg-destructive p-1 text-destructive-foreground group-hover:block"
                      aria-label="Eyða"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <UploadTile
                  label="Hlaða upp"
                  uploading={uploading}
                  onClick={() => customFileRef.current?.click()}
                />
              </div>
              <input
                ref={customFileRef}
                type="file"
                accept="image/png,image/svg+xml,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUpload(f, "custom");
                  e.target.value = "";
                }}
              />
            </>
          )}
        </div>

        {/* Controls + footer */}
        <div className="border-t border-border p-4">
          {/* Size selector */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Stærð:</span>
            {SIZE_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setSizeKey(key)}
                className={cn(
                  "h-8 min-w-9 rounded-full px-3 text-xs font-semibold transition-colors",
                  sizeKey === key
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface text-foreground hover:bg-secondary",
                )}
              >
                {key}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSizeKey("custom")}
              className={cn(
                "h-8 rounded-full px-3 text-xs font-semibold transition-colors",
                sizeKey === "custom"
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface text-foreground hover:bg-secondary",
              )}
            >
              Sérsniðið
            </button>
            {sizeKey === "custom" && (
              <span className="inline-flex items-center gap-1">
                <input
                  type="number"
                  min={16}
                  max={256}
                  value={customPx}
                  onChange={(e) => setCustomPx(Number(e.target.value))}
                  className="h-8 w-20 rounded-md border border-input bg-surface px-2 text-sm"
                />
                <span className="text-xs text-muted-foreground">px</span>
              </span>
            )}
          </div>

          {/* Color selector (Lucide icons only) */}
          {selected?.kind === "lucide" && (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Litur:</span>
              {ICON_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  title={c.label}
                  onClick={() => setColor(c.value)}
                  className={cn(
                    "h-7 w-7 rounded-full border-2 transition-transform",
                    color.toLowerCase() === c.value.toLowerCase()
                      ? "border-primary scale-110"
                      : "border-border",
                  )}
                  style={{ backgroundColor: c.value }}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-7 w-9 cursor-pointer rounded border border-border bg-transparent"
                aria-label="Sérsniðinn litur"
              />
            </div>
          )}

          {error && <p className="mb-2 text-sm text-destructive">{error}</p>}

          <div className="flex items-center justify-between gap-3">
            <span className="truncate text-xs text-muted-foreground">
              {selected
                ? selected.kind === "lucide"
                  ? `${selected.iconName} · ${px}px`
                  : `${selected.entry.name} · ${px}px`
                : "Ekkert valið"}
            </span>
            <button
              type="button"
              onClick={handleInsert}
              disabled={!selected}
              className="inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {mode === "replace" ? "Skipta" : "Setja inn"}
            </button>
          </div>
        </div>
      </div>

      {/* Hidden render target — holds the current Lucide selection so we can
          read its rendered SVG markup on insert. */}
      <div ref={hiddenRef} className="pointer-events-none absolute opacity-0" aria-hidden>
        {SelectedLucide && <SelectedLucide size={px} color={color} />}
      </div>
    </div>
  );
}

function Tile({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-[72px] flex-col items-center justify-center gap-1.5 rounded-lg border p-2 transition-all",
        active
          ? "border-primary bg-primary/10 shadow-[0_0_0_2px_rgba(245,158,11,0.35)]"
          : "border-border bg-surface hover:border-primary/50",
      )}
    >
      {children}
      <span className="w-full truncate text-center text-[10px] text-muted-foreground">
        {label}
      </span>
    </button>
  );
}

function UploadTile({
  label,
  uploading,
  onClick,
}: {
  label: string;
  uploading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={uploading}
      className="flex min-h-[72px] flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border bg-surface/40 p-2 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground disabled:opacity-50"
    >
      {uploading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Upload className="h-5 w-5" />
      )}
      <span className="text-[10px]">{label}</span>
    </button>
  );
}
