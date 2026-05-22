# Security Hardening Backlog

## Current risk level

The runtime is live, but Supabase advisors show database policy risks. Do not apply broad policy changes blindly.

## Priority 1: Public tables with RLS disabled

Tables:

- invite_codes
- match_drops

Action:

- define access model first
- enable RLS only after policies are ready

## Priority 2: Runtime events table

Table:

- octomind_runtime_events

Finding:

- RLS enabled but no policy exists

Action:

- keep writes through Edge Function
- add read/write policy only if client access is needed

## Priority 3: Overly broad policies

Tables include:

- octomind_brain
- octomind_cycles
- octomind_tools
- profiles
- matches
- messages
- waitlist

Finding:

- existing policies are too permissive

Action:

- replace broad write permissions with role-scoped or service-only paths
- keep public reads only where the product truly needs them

## Priority 4: Extension location

Finding:

- vector extension is installed in public schema

Action:

- review migration path before moving extension

## Rule

Security hardening must not break current user flows. Every fix needs a policy model and rollback note.
