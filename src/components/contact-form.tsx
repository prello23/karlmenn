"use client";

import { useFormState } from "react-dom";
import { CheckCircle2 } from "lucide-react";

import { sendContact, type ContactState } from "@/app/samband/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/forum/submit-button";

export function ContactForm() {
  const [state, formAction] = useFormState<ContactState, FormData>(
    sendContact,
    undefined,
  );

  if (state?.success) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-success/40 bg-success/5 p-8 text-center">
        <CheckCircle2 className="h-10 w-10 text-success" />
        <h3 className="mt-4 text-lg font-semibold">Skilaboð send</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Takk fyrir að hafa samband. Við svörum eins fljótt og hægt er.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Nafn (valfrjálst)</Label>
        <Input id="name" name="name" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Netfang</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="message">Skilaboð</Label>
        <Textarea id="message" name="message" required />
      </div>

      {state?.error && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <SubmitButton>Senda skilaboð</SubmitButton>
    </form>
  );
}
