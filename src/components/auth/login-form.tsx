"use client";

import { useFormState } from "react-dom";

import { loginAction, resendAction, type LoginState } from "@/app/(auth)/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/forum/submit-button";

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, formAction] = useFormState<LoginState, FormData>(
    loginAction,
    undefined,
  );
  const [resendState, resendFormAction] = useFormState(resendAction, undefined);

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-4">
        {callbackUrl && (
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
        )}
        <div className="grid gap-2">
          <Label htmlFor="email">Netfang</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Lykilorð</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>

        {state?.error && (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </p>
        )}

        <SubmitButton className="w-full">Innskrá</SubmitButton>
      </form>

      {state?.unverified && (
        <form
          action={resendFormAction}
          className="rounded-lg border border-border bg-surface/50 p-4 text-sm"
        >
          <input type="hidden" name="email" value={state.email} />
          <p className="text-muted-foreground">
            Fékkstu ekki staðfestingarpóstinn?
          </p>
          {resendState?.sent ? (
            <p className="mt-2 font-medium text-success">
              Nýr staðfestingarpóstur hefur verið sendur.
            </p>
          ) : (
            <button
              type="submit"
              className="mt-2 font-medium text-primary hover:underline"
            >
              Senda staðfestingarpóst aftur
            </button>
          )}
        </form>
      )}
    </div>
  );
}
