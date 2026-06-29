import { NextResponse } from "next/server";

import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// Stripe webhook to record completed donations. No-op unless Stripe + the
// webhook secret are configured.
export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ received: true });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await req.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as {
      id: string;
      amount_total: number | null;
      currency: string | null;
      mode: string;
      metadata: Record<string, string> | null;
    };
    try {
      await prisma.donation.create({
        data: {
          amount: session.amount_total ?? 0,
          currency: session.currency ?? "isk",
          stripePaymentId: session.id,
          isRecurring: session.mode === "subscription",
          isAnonymous: session.metadata?.anonymous !== "false",
          donorName: session.metadata?.donorName || null,
        },
      });
    } catch {
      // ignore duplicates / db errors — acknowledge to Stripe regardless
    }
  }

  return NextResponse.json({ received: true });
}
