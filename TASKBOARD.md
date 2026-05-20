# Octomind Taskboard

This board is the single operating queue for the Octomind cloud system.

## Current Mission

Move Octomind fully into the cloud and keep the Mac as a screen only.

## System Roles

| Agent | Owner Area | Current Job | Status |
| --- | --- | --- | --- |
| Commander Agent | Direction and decision gate | Keep one next action at a time | Active |
| Deploy Agent | Cloud runtime | Complete Cloudflare Worker deployment | Blocked by Cloudflare credentials |
| Memory Agent | Persistent memory | Prepare Supabase schema and keys | Ready after deploy |
| Revenue Agent | Offers and monetization | Package the system as a sellable audit/setup service | Ready |
| Safety Agent | Risk control | Keep external actions gated | Active |
| Scout Agent | Research | Find alternate cloud runtimes if Cloudflare blocks us | Ready |
| Cleaner Agent | Local cleanup | Prevent Mac/local sprawl | Active |

## Cloud Runtime Target

Primary runtime: Cloudflare Worker

Worker source:

```text
cloudflare/worker.js
```

Expected live endpoints:

```text
GET  /health
GET  /status
POST /run
```

## Current Blocker

Cloudflare deployment needs these GitHub repository secrets:

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
```

These values cannot be invented by any agent. They must come from the connected Cloudflare account or a trusted secret store.

## Deployment Path

GitHub Actions workflow:

```text
.github/workflows/deploy-cloudflare.yml
```

Expected behavior:

1. Check out repository.
2. Check Cloudflare secret presence.
3. Install dependencies.
4. Deploy the Worker with Wrangler.
5. Return a Cloudflare workers.dev URL in logs.

## Acceptance Criteria

Deployment is considered complete when:

- Worker has a public Cloudflare URL.
- `/health` returns `ok: true`.
- `/status` returns `mode: cloud_only`.
- `/run` returns a safe cycle response.
- No local Mac runtime is required.
- No secret is committed to the repository.

## Safety Rules

Blocked without human approval:

- Wallet operations
- Trading
- Payments
- Email sending
- Official submissions
- Destructive actions
- Irreversible external actions

## Next Action

Resolve the Cloudflare deployment credential gap or choose an alternate connected cloud runtime that can be deployed through available connectors.

## Alternate Runtime Candidates

If Cloudflare cannot be completed through available tools:

1. Netlify Edge Functions
2. Supabase Edge Functions
3. Replit App runtime
4. Hugging Face Space

Decision rule: prefer the runtime that can be deployed through a connected tool without local Mac commands.
