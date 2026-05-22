# OctoAmazonas — Autopilot Operating System

## Purpose

The user should not run the business manually.

The system should handle the full workflow from brand interest to listing, affiliate routing, product page creation, follow-up, payment request, and reporting.

The user should only be notified when:

1. Money is received.
2. A legal/contract risk needs explicit approval.
3. A platform requires human login or permission.
4. A decision could spend money or create liability.

## Default mode

Operate as an approve-only business system.

Do not ask the user to understand the technical or business process.

## Autopilot funnel

### Stage 1 — Lead discovery

System finds gadget brands, product makers, affiliate programs, reseller forms, wholesale forms, and media contact routes.

Output:
- new lead in CRM
- category
- priority
- safe contact route
- next action

### Stage 2 — Demo creation

System creates a demo listing or demo collection before asking for money.

Output:
- demo page
- structured product metadata
- safe contact-form message
- disclosure text

### Stage 3 — Safe first contact

System uses official affiliate, partner, reseller, wholesale, media, or business inquiry routes.

Avoid:
- guessed personal emails
- mass spam
- repeated cold follow-ups
- aggressive paid pitch before permission

### Stage 4 — Reply handling

If a brand replies positively, system should classify the reply:

- affiliate program route
- permission to list
- request for preview
- pricing question
- payment link request
- rejection
- legal concern

### Stage 5 — Autonomous response rules

The system may prepare or send low-risk operational replies when they only request:

- official product URL
- affiliate link
- product images / media kit
- preferred landing page
- target market
- confirmation of listing accuracy

The system must ask for explicit approval before:

- signing contracts
- agreeing to exclusivity
- making revenue guarantees
- accepting legal terms
- paying for tools or ads
- using copyrighted media without clear permission
- sending sensitive personal data

### Stage 6 — Payment flow

If a brand asks how to pay:

1. Send the approved payment route for the correct product:
   - Featured Product — 49 EUR/week
   - Octo Launch Pack — 199 EUR
   - Vendor Storefront — 499 EUR setup
   - Product Verification Report — 19 EUR
2. Update CRM to Payment Requested.
3. Watch for payment confirmation from Stripe, Gumroad, PayPal, or bank notification emails.
4. Notify the user only when money is received.

### Stage 7 — Fulfillment after payment

After payment, system creates:

- verified listing
- product page
- category placement
- buy button / affiliate link
- disclosure note
- trend score label
- social copy pack
- basic report

Then CRM status becomes Paid / Fulfillment Started / Fulfilled.

### Stage 8 — Reporting

The user should receive only compact money-relevant updates:

- payment received
- amount
- brand
- product
- next fulfillment status

## User notification rules

### Notify immediately

- Payment received
- Brand asks for payment link
- Brand wants a contract
- Brand asks for exclusivity
- Brand threatens legal action
- Platform requires login/permission
- A tool will cost money

### Do not notify for routine work

- lead added
- demo created
- route researched
- CRM updated
- safe low-risk reply drafted
- product metadata cleaned
- non-urgent rejection

## Payment products

| Product | Price | Use case |
|---|---:|---|
| Product Verification Report | 19 EUR | Buyer wants help finding/verifying a gadget |
| Featured Product | 49 EUR/week | Brand wants visibility but not a full launch pack |
| Octo Launch Pack | 199 EUR | Brand wants launch placement and content pack |
| Vendor Storefront | 499 EUR setup | Brand has multiple products |
| Premium Trend Report | 29 EUR/month | Vendor wants monthly trend insight |

## Risk rules

Never promise guaranteed sales.

Use wording:

"launch placement"
"demo preview"
"discovery listing"
"affiliate route"
"founding placement"
"no guaranteed traffic or sales volume during launch phase"

Do not use wording:

"guaranteed customers"
"official partner" before approval
"verified" before confirmation
"exclusive" unless signed
"Amazon partner" unless legally true

## Current first brands

1. PLAUD — contacted, awaiting reply
2. UGREEN — demo ready, route to verify
3. Insta360 — route to verify
4. Aiper — route to verify
5. Loona / KEYi Robot — route to verify

## Definition of success

The system is working when the user receives one of these notifications:

- payment received
- affiliate approved
- brand approved listing
- brand requested payment link

## Prime directive

The user should not need to understand or execute the workflow.
The system should keep moving until it hits a legal, payment, permission, or money event.
