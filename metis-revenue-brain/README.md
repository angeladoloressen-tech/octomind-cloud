# METIS Revenue Brain

METIS Revenue Brain is a deployable revenue automation layer for Octomind.

It connects:

- A focused sales landing page
- Lead intake
- AI-style offer qualification rules
- Stripe Checkout session creation
- Stripe webhook order capture
- Supabase CRM tables
- Delivery task tracking

## Deployment target

Vercel project root directory:

```txt
metis-revenue-brain
```

## Required environment variables

```txt
NEXT_PUBLIC_SITE_URL=https://your-vercel-domain.vercel.app
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
STRIPE_SECRET_KEY=sk_live_or_test_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
METIS_PRICE_ID=price_your_490_eur_setup_price
```

## Core flow

1. Visitor submits intake form.
2. `/api/intake` stores the lead in Supabase.
3. Visitor clicks checkout.
4. `/api/checkout` creates a Stripe Checkout Session using `METIS_PRICE_ID`.
5. Stripe redirects the buyer to Checkout.
6. Stripe webhook sends `checkout.session.completed`.
7. `/api/stripe-webhook` creates an order and a delivery task in Supabase.

## Supabase setup

Run the SQL migration in:

```txt
supabase/migrations/001_metis_revenue_brain.sql
```

## First offer

```txt
METIS Revenue Brain — 48h AI Sales Automation Setup
Price: 490 EUR
Promise: I build your AI sales intake, offer, checkout, CRM, and delivery tracker in 48 hours.
```
