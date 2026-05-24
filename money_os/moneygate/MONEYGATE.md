# MoneyGate

Status: active, not publicly launched.

## Purpose

MoneyGate is the single payment and revenue gate for Money OS.

It connects:

- offer
- country / currency
- Stripe payment link
- verified revenue check
- launch approval state
- product sprawl guard

## Why this exists

Before MoneyGate, the system had payment links and offers, but no central money gate. That made revenue flow messy.

## Prime rule

No new product is allowed into MoneyGate unless it supports the core funnel.

## Core funnel

Free Revenue Leak Audit -> AI Revenue Autopilot Setup -> Monthly Support.

## Active offers

### Setup

- USD: 599
- EUR: 499

### Monthly support

- USD: 179 / month
- EUR: 149 / month

## Gate states

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

## Verified revenue rule

Revenue is only real when Stripe, bank, or accounting confirms it.

## Current truth

Stripe available balance: 0 EUR.
Stripe pending balance: 0 EUR.
No confirmed MoneyGate revenue yet.

## Next action

Use MoneyGate as the only checkout router. Do not scatter payment links across random drafts.
