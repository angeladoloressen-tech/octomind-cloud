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

`adapters/` normalizes snapshots from:

- Gmail — sent pitches are activity; inbound human replies become intent signals requiring review.
- Jotform — newsletter submissions become retention; research/project/service requests become intent.
- GitHub — stars/watches/forks are audience signals; commits and merged PRs are activity only.
- Site analytics — views, returning visitors and CTA clicks when a real analytics snapshot is available.

Missing analytics are reported as `unavailable`; they are never silently converted to zero traffic.

## Privacy boundary

The public repository contains adapter code and synthetic fixtures only. Raw emails, sender addresses, form answers and other private connector data must not be committed. Connected tools should convert private data to anonymous counts/signals at runtime.

## Revenue truth rule

Only events with `type=payment` and `verified=true` count as revenue. Pitches, views, followers, inquiries and hypothetical prices do not.

## Run

```bash
cd distribution-engine
npm test
npm run audit
node index.mjs sample-sources.json
node index.mjs sample-sources.json --json
```

## Design principle

The engine does not auto-publish, auto-send pitches, accept contracts, buy services or perform payment actions. It creates a prioritized, rights-aware action queue for explicit execution.
