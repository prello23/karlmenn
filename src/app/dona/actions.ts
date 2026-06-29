"use server";

import { z } from "zod";

import { getStripe } from "@/lib/stripe";

const schema = z.object({
  amount: z.coerce.number().int().min(500).max(1_000_000),
  recurring: z.coerce.boolean(),
  anonymous: z.coerce.boolean(),
  donorName: z.string().trim().max(80).optional(),
});

export type DonationState = { error?: string; url?: string } | undefined;

export async function createCheckout(
  _prev: DonationState,
  formData: FormData,
): Promise<DonationState> {
  const parsed = schema.safeParse({
    amount: formData.get("amount"),
    recurring: formData.get("recurring") === "on",
    anonymous: formData.get("anonymous") === "on",
    donorName: formData.get("donorName") || undefined,
  });

  if (!parsed.success) {
    return { error: "Veldu gilda upphæð (a.m.k. 500 kr.)." };
  }

  const stripe = getStripe();
  if (!stripe) {
    return {
      error:
        "Greiðslukerfið er ekki uppsett í þessu umhverfi. Settu STRIPE_SECRET_KEY til að virkja framlög.",
    };
  }

  const { amount, recurring, anonymous, donorName } = parsed.data;
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: recurring ? "subscription" : "payment",
      success_url: `${siteUrl}/dona/takk`,
      cancel_url: `${siteUrl}/dona`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "isk",
            unit_amount: amount,
            recurring: recurring ? { interval: "month" } : undefined,
            product_data: {
              name: recurring
                ? "Mánaðarlegt framlag til ekkieinn.is"
                : "Framlag til ekkieinn.is",
            },
          },
        },
      ],
      metadata: {
        anonymous: String(anonymous),
        donorName: anonymous ? "" : donorName ?? "",
      },
    });

    if (!session.url) return { error: "Ekki tókst að hefja greiðslu." };
    return { url: session.url };
  } catch {
    return { error: "Villa kom upp við að hefja greiðslu. Reyndu aftur." };
  }
}
