"use client";

import { useEffect, useState } from "react";
import { useFormState } from "react-dom";

import { createCheckout, type DonationState } from "@/app/dona/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/forum/submit-button";
import { DONATION_PRESETS } from "@/lib/content";
import { cn, formatISK } from "@/lib/utils";

export function DonationForm() {
  const [state, formAction] = useFormState<DonationState, FormData>(
    createCheckout,
    undefined,
  );
  const [amount, setAmount] = useState<number>(DONATION_PRESETS[1]);
  const [recurring, setRecurring] = useState(false);
  const [anonymous, setAnonymous] = useState(true);

  // Stripe returns a Checkout URL we redirect the browser to.
  useEffect(() => {
    if (state?.url) window.location.href = state.url;
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      {/* One-time vs monthly */}
      <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-surface/50 p-1">
        <button
          type="button"
          onClick={() => setRecurring(false)}
          className={cn(
            "rounded-lg py-2.5 text-sm font-medium transition-colors",
            !recurring
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Eitt framlag
        </button>
        <button
          type="button"
          onClick={() => setRecurring(true)}
          className={cn(
            "rounded-lg py-2.5 text-sm font-medium transition-colors",
            recurring
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Mánaðarlega
        </button>
      </div>
      <input type="hidden" name="recurring" value={recurring ? "on" : ""} />

      {/* Amount presets */}
      <div className="grid gap-2">
        <Label>Upphæð</Label>
        <div className="grid grid-cols-3 gap-2">
          {DONATION_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmount(preset)}
              className={cn(
                "rounded-lg border py-3 text-sm font-semibold transition-colors",
                amount === preset
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-surface text-foreground hover:border-primary/40",
              )}
            >
              {formatISK(preset)}
            </button>
          ))}
        </div>
        <div className="mt-1">
          <Label htmlFor="custom" className="text-xs text-muted-foreground">
            Eða önnur upphæð (kr.)
          </Label>
          <Input
            id="custom"
            type="number"
            min={500}
            step={100}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="mt-1"
          />
        </div>
      </div>
      <input type="hidden" name="amount" value={amount} />

      {/* Anonymity */}
      <div className="space-y-3">
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            name="anonymous"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-[hsl(var(--primary))]"
          />
          Gefa nafnlaust
        </label>
        {!anonymous && (
          <div className="grid gap-2">
            <Label htmlFor="donorName">Nafn (birtist sem styrktaraðili)</Label>
            <Input id="donorName" name="donorName" placeholder="Nafn þitt" />
          </div>
        )}
      </div>

      {state?.error && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <SubmitButton size="lg" className="w-full">
        {recurring
          ? `Styrkja ${formatISK(amount)} á mánuði`
          : `Styrkja ${formatISK(amount)}`}
      </SubmitButton>
      <p className="text-center text-xs text-muted-foreground">
        Örugg greiðsla í gegnum Stripe. Þú getur hætt mánaðarlegu framlagi hvenær sem er.
      </p>
    </form>
  );
}
