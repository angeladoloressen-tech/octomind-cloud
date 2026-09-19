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

## Revenue truth rule

Only events with `type=payment` and `verified=true` count as revenue. Pitches, views, followers, inquiries and hypothetical prices do not.

## Run

```bash
cd distribution-engine
npm test
npm run audit
npm run audit:json
```

## Next adapters

The core is deliberately dependency-free. Planned adapters can feed it signals from Gmail, Jotform, GitHub, site analytics and publishing platforms without changing the decision engine.

## Design principle

The engine does not auto-publish, auto-send pitches, accept contracts, buy services or perform payment actions. It creates a prioritized, rights-aware action queue for explicit execution.
