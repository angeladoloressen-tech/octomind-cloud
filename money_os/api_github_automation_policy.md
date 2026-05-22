# API + GitHub Automation Policy

Status: active directive.

## Core instruction

From now on, Money OS should use connected APIs and GitHub automation first.

The user should not receive manual setup work, zip files, or long command lists when a connected API, repository action, workflow, or deployment connector can do the work directly.

## Default execution order

1. Inspect connected tools and repo state.
2. Use APIs to create or update resources directly when safe.
3. Commit system changes to GitHub.
4. Use GitHub Actions for repeatable jobs.
5. Use Stripe APIs for products, prices, and public payment links.
6. Use Vercel connector for deploy inspection or deployment when launch gate is approved.
7. Use Gmail only for drafts or approved sending.
8. Use Canva only for approved marketing asset creation.

## Approval gates

Stop and ask for approval before:

- public launch
- collecting real leads
- sending messages to companies
- charging, refunding, or moving money
- publishing marketplace listings
- using private identity, legal, or tax details
- exposing or storing secrets
- deleting important data

## Batch mode

Work in batches of up to 20 implementation steps. Report only after completion or blocker.

## Current Money OS path

Audit page -> opt-in lead -> audit report -> setup offer -> delivery pack -> monthly review.

## Current bottleneck

Legal/privacy approval, storage backend, public deployment, and active traffic are still required before real lead capture.
