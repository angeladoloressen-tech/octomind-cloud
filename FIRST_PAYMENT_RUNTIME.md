# First Payment Runtime

## Purpose

Create a database-backed payment route and revenue action queue for the first 490 EUR diagnostic.

## Supabase tables created

- octomind_payment_routes
- octomind_revenue_actions

## Payment route candidates

1. Bank transfer / invoice
2. PayPal
3. Wise
4. Stripe payment link
5. Gumroad / Lemon Squeezy

## Revenue actions inserted

1. Choose first payment route
2. Approve one first outreach message
3. Send first approved diagnostic offer
4. Track first reply
5. Close first diagnostic

## Current blocker

No real payment route selected.

## Rule

Do not invent payment details.
Do not send payment instructions until a real payment route exists.

## Fastest path

Founder chooses the route that can be activated today.
Then Octomind updates the proposal, Gmail close draft, and send approval queue.
