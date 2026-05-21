# Octomind v3 Roadmap

## Current state

Octomind has a live Supabase Edge Function runtime with JWT verification enabled.

Current function:

- slug: octomind-brain
- version: 2
- runtime: Supabase Edge
- memory: Supabase tables

## v3 goal

Move from a safe cloud brain to a sellable command-center product.

## v3 modules

### 1. Runtime Console

Purpose: show health, status, memory, last cycles, and next action.

Endpoints:

- /health
- /status
- /memory
- /run
- /offer

### 2. Memory Discipline

Purpose: keep useful memory and avoid noisy storage.

Tables:

- octomind_brain
- octomind_cycles
- octomind_tools
- octomind_runtime_events

Rules:

- one fact per key
- one cycle per run
- one event per important runtime action

### 3. Safety Gate

Purpose: separate safe drafts from risky external actions.

Blocked until approval:

- payments
- wallet actions
- trading
- email sending
- official submissions
- destructive writes

### 4. Revenue Engine

Purpose: package the system into paid offers.

Assets:

- SALES_PAGE.md
- REVENUE_PACKAGE.md
- OUTREACH_SCRIPTS.md

### 5. Deployment Switchboard

Purpose: keep multiple cloud runtimes available.

Runtimes:

- Supabase Edge: active
- Netlify: project ready
- Cloudflare: workflow ready, credentials pending

## v3 acceptance criteria

- /health returns ok
- /status returns memory summary
- /run records cycle
- /offer returns sales package
- GitHub has clear sales assets
- security plan exists
- no local Mac runtime is required

## Next build target

Upgrade Supabase Edge Function to expose /offer and /next endpoints.
