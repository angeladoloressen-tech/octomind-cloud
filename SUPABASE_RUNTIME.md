# Supabase Runtime

Octomind has an active Supabase Edge Function runtime.

Project ref: `sgxtadlsamduvtpwxvco`
Project URL: `https://sgxtadlsamduvtpwxvco.supabase.co`
Region: `eu-central-1`
Project status: `ACTIVE_HEALTHY`

Edge Function:

- name: `octomind-brain`
- slug: `octomind-brain`
- status: `ACTIVE`
- version: `1`
- JWT verification: enabled

Runtime base URL:

`https://sgxtadlsamduvtpwxvco.supabase.co/functions/v1/octomind-brain`

Available paths:

- `/health`
- `/status`
- `/run`

Memory tables detected:

- `octomind_brain`
- `octomind_cycles`
- `octomind_tools`

Runtime ledger table added:

- `octomind_runtime_events`

Security note:

Supabase advisory reported RLS disabled on `invite_codes` and `match_drops`. Do not enable blindly without access policies.

Operating rule:

Mac is not runtime. Supabase Edge is now a live cloud runtime for Octomind.
