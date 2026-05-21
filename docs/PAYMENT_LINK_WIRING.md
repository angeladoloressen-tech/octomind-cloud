# Payment Link Wiring

## Primary provider

Stripe

## Product links

The system expects these environment or config keys:

- SIGNAL_AUDIT_PAYMENT_LINK
- RECOVERY_SETUP_PAYMENT_LINK
- MONTHLY_COCKPIT_PAYMENT_LINK

## Public gate logic

If SIGNAL_AUDIT_PAYMENT_LINK is available:

- Primary CTA opens the Stripe-hosted checkout page.
- Public form can remain as pre-check intake.

If SIGNAL_AUDIT_PAYMENT_LINK is not available:

- Primary CTA opens SignalAuditRequest form.
- Confirmation says payment and private intake are handled after review.

## Payment confirmation rule

Delivery starts only after payment is confirmed or an approved business invoice workflow exists.

## Human approval boundary

Creating live payment links, bank payout settings, tax settings, and refunds require account-owner approval.

The system may prepare copy, product names, pricing, mapping, and fulfillment rules without additional approval.
