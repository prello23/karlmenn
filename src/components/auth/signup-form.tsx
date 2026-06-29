"use client";

import { useFormState } from "react-dom";
import { MailCheck } from "lucide-react";

import { signUpAction, type SignUpState } from "@/app/(auth)/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/forum/submit-button";

export function SignupForm() {
  const [state, formAction] = useFormState<SignUpState, FormData>(
    signUpAction,
    undefined,
  );

  if (state?.success) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-success/40 bg-success/5 p-8 text-center">
        <MailCheck className="h-10 w-10 text-success" />
        <h3 className="mt-4 text-lg font-semibold">Athugaðu netfangið þitt</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Við sendum þér staðfestingarpóst. Smelltu á linkinn í póstinum til að
          virkja aðganginn. Linkurinn gildir í 48 klukkustundir.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Netfang</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="displayName">Gælunafn (valfrjálst)</Label>
        <Input
          id="displayName"
          name="displayName"
          placeholder="Birtist í samfélaginu"
          maxLength={40}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Lykilorð</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="confirm">Staðfestu lykilorð</Label>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
        />
      </div>

      {state?.error && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <SubmitButton className="w-full">Stofna aðgang</SubmitButton>
    </form>
  );
}
