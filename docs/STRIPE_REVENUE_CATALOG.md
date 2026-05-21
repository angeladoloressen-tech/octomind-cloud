# Stripe Revenue Catalog

This catalog defines the exact payment products for the AI Revenue Recovery Kit.

## Primary checkout provider

Stripe

## Active paid offer

AI Revenue Recovery Kit

## Products

### 1. Signal Audit

Price: 49 EUR

Type: one-time payment

Purpose: first paid diagnostic.

Customer promise:

Prioritize old business opportunities and identify which ones are worth recovering first.

Delivery:

- short ranked opportunity note
- simple recovery categories
- next-action sequence
- follow-up direction

Fulfillment trigger:

Start after payment confirmation and safe intake review.

### 2. Recovery Setup

Price: 199 EUR

Type: one-time payment

Purpose: convert the audit into an operating queue.

Delivery:

- prioritized recovery queue
- follow-up message pack
- suggested 7-day action sequence
- handoff notes

Fulfillment trigger:

Offer after Signal Audit delivery.

### 3. Monthly Recovery Cockpit

Price: 499 EUR per month

Type: recurring subscription

Purpose: ongoing recovery operations.

Delivery:

- weekly queue update
- follow-up optimization
- simple performance notes
- monthly opportunity report

Fulfillment trigger:

Offer after Recovery Setup or serious pilot conversation.

## Payment link mapping

Each product should have one Stripe Payment Link:

- SIGNAL_AUDIT_PAYMENT_LINK
- RECOVERY_SETUP_PAYMENT_LINK
- MONTHLY_COCKPIT_PAYMENT_LINK

## Public gate behavior

The public page should show the 49 EUR Signal Audit first.

If the payment link is not connected yet, the public form collects SignalAuditRequest records and shows:

Payment and private intake are handled after review.

If the payment link is connected, the CTA should route to the Stripe-hosted payment page.

## Data safety

Never ask for private customer lists in public forms.

Sensitive lead lists or CRM exports are accepted only after payment and through a controlled private channel.

## Human approval boundary

Creating or activating real payment links requires account owner approval because Stripe controls money movement, payout, tax, and compliance settings.

Everything around copy, product architecture, gate wiring, fulfillment rules, and documentation is handled by the system.
