# Supabase Security Plan

This plan protects the cloud brain without breaking existing app behavior.

## Current priority

Do not apply broad SQL changes blindly. First map access requirements, then tighten policies.

## Findings

Security advisor reported:

- invite_codes has policies but RLS is disabled.
- match_drops has RLS disabled.
- octomind_runtime_events has RLS enabled but no policy.
- several public tables have overly broad policies.
- vector extension is installed in public schema.

## Safe plan

Phase 1: observe

- keep Edge Function JWT verification enabled.
- keep service writes inside the Edge Function.
- record runtime events.
- avoid exposing write access directly to anon clients.

Phase 2: isolate Octomind memory

- use Edge Function for writes.
- restrict direct table writes.
- keep public read only where product requires it.

Phase 3: repair legacy app tables

- invite_codes: enable RLS only after defining invite read/use policies.
- match_drops: enable RLS only after defining admin/service access.
- profiles/matches/messages: replace open policies with user-scoped rules.

Phase 4: advisor cleanup

- review vector extension location.
- remove always-true write policies.
- run advisors again.

## Rule

Security changes must not be applied as blind cleanup. Every policy change needs an access model.
