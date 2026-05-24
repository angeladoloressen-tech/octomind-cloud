# MoneyGate

Status: active core module, not publicly launched.

## Purpose

MoneyGate is the single commercial gate for Money OS.

It connects:

1. Offer
2. Country and currency
3. Stripe payment link
4. Payment verification
5. Lead or customer state
6. Delivery trigger
7. Revenue report
8. Next commercial action

## Why this exists

Before MoneyGate, Money OS had payment links, funnel pages, funding drafts, market files, and launch notes, but no single gate that decided:

- what can be sold
- where checkout happens
- whether payment is verified
- what happens after payment
- what the system must do next

## Prime rule

No product, payment link, outreach message, or delivery action is active unless MoneyGate recognizes it.

## Current verified money state

- Stripe available balance: 0 EUR
- Stripe pending balance: 0 EUR
- Payment intents sample: empty
- Confirmed revenue: 0

## Core funnel

Free Revenue Leak Audit -> AI Revenue Autopilot Setup -> Monthly Support.

## Active money paths

### Path A: USD setup

Offer: AI Revenue Autopilot Setup
Amount: 599 USD
Payment link: https://buy.stripe.com/aFa6oH5ZW55A2KD5YR6Na0D
Delivery trigger: paid setup delivery pack

### Path B: USD monthly support

Offer: AI Revenue Autopilot Monthly Support
Amount: 179 USD / month
Payment link: https://buy.stripe.com/14A14nbkg41w70Tdrj6Na0E
Delivery trigger: monthly review and support loop

### Path C: EUR setup

Offer: AI Revenue Autopilot Setup
Amount: 499 EUR
Payment link: https://buy.stripe.com/bJe9AT4VSgOi84XgDv6Na0s
Delivery trigger: paid setup delivery pack

### Path D: EUR monthly support

Offer: AI Revenue Autopilot Monthly Support
Amount: 149 EUR / month
Payment link: https://buy.stripe.com/cNi28rdso8hM84X0Ex6Na0t
Delivery trigger: monthly review and support loop

### Path E: Believer / finance route

Offer: serious believer, sponsor, accelerator, grant, or pilot conversation
Amount: not fixed
Payment link: none by default
Delivery trigger: conversation, application, or legal review

## Gate states

- not_seen
- clicked
- lead_created
- checkout_started
- paid_pending
- paid_verified
- delivery_started
- delivery_completed
- support_offered
- support_active
- lost

## Mode states

### Draft mode

Assets exist, not public.

### Preview mode

MoneyGate page can be reviewed, but no traffic is sent.

### Live mode

Only allowed after:

- approved legal/privacy
- approved deploy target
- approved storage backend
- approved traffic channel

## Revenue rule

Revenue is only real when Stripe, bank, or accounting confirms it.

## Delivery rule

No customer delivery starts without verified payment or explicitly approved free-pilot status.

## Product sprawl rule

No new product is allowed into MoneyGate unless it supports the core funnel or replaces a weaker active path.

## Outreach rule

No outreach can include a payment link unless:

1. the route is approved
2. the recipient is verified
3. the message is personalized
4. the send action is explicitly approved

## Current bottleneck

MoneyGate has payment paths, but no active traffic, no deployed public funnel, no storage backend, and no verified payment.

## Next action

Register MoneyGate in the system index, active queue, and operating state. Use MoneyGate as the only checkout router.
