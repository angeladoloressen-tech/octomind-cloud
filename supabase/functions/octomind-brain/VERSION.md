# Octomind Brain Function

Runtime: Supabase Edge Function
Project ref: sgxtadlsamduvtpwxvco
Function slug: octomind-brain
Current version: 2
Status: ACTIVE
JWT verification: enabled

Base URL:
https://sgxtadlsamduvtpwxvco.supabase.co/functions/v1/octomind-brain

Endpoints:
- /health
- /status
- /memory
- /run

v2 capabilities:
- reads memory
- records cycles
- records runtime events
- upserts new brain facts
- uses Claude when CLAUDE_KEY is present
- falls back safely when CLAUDE_KEY is absent
