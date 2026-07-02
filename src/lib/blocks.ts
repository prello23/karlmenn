// Block-based page builder data model (V5). Plain module (no server/client
// directive) so it can be imported from server components, client editor code
// and the public renderer alike.

/** Every block type the page builder knows about. `column` is an internal
 * container type used only inside a `columns` block (not offered in the add
 * menu). */
export type BlockType =
  | "section"
  | "columns"
  | "column"
  | "text"
  | "button"
  | "image"
  | "spacer"
  | "counter"
  | "divider"
  | "card"
  | "html";

export interface Block {
  id: string;
  type: BlockType;
  props: Record<string, unknown>;
  children?: Block[];
}

/** Top-of-page layout settings stored alongside the block array. */
export interface PageSettings {
  bg: string; // "" = inherit site background
  maxWidth: "narrow" | "medium" | "wide" | "full";
  padding: number; // vertical page padding in px
}

/** The full serialised shape stored in Page.content when contentVersion === 2. */
export interface PageDocument {
  blocks: Block[];
  settings: PageSettings;
}

export const DEFAULT_PAGE_SETTINGS: PageSettings = {
  bg: "",
  maxWidth: "medium",
  padding: 48,
};

export const MAX_WIDTH_PX: Record<PageSettings["maxWidth"], string> = {
  narrow: "42rem",
  medium: "48rem",
  wide: "72rem",
  full: "100%",
};

/** Preset font-size tokens shared by text/counter blocks. */
export const FONT_SIZES: Record<string, string> = {
  sm: "0.875rem",
  md: "1rem",
  lg: "1.25rem",
  xl: "1.5rem",
  "2xl": "2rem",
  "3xl": "2.75rem",
};

export const FONT_FAMILIES: { value: string; label: string }[] = [
  { value: "", label: "Sjálfgefið" },
  { value: "Inter, sans-serif", label: "Inter" },
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "'Times New Roman', serif", label: "Times" },
  { value: "'Courier New', monospace", label: "Courier" },
  { value: "Verdana, sans-serif", label: "Verdana" },
  { value: "Tahoma, sans-serif", label: "Tahoma" },
];

/** Generate a unique id. Uses crypto.randomUUID where available. */
export function uid(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch {
    /* fall through */
  }
  return `b_${Math.floor(performance.now() * 1000).toString(36)}_${Math.floor(
    performance.now() % 1,
  )
    .toString(36)
    .slice(2)}`;
}

/** Default props for a freshly-created block of a given type. */
export function defaultBlock(type: BlockType): Block {
  const base: Block = { id: uid(), type, props: {} };
  switch (type) {
    case "text":
      return {
        ...base,
        props: {
          html: "Skrifaðu texta hér…",
          level: "p",
          fontFamily: "",
          fontSize: "md",
          color: "",
          align: "left",
        },
      };
    case "button":
      return {
        ...base,
        props: {
          text: "Smelltu hér",
          url: "#",
          style: "primary",
          size: "md",
          align: "left",
          radius: 10,
          bg: "",
          color: "",
          border: "",
        },
      };
    case "image":
      return {
        ...base,
        props: { src: "", alt: "", width: 100, align: "center", radius: 8, href: "" },
      };
    case "spacer":
      return { ...base, props: { height: 32 } };
    case "divider":
      return { ...base, props: { color: "", thickness: 1, margin: 16 } };
    case "counter":
      return {
        ...base,
        props: {
          label: "sögur deildar",
          fontSize: "3xl",
          numberColor: "",
          labelColor: "",
          ctaText: "",
          ctaUrl: "",
          cta2Text: "",
          cta2Url: "",
          align: "center",
        },
      };
    case "html":
      return { ...base, props: { html: "<!-- HTML hér -->" } };
    case "card":
      return {
        ...base,
        props: {
          bg: "",
          border: true,
          padding: 24,
          shadow: false,
          radius: 12,
        },
        children: [defaultBlock("text")],
      };
    case "section":
      return {
        ...base,
        props: {
          bg: "",
          bgImage: "",
          padY: 40,
          padX: 24,
          radius: 0,
          maxWidth: "wide",
        },
        children: [defaultBlock("text")],
      };
    case "columns":
      return {
        ...base,
        props: { count: 2, ratio: "50/50", gap: 24 },
        children: [
          { id: uid(), type: "column", props: {}, children: [] },
          { id: uid(), type: "column", props: {}, children: [] },
        ],
      };
    case "column":
      return { ...base, type: "column", props: {}, children: [] };
    default:
      return base;
  }
}

/** Types that can hold child blocks. */
export const CONTAINER_TYPES: BlockType[] = ["section", "card", "column"];

/** Rebuild a columns block's children to match a target column count,
 * preserving existing column contents where possible. */
export function resizeColumns(block: Block, count: number): Block {
  const existing = block.children ?? [];
  const children: Block[] = [];
  for (let i = 0; i < count; i++) {
    children.push(
      existing[i] ?? { id: uid(), type: "column", props: {}, children: [] },
    );
  }
  // If shrinking, append the dropped columns' blocks into the last column so
  // nothing is silently lost.
  if (existing.length > count) {
    const overflow = existing
      .slice(count)
      .flatMap((c) => c.children ?? []);
    const last = children[count - 1];
    last.children = [...(last.children ?? []), ...overflow];
  }
  return { ...block, props: { ...block.props, count }, children };
}

// ---- Serialisation / migration ---------------------------------------------

/** Parse stored Page.content into a PageDocument. Accepts either a JSON block
 * document (v2) or a legacy HTML string (v1 → wrapped in a single html block). */
export function parseDocument(
  content: string,
  contentVersion: number,
): PageDocument {
  if (contentVersion === 2) {
    try {
      const parsed = JSON.parse(content) as Partial<PageDocument>;
      if (parsed && Array.isArray(parsed.blocks)) {
        return {
          blocks: parsed.blocks,
          settings: { ...DEFAULT_PAGE_SETTINGS, ...(parsed.settings ?? {}) },
        };
      }
    } catch {
      /* fall through to legacy handling */
    }
  }
  // Legacy: wrap the existing HTML (if any) in a single html block so the page
  // keeps rendering exactly as before, and can be edited/extended in V5. Legacy
  // pages were rendered full-bleed with no outer padding (DbPageFull), so the
  // migrated document uses full-width, zero-padding settings to match exactly.
  const blocks: Block[] = content.trim()
    ? [{ id: uid(), type: "html", props: { html: content } }]
    : [];
  return {
    blocks,
    settings: content.trim()
      ? { bg: "", maxWidth: "full", padding: 0 }
      : { ...DEFAULT_PAGE_SETTINGS },
  };
}

/** Serialise a PageDocument for storage. */
export function serializeDocument(doc: PageDocument): string {
  return JSON.stringify(doc);
}
