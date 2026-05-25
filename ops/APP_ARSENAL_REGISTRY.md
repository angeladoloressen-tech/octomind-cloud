# App Arsenal Registry

Date: 2026-05-25

Purpose: stop the system from thinking only inside Gmail and GitHub. This registry defines the external apps that should become the creative, commerce, automation, and publishing muscle of Octomind / OctoAmazonas.

## Core principle

Every app must have a job.
No random tool collecting.
No shiny app cemetery.

Each app must map to one of these roles:
- create
- automate
- publish
- sell
- track
- store
- learn

## Current connected reality

Currently usable through available tools:
- Gmail: signal detection, email replies, draft/send actions, labels
- GitHub: memory, issues, operating files, agent rules, system architecture
- Automations: scheduled revenue signal checks

Not yet directly connected:
- Hugging Face
- Replicate
- Runway
- ElevenLabs
- n8n
- Make
- Zapier
- Vercel
- Supabase
- Stripe direct API
- Shopify
- Canva
- CapCut
- Notion
- Airtable

## Priority app stack

### 1. Hugging Face
Role: creative and model execution layer.

Use cases:
- text generation for product cards
- embeddings for product and opportunity memory
- image generation prompts
- text-to-image via Inference Providers
- possible text-to-video routes through supported providers
- Spaces for small internal apps and demos
- agent tools or API endpoints later

Needed:
- HF account
- fine-grained token for inference calls
- secret storage in worker or Space

### 2. GitHub Actions
Role: cheap automation runner.

Use cases:
- scheduled opportunity scoring
- generate daily opportunity reports
- update markdown dashboards
- trigger app workers

Needed:
- workflow files
- repository secrets

### 3. Vercel Cron or small server worker
Role: real 24/7 worker.

Use cases:
- webhook listener
- scheduled API jobs
- product page updates
- lightweight dashboards

Needed:
- project connection
- environment variables

### 4. n8n / Make / Zapier
Role: no-code automation bridge.

Use cases:
- Gmail -> classifier -> GitHub issue
- Stripe webhook -> delivery workflow
- affiliate approval -> product page task
- daily revenue report

Needed:
- connected accounts
- workflow approval

### 5. Stripe
Role: money capture and payment event source.

Use cases:
- First Signal Check payment
- Signal Audit payment
- Cloud Command Center Diagnostic payment
- payment webhook to trigger delivery

Needed:
- webhook endpoint
- product/payment link inventory

### 6. Supabase / Airtable / Notion
Role: structured memory and CRM.

Use cases:
- opportunity table
- product table
- affiliate link table
- outcome tracker
- learning dataset

Needed:
- account connection or API key

### 7. Canva / CapCut / Runway / ElevenLabs
Role: creative finishing layer.

Use cases:
- thumbnails
- short video edits
- voiceover
- visual generation
- product demo assets

Needed:
- account/API availability
- brand templates

## First build order

1. Hugging Face creative worker spec
2. GitHub Actions scheduler spec
3. Product/opportunity schema
4. Stripe webhook delivery trigger
5. n8n fallback workflow
6. Publishing templates

## Stop rule

Do not integrate an app unless it moves one of these forward:
- first euro
- affiliate approval
- tracking link
- product page
- paid diagnostic delivery
- reusable content asset
- measurable learning loop
