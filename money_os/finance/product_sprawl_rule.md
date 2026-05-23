# Product Sprawl Rule

Purpose: stop the system from creating many offers without a working customer path.

## Current issue

Stripe contains multiple products, but confirmed revenue is still 0 EUR.

## Rule

Before creating a new product, the system must answer:

1. Does it improve the active funnel?
2. Does it replace a weaker product?
3. Does it connect to a traffic source?
4. Does it connect to a payment link?
5. Does it have a delivery path?

If the answer is no, do not create the product.

## Current primary offer

AI Revenue Autopilot Setup: 499 EUR.

## Current recurring offer

AI Revenue Autopilot Monthly Support: 149 EUR per month.
