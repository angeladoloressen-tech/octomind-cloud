# Revenue Engine State

## Purpose

This file turns Octomind from scattered assets into a staged revenue engine.

## Engine stages

1. MoneyGate
2. Web capture
3. Buyer path
4. First send
5. Reply close
6. Delivery
7. Upsell

## Current state

| Key | Stage | Status | Blocker | Next action |
|---|---|---|---|---|
| moneygate | payment | setup_required | real payment detail missing | activate one route |
| web_capture | lead_capture | deploy_ready | Netlify deploy not confirmed | trigger and test deploy |
| buyer_path | targeting | selected | none | use CRM / HubSpot / automation agency |
| first_send | outreach | ready_locked | manual review and send approval required | personalize one CRM agency packet |
| reply_close | sales | ready | no reply yet | use interested prospect reply kit |
| delivery | fulfillment | template_ready | no paid diagnostic yet | deliver after payment confirmation |
| upsell | expansion | planned | no first diagnostic yet | offer build sprint after delivery |

## MoneyGate routes

- invoice_bank
- paypal
- wise
- stripe
- simple_checkout

All routes exist as setup_required. None is active until real founder-provided details exist.

## Why the system felt stuck

The system had many useful assets but no staged revenue state machine. Now each asset belongs to a stage.

## Upper-stage rule

Do not create unrelated files unless they update one of the engine stages.

## Current upper-stage move

Resolve MoneyGate first, then deploy web capture, then one approved CRM agency send.
