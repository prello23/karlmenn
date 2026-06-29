# SPEC: /styrkja - Custom Donation Page for ekkieinn.is

## Overview
Build a beautiful, professional `/styrkja` donation page on ekkieinn.is (Next.js 15 + Prisma).
This page allows visitors to donate to support the ekkieinn.is community using Stripe Checkout.

## Stripe Details
- Account ID: `acct_1RSgvCDaOPqcVGCv`
- Account name: ekkieinn.is
- Currency: **ISK** (Icelandic króna)
- Note: Test keys are already in `.env` on the server. Live keys will be available after Stripe account activation.

## Environment Variables
These are already in `.env` on the server (`/home/deploy/karlmenn/.env`):
```
STRIPE_SECRET_KEY=<already set>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<already set>
NEXT_PUBLIC_BASE_URL=https://ekkieinn.is
```

## Package Dependencies
Install Stripe npm package:
```bash
npm install stripe @stripe/stripe-js
```

## Page: `/styrkja` (app/styrkja/page.tsx)

### Design
- Full-page, modern, clean design
- Dark/warm color scheme matching ekkieinn.is site
- Hero section at top with title and description
- Preset amount buttons + custom amount input
- Clear call-to-action button
- Thank you/impact section below
- Mobile-responsive

### Content (Icelandic)
- Title: **"Styrktu okkur"**
- Subtitle: **"Þín stuðningur skiptir máli"**
- Description: "Ekkieinn.is er samfélag og stuðningsvettvangur fyrir karlmenn sem hafa upplifað ofbeldi eða rangar sakargiftir. Með styrk þínum hjálpar þú okkur að halda þessari þjónustu gangandi og styðja þá sem þurfa á henni að halda."
- Impact section title: "Hvað gerist með styrkinn?"
- Impact items:
  1. "Rekstrarkostnaður vefsvæðisins"
  2. "Stuðningur við sálfræðiþjónustu"
  3. "Lögfræðiráðgjöf fyrir þurfandi"

### Preset Amounts (ISK)
- **1.000 kr** — label: "Lítill stuðningur"
- **2.500 kr** — label: "Góður stuðningur" (highlighted/recommended)
- **5.000 kr** — label: "Stór stuðningur"
- **Custom** — text input for custom ISK amount (minimum 500 kr)

### Checkout Button
Text: "Greiða með korti →"
Disabled when no amount selected.

## API Route: `/api/donate/route.ts`

Creates a Stripe Checkout Session:

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const { amount } = await request.json(); // amount in ISK (integer)
  
  // Validate amount (minimum 500 ISK)
  if (!amount || amount < 500) {
    return Response.json({ error: 'Invalid amount' }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'isk',
          product_data: {
            name: 'Styrkur til ekkieinn.is',
            description: 'Stuðningur við samfélag ekkieinn.is',
          },
          unit_amount: amount, // ISK has no decimals (unit_amount = ISK directly)
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/styrkja/takk?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/styrkja`,
    metadata: {
      source: 'ekkieinn.is',
    },
  });

  return Response.json({ url: session.url });
}
```

**Important:** ISK is a zero-decimal currency in Stripe — `unit_amount` is the actual ISK amount (not multiplied by 100).

## Thank You Page: `/styrkja/takk/page.tsx`

Simple thank you page:
- Title: "Takk fyrir stuðninginn! 🙏"
- Message: "Þín framlag er svo mikilvægt. Við munum nýta hverja krónu til að styðja þá sem þurfa á okkur að halda."
- Button: "Til baka á forsíðu" → link to `/`

## Navigation
- Add "Styrktu okkur" link to main navigation in `app/layout.tsx` or the navbar component
- Also add to footer next to Privacy Policy and Terms of Service links

## Success/Error Handling
- Show loading spinner while redirecting to Stripe
- Show error message if checkout creation fails
- Custom amount must be integer (round to nearest 100 kr if needed)

## Notes
- ISK is a zero-decimal currency — do NOT multiply by 100
- The account is in test mode — use test card `4242 4242 4242 4242` for testing
- After Stripe account is activated (live), update env vars with live keys
- Do NOT use the BMAC widget on this page — this is a standalone Stripe implementation
