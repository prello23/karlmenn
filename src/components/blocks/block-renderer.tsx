import type { CSSProperties, ReactNode } from "react";

import {
  type Block,
  type PageSettings,
  FONT_SIZES,
  MAX_WIDTH_PX,
} from "@/lib/blocks";
import { SOGUR_TELJARI, injectCounterMounts } from "@/lib/shortcodes";
import { PageContent } from "@/components/page-content";
import { ConfiguredCounter } from "@/components/blocks/configured-counter";

/** Parse a column ratio string ("50/50", "33/67", "33/33/33") into a CSS
 * grid-template-columns value. Falls back to equal columns. */
function ratioToGridColumns(ratio: string, count: number): string {
  const parts = String(ratio || "")
    .split("/")
    .map((n) => parseFloat(n))
    .filter((n) => !Number.isNaN(n) && n > 0);
  if (parts.length === count) return parts.map((n) => `${n}fr`).join(" ");
  return `repeat(${count}, minmax(0, 1fr))`;
}

function alignClass(align: unknown): string {
  if (align === "center") return "text-center";
  if (align === "right") return "text-right";
  return "text-left";
}

function flexAlign(align: unknown): CSSProperties["justifyContent"] {
  if (align === "center") return "center";
  if (align === "right") return "flex-end";
  return "flex-start";
}

/** Render a single block (and its children) to JSX. `editor` disables live
 * behaviour (counter fetch) so the same component can preview blocks in the
 * admin canvas. */
