"use client";

import { useFormState } from "react-dom";
import { CheckCircle2 } from "lucide-react";

import { updateProfile, type ProfileState } from "@/app/stillingar/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/forum/submit-button";

export function ProfileForm({
  displayName,
  isAnonymous,
}: {
  displayName: string;
  isAnonymous: boolean;
}) {
  const [state, formAction] = useFormState<ProfileState, FormData>(
    updateProfile,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-2">
        <Label htmlFor="displayName">Gælunafn</Label>
        <Input
          id="displayName"
          name="displayName"
          defaultValue={displayName}
          placeholder="Birtist í samfélaginu"
          maxLength={40}
        />
        <p className="text-xs text-muted-foreground">
          Þetta nafn birtist við færslur þínar. Skildu eftir autt til að vera
          „Nafnlaus“.
        </p>
      </div>

      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="isAnonymous"
          defaultChecked={isAnonymous}
          className="mt-0.5 h-4 w-4 rounded border-border accent-[hsl(var(--primary))]"
        />
        <span>
          <span className="font-medium text-foreground">Halda mér nafnlausum</span>
          <br />
          <span className="text-muted-foreground">
            Færslur þínar birtast án auðkennis.
          </span>
        </span>
      </label>

      {state?.success && (
        <p className="inline-flex items-center gap-2 rounded-lg border border-success/40 bg-success/10 px-3 py-2 text-sm text-success">
          <CheckCircle2 className="h-4 w-4" />
          Vistað.
        </p>
      )}
      {state?.error && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <SubmitButton>Vista breytingar</SubmitButton>
    </form>
  );
}
