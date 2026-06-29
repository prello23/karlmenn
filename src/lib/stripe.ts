import Stripe from "stripe";

let stripeClient: Stripe | null = null;

/** Returns a configured Stripe client, or null when no secret key is set. */
export function getStripe(): Stripe | null {
  if (stripeClient) return stripeClient;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  // Use the SDK's pinned API version (omit to avoid version-string drift).
  stripeClient = new Stripe(key);
  return stripeClient;
}

export const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);