export function renderBlock(block: Block, editor = false): ReactNode {
  const p = block.props ?? {};

  switch (block.type) {
    case "text": {
      const size = FONT_SIZES[String(p.fontSize)] ?? String(p.fontSize || "1rem");
      const style: CSSProperties = {
        fontFamily: (p.fontFamily as string) || undefined,
        fontSize: size,
        color: (p.color as string) || undefined,
      };
      const Tag = (["h1", "h2", "h3", "h4", "h5", "h6"].includes(String(p.level))
        ? (p.level as string)
        : "div") as keyof JSX.IntrinsicElements;
      return (
        <Tag
          className={`page-content ${alignClass(p.align)}`}
          style={style}
          dangerouslySetInnerHTML={{ __html: String(p.html ?? "") }}
        />
      );
    }

    case "button": {
      const sizeCls =
        p.size === "sm"
          ? "px-4 py-2 text-sm"
          : p.size === "lg"
            ? "px-8 py-4 text-lg"
            : "px-6 py-3 text-base";
      let styleCls = "";
      const inline: CSSProperties = {
        borderRadius: `${Number(p.radius ?? 10)}px`,
      };
      if (p.bg) inline.background = p.bg as string;
      if (p.color) inline.color = p.color as string;
      if (p.border) {
        inline.borderColor = p.border as string;
        inline.borderWidth = 1;
        inline.borderStyle = "solid";
      }
      if (p.style === "secondary") {
        styleCls =
          "border border-primary text-primary hover:bg-primary/10";
      } else if (p.style === "ghost") {
        styleCls = "text-foreground hover:bg-secondary";
      } else {
        styleCls =
          "bg-primary text-primary-foreground hover:opacity-90";
      }
      return (
        <div style={{ display: "flex", justifyContent: flexAlign(p.align) }}>
          <a
            href={(p.url as string) || "#"}
            className={`inline-flex items-center justify-center font-semibold transition-opacity ${sizeCls} ${styleCls}`}
            style={inline}
          >
            {String(p.text ?? "Takki")}
          </a>
        </div>
      );
    }

    case "image": {
      if (!p.src) {
        return editor ? (
          <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
            Engin mynd valin
          </div>
        ) : null;
      }
      const img = (
        <img
          src={p.src as string}
          alt={(p.alt as string) || ""}
          style={{
            width: `${Number(p.width ?? 100)}%`,
            borderRadius: `${Number(p.radius ?? 8)}px`,
            margin: 0,
          }}
        />
      );
      return (
        <div style={{ display: "flex", justifyContent: flexAlign(p.align) }}>
          {p.href ? (
            <a href={p.href as string} style={{ width: `${Number(p.width ?? 100)}%` }}>
              {img}
            </a>
          ) : (
            img
          )}
        </div>
      );
    }

    case "spacer":
      return <div style={{ height: `${Number(p.height ?? 32)}px` }} aria-hidden />;

    case "divider":
      return (
        <hr
          style={{
            border: 0,
            borderTop: `${Number(p.thickness ?? 1)}px solid ${
              (p.color as string) || "hsl(var(--border))"
            }`,
            margin: `${Number(p.margin ?? 16)}px 0`,
          }}
        />
      );

    case "counter":
      return (
        <ConfiguredCounter
          config={{
            label: p.label as string,
            fontSize: p.fontSize as string,
            numberColor: p.numberColor as string,
            labelColor: p.labelColor as string,
            ctaText: p.ctaText as string,
            ctaUrl: p.ctaUrl as string,
            cta2Text: p.cta2Text as string,
            cta2Url: p.cta2Url as string,
            align: (p.align as "left" | "center" | "right") ?? "center",
          }}
          live={!editor}
        />
      );

    case "html": {
      const html = String(p.html ?? "");
      if (html.includes(SOGUR_TELJARI)) {
        return <PageContent html={injectCounterMounts(html)} />;
      }
      return (
        <div className="page-content" dangerouslySetInnerHTML={{ __html: html }} />
      );
    }

    case "card": {
      const style: CSSProperties = {
        background: (p.bg as string) || "hsl(var(--card))",
        padding: `${Number(p.padding ?? 24)}px`,
        borderRadius: `${Number(p.radius ?? 12)}px`,
      };
      if (p.border) {
        style.border = "1px solid hsl(var(--border))";
      }
      if (p.shadow) {
        style.boxShadow = "0 10px 30px -12px rgba(0,0,0,0.6)";
      }
      return (
        <div style={style} className="flex flex-col gap-4">
          {renderChildren(block, editor)}
        </div>
      );
    }

    case "section": {
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
      const inner = MAX_WIDTH_PX[(p.maxWidth as PageSettings["maxWidth"]) ?? "wide"];
      return (
        <div style={style}>
          <div
            className="mx-auto flex flex-col gap-4"
            style={{ maxWidth: inner, width: "100%" }}
          >
            {renderChildren(block, editor)}
          </div>
        </div>
      );
    }

    case "columns": {
      const count = Number(p.count ?? 2);
      const cols = block.children ?? [];
      return (
        <div
          className="block-columns"
          style={{
            display: "grid",
            gridTemplateColumns: ratioToGridColumns(String(p.ratio ?? ""), count),
            gap: `${Number(p.gap ?? 24)}px`,
          }}
        >
          {cols.map((col) => (
            <div key={col.id} className="flex min-w-0 flex-col gap-4">
              {(col.children ?? []).map((child) => (
                <div key={child.id}>{renderBlock(child, editor)}</div>
              ))}
            </div>
          ))}
        </div>
      );
    }

    default:
      return null;
  }
}

function renderChildren(block: Block, editor: boolean): ReactNode {
  return (block.children ?? []).map((child) => (
    <div key={child.id}>{renderBlock(child, editor)}</div>
  ));
}

/** Render a full block document for a public page. */
export function BlockRenderer({
  blocks,
  settings,
}: {
  blocks: Block[];
  settings: PageSettings;
}) {
  const style: CSSProperties = {
    paddingTop: `${settings.padding}px`,
    paddingBottom: `${settings.padding}px`,
  };
  if (settings.bg) style.background = settings.bg;

  // Full-width pages (incl. migrated legacy HTML) render edge-to-edge with no
  // horizontal gutter, matching the previous full-bleed page behaviour.
  const full = settings.maxWidth === "full";

  return (
    <div style={style}>
      <div
        className={`mx-auto flex w-full flex-col gap-6 ${full ? "" : "px-4"}`}
        style={{ maxWidth: MAX_WIDTH_PX[settings.maxWidth] }}
      >
        {blocks.map((block) => (
          <div key={block.id}>{renderBlock(block, false)}</div>
        ))}
      </div>
    </div>
  );
}
