# Revenue Engine State

## Purpose

This file turns Octomind from scattered assets into a staged revenue engine while keeping recurring infrastructure cost at 0 EUR.

## Engine stages

1. Buyer path
2. First send
3. Reply / qualify
4. MoneyGate
5. Delivery
6. Upsell

## Current state

| Key | Stage | Status | Blocker | Next action |
|---|---|---|---|---|
| buyer_path | targeting | verified | none | Brew Interactive selected as first verified CRM / marketing automation candidate |
| first_send | outreach | draft_ready | exact public recipient/contact channel not yet verified | keep one personalized Gmail draft ready; send only with explicit approval and verified public contact |
| reply_qualify | sales | ready | no reply yet | ask one operational-friction question and qualify interest |
| moneygate | payment | deferred_until_interest | no real payment route selected | resolve only after a qualified prospect wants the diagnostic; do not buy or activate paid infrastructure first |
| web_capture | lead_capture | optional | Netlify deployment not required for first outreach | use static asset only if a zero-cost public route is available; do not block outreach on hosting |
| delivery | fulfillment | template_ready | no paid diagnostic yet | deliver after scope and legitimate payment confirmation |
| upsell | expansion | planned | no first diagnostic yet | consider build sprint only after the diagnostic creates value |

## First verified candidate

Brew Interactive

Public-fit signals verified 2026-09-16:

- HubSpot Platinum Solutions Partner
- Salesforce Partner
- marketing automation capability
- AI-powered lead generation / outbound capability
- positions delivery as one connected growth system

Personalization angle:

Governance and handoff across CRM, AI outbound, reporting, approvals, documentation and multiple tools without adding another costly infrastructure layer.

## MoneyGate rule

MoneyGate is not a prerequisite for research, drafting, or the first approved outreach.

It becomes required only when a qualified prospect wants to purchase. At that point use a legitimate, user-authorized payment/invoice route and never invent account, tax, banking, or business details.

## Zero-cost rule

Until confirmed revenue exists and spending is explicitly approved:

- recurring_paid_infrastructure = disabled
- scheduled_background_compute = disabled
- paid_api_calls = disabled
- automatic_cloud_deploy = disabled

## Current upper-stage move

Verify one public contact channel for Brew Interactive, then use the already-prepared personalized draft after explicit send approval.
