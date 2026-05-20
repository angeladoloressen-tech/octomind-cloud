# OctoMind Demand Empire Ecosystem Map

This document is a governance and command-map reference for the current OctoMind project reality.

## Core rule

Each named system has a single operational role. Do not merge roles, do not repurpose private systems as public products, and do not treat UI gates as security boundaries.

## Systems

### ANGELADOLORES
- Public theatre layer
- Persona surface
- Story engine
- Cultural signal
- Purpose: public-facing narrative and identity layer

### TITANIUS_CERBERRUS
- First public money product
- Stale lead recovery workflow
- Purpose: revenue-facing workflow product for dormant demand

### titanius-storefront
- Public storefront surface
- Purpose: public presentation and entry surface for TITANIUS_CERBERRUS

### CERBERRUS144
- Private autonomous AI development core
- Purpose: internal execution core for autonomous development work
- Boundary: never publish this as the public product

### PHITRACTATUSNEXUS
- Research and architecture lab
- Purpose: exploration, system design, and internal technical research

### phiando-hub
- Lightweight public PHIANDO context hub
- Purpose: public context access point with minimal surface area

### ptn-whale-intel
- Conservative PTN/onchain research prototype
- Purpose: restricted research and prototyping around PTN/onchain intelligence

### cerberra-auto-video-os
- Private-first short-form video automation pipeline
- Purpose: internal media automation pipeline with private-first posture

### octomind-cloud
- Central demand gate
- Invite engine
- Purpose: orchestrates access, gating, and demand intake for OctoMind

### Supabase octomind
- Canonical memory backend
- Waitlist backend
- Invite backend
- Status backend
- Purpose: source of truth for canonical demand-state and access-state records

## Governance boundaries

- Public surfaces are for presentation and controlled entry only.
- Private cores are for internal execution and must remain private.
- Research labs are for experimentation and architecture work, not customer-facing productization.
- Backend canonical state lives in Supabase octomind.
- Access checks in frontend code are UX gates, not trust boundaries.
- Invite and access systems must be reviewed at the database and policy layer, not assumed safe because a UI blocks them.

## Canonical flow

1. Public user encounters a public surface.
2. octomind-cloud controls demand gate and invite entry.
3. Supabase octomind stores canonical waitlist, invite, and status data.
4. Private cores perform internal execution.
5. Public outcomes are surfaced only through the intended public systems.

## Non-negotiables

- Do not expose internal cores as public products.
- Do not route public traffic directly to private execution systems.
- Do not assume any client-side gate is a security control.
- Do not change a system’s named role without an explicit governance update.
