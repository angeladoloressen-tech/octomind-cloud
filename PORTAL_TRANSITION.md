# AION Observatory Transition

## Decision

This repository is being evaluated as the public GitHub portal for the CERBERRUS144 / AION144 ecosystem.

The public portal is **not** the private runtime, system brain, customer database, secret store, or source of truth for raw operational state. It is a sanitized publication surface.

## New public role

The proposed portal name is **AION Observatory**.

Its public scope is limited to:

- approved opportunity intelligence summaries;
- governed monetization experiments;
- public release notes and evidence ledgers;
- policy boundaries and audit summaries;
- public roadmap items;
- reproducible demonstrations that contain no private data.

## Deprecated claims

The previous cloud-first doctrine in this repository is not accepted as the current product architecture. In particular, the following assumptions require explicit re-approval before reuse:

- the cloud is the system source of truth;
- the Mac must never be part of the runtime;
- all inputs must enter through one cloud intake API;
- Cloudflare KV is the canonical operational database;
- automatic external integrations are enabled by default.

The current direction is local-first, offline-capable, zero paid API dependency, and human-approved external publication.

## Repository boundary

### Private core

The private CERBERRUS144 repository and the canonical SSD workspace may contain source code, internal state, reports, private evidence, local databases, and governed execution logic.

### Public observatory

This repository may contain only static portal assets and sanitized public exports. No public page may depend on a paid API, secret token, private customer record, or internal raw log.

## Publication gate

A public update must pass all of the following checks:

1. No credentials or token-like values.
2. No personal, customer, payment, or confidential data.
3. Provenance is present for factual claims.
4. Human approval is recorded.
5. Limitations and uncertainty are stated.
6. The release can be rolled back.
7. The public status file contains only sanitized fields.

## Initial implementation

The first static portal candidate is located in `public/` on branch `aion-observatory-v1`.

It deliberately starts with zero opportunity claims and zero monetization claims. The only governed public record is the portal bootstrap itself.
