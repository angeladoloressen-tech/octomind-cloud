# Deploy Unlock Plan

Status: active plan. Public launch remains blocked.

## Current verified state

- Vercel team exists.
- Vercel projects are empty in latest successful check.
- `vercel.json` exists.
- `money_os/audit_page.html` exists.
- `api/audit-intake.js` exists.

## Problem

The repo is deploy-ready in structure, but no Vercel project is connected.

## Vercel-supported routes

1. Vercel CLI: `vercel link` then `vercel deploy`.
2. Git integration: connect GitHub repo to Vercel and push to deploy.
3. REST API project creation: POST `/v11/projects` with GitHub repo details and bearer token.
4. Deploy button clone route for a repository.

## Recommended route

Use Vercel Git integration or Vercel CLI with the existing GitHub repo.

## Keep blocked until

- project exists
- deployment URL exists
- legal/privacy flags are approved
- storage backend is approved
- traffic channel is approved

## Next system action

Prepare project config and owner approval packet; do not public launch automatically.
