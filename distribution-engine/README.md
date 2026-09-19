# CDS Distribution & Monetization Engine

This is the software layer behind the Critical Digital Synthesis Distribution OS.

## Goal

Turn existing creative/research assets into an auditable queue of distribution and monetization actions instead of producing more content by default.

## Completion gate

Every asset is checked for four layers:

1. canonical home
2. discovery path
3. audience capture
4. value path

Missing layers produce one prioritized action:

- `CANONICALIZE`
- `DISTRIBUTE`
- `CAPTURE`
- `CONVERT`
- `HOLD_UNPUBLISHED` when first-publication rights are at risk

## Source adapters

`adapters/` normalizes snapshots from Gmail, Jotform, GitHub and available site analytics. Missing analytics remain `unavailable`; they are never silently converted to zero.

## Predictive Opportunity Engine

`opportunity-engine.mjs` ranks asset × platform actions using aggregate attention, retention, intent, commercial evidence, verified revenue, effort, cash cost, rights risk and eligibility. It begins in evidence-aware heuristic mode and only marks the history ready for an external tabular model after enough labeled aggregate outcomes exist.

## Market Cell Engine

`market-cell-engine.mjs` converts the useful part of the microsite idea into a policy-safe experiment system.

It does **not** approve mass deployment merely because pages are cheap to generate. Each proposed cell must have:

- standalone user value,
- real local/topic evidence,
- measurable demand,
- a clear conversion path,
- maintainability.

The engine blocks scaling when cells are near-duplicates, funnel to the same destination, are designed to conceal a portfolio footprint, or primarily exist to manipulate rankings. The default mode is `PROVE_ONE_CELL`; scale is unlocked only after independently useful cells produce enough known outcomes and intent signals.

## Privacy boundary

The public repository contains adapter code and synthetic fixtures only. Raw emails, sender addresses, form answers and other private connector data must not be committed.

## Revenue truth rule

Only events with `type=payment` and `verified=true` count as revenue. Pitches, views, followers, inquiries and hypothetical prices do not.

## Run

```bash
cd distribution-engine
npm test
npm run audit
npm run audit:public
```

## Design principle

The engine does not auto-publish, auto-send pitches, accept contracts, buy services, mass-deploy sites or perform payment actions. It creates a prioritized, rights-aware and evidence-aware action queue for explicit execution.
