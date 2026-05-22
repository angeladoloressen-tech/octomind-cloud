# Octomind Test Plan

## Runtime under test

Supabase Edge Function: `octomind-brain`
Version: 3
JWT verification: enabled

Base URL:
`https://sgxtadlsamduvtpwxvco.supabase.co/functions/v1/octomind-brain`

## Required auth

Calls require a valid Supabase bearer token.
Do not commit tokens to GitHub.
Do not paste tokens into public chat.

## Endpoint checks

### Health

Expected:

- `ok: true`
- `version: 3`
- `runtime: supabase-edge`

### Status

Expected:

- `mode: supabase_edge_v3`
- memory snapshot returned
- offer returned

### Memory

Expected:

- octomind_brain snapshot
- octomind_cycles snapshot
- octomind_runtime_events snapshot

### Offer

Expected:

- starter package
- build package
- maintenance package

### Next

Expected:

- priority
- next action
- active sales assets

### Run

Expected:

- safe cycle response
- memory facts updated
- cycle saved
- runtime event saved

## Pass criteria

Octomind v3 passes when all endpoints return JSON and `/run` records a cycle without breaking memory.
