"use client";

import { useFormState } from "react-dom";
import { CheckCircle2 } from "lucide-react";

import { submitSupportRequest, type SupportState } from "@/app/studningur/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/forum/submit-button";

export function SupportRequestForm() {
  const [state, formAction] = useFormState<SupportState, FormData>(
    submitSupportRequest,
    undefined,
  );

  if (state?.success) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-success/40 bg-success/5 p-8 text-center">
        <CheckCircle2 className="h-10 w-10 text-success" />
        <h3 className="mt-4 text-lg font-semibold">Beiðnin móttekin</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Takk fyrir að hafa samband. Við förum yfir beiðnina og höfum samband
          eins fljótt og hægt er. Þú ert ekki einn.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="type">Tegund aðstoðar</Label>
        <select
          id="type"
          name="type"
          required
          className="flex h-10 w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          defaultValue="LEGAL"
        >
          <option value="LEGAL">Lögfræðileg aðstoð</option>
          <option value="PSYCH">Sálfræðileg aðstoð</option>
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="name">Nafn (valfrjálst)</Label>
          <Input id="name" name="name" placeholder="Nafn eða gælunafn" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Netfang (valfrjálst)</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="svo við getum svarað"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Lýstu stöðunni</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Segðu okkur stuttlega hvað er í gangi og hvers konar aðstoð þú þarft."
          required
        />
      </div>

      {state?.error && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <SubmitButton>Senda beiðni</SubmitButton>
      <p className="text-xs text-muted-foreground">
        Trúnaður. Beiðnin fer eingöngu til umsjónarmanna verkefnisins.
      </p>
    </form>
  );
}
