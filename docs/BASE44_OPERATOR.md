# Base44 Operator Protocol

This document teaches the OctoMind system how to operate Base44 without sending routine work back to the human.

## Prime rule

The operator executes first, verifies what can be verified through connected tools, and reports outcomes, blockers, and the next autonomous action.

## Role of Base44

Base44 is the public demand stage. It is not the private product core.

Use it for:

- public gates
- vote flows
- invite request flows
- demand boards
- launchpad demos
- product signal tests

Do not use it for private infrastructure, credentials, internal dashboards, or confidential data.

## OctoAmazonas rule

OctoAmazonas is a demand gate, not a storefront.

Public surface must not show:

- cart
- orders
- prices
- buy now buttons
- checkout
- raw emails
- admin controls

Public surface should show:

- hero gate
- three drop cards
- vote flow
- invite request flow
- aggregate demand board
- why this exists section

## Standard drops

### AI Revenue Recovery Kit

Tagline: Turns stale leads into a ranked recovery queue.

Demand Score: 82/100
Access: Closed
Invites left: 14

### Private Music Lab

Tagline: A browser-based creative sound lab behind an invite gate.

Demand Score: 67/100
Access: Watching demand
Invites left: 9

### Velvet Cakes Gate

Tagline: A slow-access social club concept where entry is earned, not opened.

Demand Score: 74/100
Access: Closed
Invites left: 12

## Required entities

### Drop

- name
- tagline
- demand_score
- access_status
- invites_left
- category
- order

### Vote

- drop_name
- drop_id
- visitor_email optional
- vote_reason
- created_at

### InviteRequest

- email
- preferred_drop
- why_you_want_access
- urgency_level: low, medium, high
- city optional
- created_at

## Operator loop

When the user says any of the following:

- Base44 Operator
- OctoAmazonas kontrol et
- Launchpad için hazırla
- sisteme yapmayı öğret
- bana iş verme

Run this loop:

1. Locate the Base44 app.
2. Inspect schemas when possible.
3. Check whether storefront concepts are still present.
4. Issue a hardening edit if needed.
5. Keep public surface limited to vote, invite, and demand board.
6. Report editor link and what changed.
7. Do not ask the human to perform routine UI work.

## Launchpad submission text

OctoAmazonas is an invite-only demand gate for experimental future products.

Instead of showing an endless catalog, it tests desire before supply. Visitors vote on product drops, request access, and watch demand signals decide what gets released.

The demo includes three public-safe drops:

- AI Revenue Recovery Kit
- Private Music Lab
- Velvet Cakes Gate

The goal is not ecommerce. The goal is to prove which idea creates access demand before building the full product.

## Demo line

Most marketplaces start with supply and hope demand appears. OctoAmazonas reverses the flow: first desire, then access, then supply.

## Evidence discipline

No proof, no claim.

Acceptable proof:

- Base44 schema inspection
- Base44 edit response
- GitHub commit
- lint and build output
- screenshot supplied by the human
- public preview inspection when available

If only an async edit was started, report that it was started, not that the UI is perfect.
