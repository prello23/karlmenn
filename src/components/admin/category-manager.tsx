"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { Pencil, Trash2, Plus, X } from "lucide-react";

import {
  createCategory,
  updateCategory,
  deleteCategory,
  type CategoryState,
} from "@/app/admin/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/forum/submit-button";

type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  restricted: boolean;
  _count: { threads: number };
};

function Fields({
  defaults,
}: {
  defaults?: Partial<Category>;
}) {
  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-[80px_1fr] gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="icon">Tákn</Label>
          <Input
            id="icon"
            name="icon"
            defaultValue={defaults?.icon ?? "💬"}
            maxLength={8}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="name">Nafn</Label>
          <Input id="name" name="name" defaultValue={defaults?.name} required />
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="slug">Slóð (slug)</Label>
        <Input
          id="slug"
          name="slug"
          defaultValue={defaults?.slug}
          placeholder="t.d. almennt"
          required
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="description">Lýsing</Label>
        <Input
          id="description"
          name="description"
          defaultValue={defaults?.description}
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="restricted"
          defaultChecked={defaults?.restricted}
          className="h-4 w-4 rounded border-border accent-[hsl(var(--primary))]"
        />
        Krefst umsóknar (lokaður flokkur)
      </label>
    </div>
  );
}

function EditRow({
  category,
  onDone,
}: {
  category: Category;
  onDone: () => void;
}) {
  const [state, formAction] = useFormState<CategoryState, FormData>(
    async (prev, fd) => {
      const result = await updateCategory(prev, fd);
      if (result === undefined) onDone();
      return result;
    },
    undefined,
  );

  return (
    <form action={formAction} className="rounded-xl border border-primary/30 bg-surface/40 p-4">
      <input type="hidden" name="id" value={category.id} />
      <Fields defaults={category} />
      {state?.error && (
        <p className="mt-2 text-sm text-destructive">{state.error}</p>
      )}
      <div className="mt-3 flex gap-2">
        <SubmitButton size="sm">Vista</SubmitButton>
        <Button type="button" size="sm" variant="ghost" onClick={onDone}>
          <X className="h-4 w-4" />
          Hætta við
        </Button>
      </div>
    </form>
  );
}

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [addState, addAction] = useFormState<CategoryState, FormData>(
    async (prev, fd) => {
      const result = await createCategory(prev, fd);
      if (result === undefined) setAdding(false);
      return result;
    },
    undefined,
  );

  return (
    <div className="space-y-3">
      {categories.map((category) =>
        editing === category.id ? (
          <EditRow
            key={category.id}
            category={category}
            onDone={() => setEditing(null)}
          />
        ) : (
          <div
            key={category.id}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
          >
            <span className="text-2xl">{category.icon}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{category.name}</span>
                <span className="text-xs text-muted-foreground">
                  /{category.slug}
                </span>
                {category.restricted && (
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">
                    lokaður
                  </span>
                )}
              </div>
              <p className="truncate text-sm text-muted-foreground">
                {category.description}
              </p>
            </div>
            <span className="hidden text-xs text-muted-foreground sm:block">
              {category._count.threads} þræðir
            </span>
            <button
              type="button"
              onClick={() => setEditing(category.id)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Breyta"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <form action={deleteCategory}>
              <input type="hidden" name="id" value={category.id} />
              <button
                type="submit"
                className="text-muted-foreground hover:text-destructive"
                aria-label="Eyða"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </form>
          </div>
        ),
      )}

      {adding ? (
        <form
          action={addAction}
          className="rounded-xl border border-primary/30 bg-surface/40 p-4"
        >
          <Fields />
          {addState?.error && (
            <p className="mt-2 text-sm text-destructive">{addState.error}</p>
          )}
          <div className="mt-3 flex gap-2">
            <SubmitButton size="sm">Bæta við</SubmitButton>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setAdding(false)}
            >
              Hætta við
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="outline" onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4" />
          Nýr flokkur
        </Button>
      )}
    </div>
  );
}
