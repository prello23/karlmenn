"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Loader2, Trash2, ArrowLeft } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TipTapEditor } from "@/components/admin/tiptap-editor";

type PageData = {
  id: number;
  slug: string;
  title: string;
  menuTitle: string;
  category: string;
  metaDescription: string;
  content: string;
};

const CATEGORY_OPTIONS = [
  { value: "", label: "Enginn flokkur" },
  { value: "about", label: "Um okkur (about)" },
  { value: "legal", label: "Lögfræðilegt (legal)" },
  { value: "contact", label: "Samband (contact)" },
];

/** Map a page slug to its public URL. */
function publicHref(slug: string): string {
  return slug === "forsida" ? "/" : `/${slug}`;
}

export function PageEditor({ page }: { page?: PageData }) {
  const router = useRouter();
  const isEdit = Boolean(page);

  const [slug, setSlug] = useState(page?.slug ?? "");
  const [title, setTitle] = useState(page?.title ?? "");
  const [menuTitle, setMenuTitle] = useState(page?.menuTitle ?? "");
  const [category, setCategory] = useState(page?.category ?? "");
  const [metaDescription, setMetaDescription] = useState(
    page?.metaDescription ?? "",
  );
  const [content, setContent] = useState(page?.content ?? "");

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(
        isEdit ? `/api/admin/pages/${page!.id}` : "/api/admin/pages",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(
            isEdit
              ? { title, menuTitle, category, metaDescription, content }
              : { slug, title, menuTitle, category, metaDescription, content },
          ),
        },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Ekki tókst að vista.");
        return;
      }
      if (isEdit) {
        setSaved(true);
        router.refresh();
      } else {
        router.push("/admin/pages");
        router.refresh();
      }
    } catch {
      setError("Villa kom upp.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!page) return;
    if (!confirm(`Eyða síðunni „${page.menuTitle}“? Þetta er ekki hægt að afturkalla.`))
      return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/pages/${page.id}`, { method: "DELETE" });
      if (!res.ok) {
        setError("Ekki tókst að eyða.");
        return;
      }
      router.push("/admin/pages");
      router.refresh();
    } catch {
      setError("Villa kom upp.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/pages"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Til baka í síður
        </Link>
        {isEdit && (
          <Link
            href={publicHref(slug)}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            Skoða síðu
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      <div className="grid gap-4">
        {!isEdit && (
          <div className="grid gap-2">
            <Label htmlFor="slug">Slóð (slug)</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="t.d. um-okkur"
            />
          </div>
        )}

        <div className="grid gap-2">
          <Label htmlFor="title">Titill síðu (birtist í vafraflipa)</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="menuTitle">Heiti í valmynd</Label>
          <Input
            id="menuTitle"
            value={menuTitle}
            onChange={(e) => setMenuTitle(e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="category">Flokkur</Label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="metaDescription">Lýsing fyrir leitarvélar</Label>
          <Input
            id="metaDescription"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label>Efni síðunnar</Label>
          <TipTapEditor
            value={content}
            onChange={setContent}
            
          />
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      {saved && (
        <p className="rounded-lg border border-success/40 bg-success/10 px-3 py-2 text-sm text-success">
          Breytingar vistaðar.
        </p>
      )}

      <div className="flex items-center justify-between gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? "Vista breytingar" : "Búa til síðu"}
        </Button>

        {isEdit && (
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Eyða síðu
          </Button>
        )}
      </div>
    </div>
  );
}
