"use client";

import { useState } from "react";
import { Plus, X, PenLine } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NewThreadForm } from "@/components/forum/new-thread-form";

/**
 * Renders a "Búa til nýjan þráð" button. The new-thread form is hidden until
 * the user clicks the button (it does not auto-open). Closing returns to the
 * thread list.
 */
export function ThreadComposer({
  categorySlug,
  restricted,
}: {
  categorySlug: string;
  restricted: boolean;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Búa til nýjan þráð
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PenLine className="h-5 w-5 text-primary" />
              Byrja nýja umræðu
            </CardTitle>
            <CardDescription className="mt-1">
              {restricted
                ? "Þetta svæði krefst samþykkis. Færslur eru yfirfarnar af umsjónarmönnum áður en þær birtast."
                : "Deildu reynslu þinni eða spurningu. Nöfn eru fjarlægð sjálfkrafa."}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
            aria-label="Hætta við"
          >
            <X className="h-4 w-4" />
            Hætta við
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <NewThreadForm categorySlug={categorySlug} />
      </CardContent>
    </Card>
  );
}
