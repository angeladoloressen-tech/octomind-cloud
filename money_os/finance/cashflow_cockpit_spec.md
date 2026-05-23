# Cashflow Cockpit Spec

Status: prototype blueprint.

## Purpose

Cashflow Cockpit is the finance operations view for Money OS.

It does not act as a bank. It observes payment state, offer state, lead state, and retention state.

## Core questions

1. How much confirmed revenue exists?
2. How much is pending?
3. Which offer is active?
4. Which leads are waiting for audit?
5. Which audits need a setup offer?
6. Which setup orders need delivery?
7. Which clients should be offered monthly support?

## Inputs

- Stripe balance
- Stripe payment links
- audit intake records
- audit reports
- delivery packs
- monthly review drafts

## Outputs

- daily cash state
- offer status
- lead status
- conversion gaps
- delivery queue
- retention queue

## Current live state

- Confirmed revenue: 0 EUR
- Payment links: ready
- Audit page: ready
- API endpoint: demo mode
- Storage backend: missing
- Public deploy: missing
- Active traffic channel: missing

## First cockpit metric

Money OS is not allowed to claim revenue until it is visible in Stripe, bank, or accounting records.
