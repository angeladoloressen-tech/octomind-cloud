# Octomind Single Cloud Portal

Octomind is a cloud-first command center. The Mac is only a screen. The system source of truth is the Cloudflare Worker plus Cloudflare KV storage, deployed from GitHub.

## Hard rule

```text
NO_DESKTOP_NO_LOCAL_DOUBLE_CLICK
NO_LOCAL_MAC_SOURCE_OF_TRUTH
ALL_INPUTS_ENTER_THROUGH_SINGLE_PORTAL
```

No desktop folder, double-click file workflow, Finder workflow, or local Mac structure is allowed to become part of the system.

## Runtime

- Worker entry: `worker.js`
- Worker config: `wrangler.toml`
- Deploy path: GitHub Actions -> Cloudflare Wrangler -> Cloudflare Worker
- Storage binding: `LEADS` Cloudflare KV
- Public portal: `/portal`
- Main intake API: `POST /intake`
- Admin inbox: `/admin` and `/admin/intake`
- Metrics: `/admin/metrics`
- Health: `/health`

## What enters the portal

The portal accepts leads, tasks, system notes, logs, incidents, finance/payment signals, content/channel material, and ideas. It then:

1. Redacts token-like or secret-like values before storage.
2. Classifies the input.
3. Decides whether it belongs to the system.
4. Scores revenue potential.
5. Assigns priority.
6. Stores the record in Cloudflare KV.

## Cloud KV prefixes

```text
intake:<created_at>:<id>   all portal records
lead:<created_at>:<id>     revenue/contact records
scan:<created_at>          scheduled operational scans
secret:*                   encrypted OAuth token storage only
```

## Supported classifications

```text
lead
system_asset
incident
finance
content
task
idea
general_input
```

## Offers currently exposed

```text
AI Lead Scanner - 99 EUR
Automation Fix Sprint - 149 EUR
Octo Launch Pack - 199 EUR
Revenue Bot Prototype - 299 EUR
```

## Required secrets and bindings

GitHub Actions deployment expects these GitHub repository secrets:

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
```

The Worker runtime expects:

```text
ADMIN_TOKEN
LEADS KV binding
```

Optional CERBERA YouTube bridge secrets:

```text
YOUTUBE_CLIENT_ID
YOUTUBE_CLIENT_SECRET
YOUTUBE_REDIRECT_URI
YOUTUBE_REFRESH_TOKEN optional, because OAuth can store encrypted refresh token in KV
```

Secrets must not be stored in normal portal records or committed to the repository.

## Routes

```text
GET  /portal
GET  /health
POST /intake
POST /lead
GET  /admin
GET  /admin/intake
GET  /admin/metrics
GET  /admin/leads
GET  /admin/cleanup-test
GET  /offer
GET  /scan
GET  /youtube/status
GET  /auth/youtube/start
GET  /auth/youtube/callback
POST /youtube/upload-test
GET  /api/routes
```

## Mac cleanup doctrine

Mac cleanup does not mean the Mac becomes part of the workflow. It means the opposite:

1. Cloud portal becomes the single entry point.
2. Any system-related material is pasted, uploaded, or sent into `/intake`.
3. The portal evaluates and stores it in KV.
4. Only after cloud import is verified should local copies be considered disposable.
5. The system never depends on local Mac paths, desktop files, or manual double-click operations.

## Current status

```text
Cloud portal: installed
KV storage: configured through LEADS binding
Admin inbox: installed
Revenue scoring: installed
Secret redaction: installed
CERBERA YouTube bridge: retained
GitHub Actions deploy workflow: installed
Mac dependency: false
```
