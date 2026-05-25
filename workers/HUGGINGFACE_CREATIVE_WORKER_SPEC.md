# Hugging Face Creative Worker Spec

Date: 2026-05-25

Purpose: define how Hugging Face becomes the first creative model layer for OctoSupercomputer.

## Role

Hugging Face is the creative/model execution layer.

It should not replace Gmail, GitHub, Stripe, or automation tools.
It should generate and transform assets that help create revenue routes.

## Inputs

The worker receives:
- product name
- product category
- buyer persona
- opportunity score
- affiliate status
- source company
- main buyer pain
- desired output type

Example input:

Product: PLAUD Note Pro
Category: AI productivity gadget
Buyer persona: creators, founders, meeting-heavy professionals
Route: affiliate
Goal: create product page copy and 3 short-video hooks

## Outputs

The worker can generate:

1. Product card
- short title
- buyer pain
- main benefit
- trust note
- CTA
- affiliate disclosure placeholder

2. Short video hooks
- 3-second hook
- problem line
- demo idea
- CTA

3. Visual prompts
- product scene prompt
- creator workflow prompt
- desk setup prompt
- cinematic product shot prompt

4. Diagnostic copy
- First Signal Check explanation
- Signal Audit explanation
- short client-facing summaries

5. Classification support
- score opportunity text
- summarize company replies
- detect buyer intent

## Model categories

Use available Hugging Face capabilities by category rather than hardcoding one model forever:

- Text generation: product copy, hooks, diagnostics
- Embeddings: product/opportunity memory similarity
- Image generation: product scene concepts and thumbnails
- Vision-language: inspect assets later if images are available
- Audio: voiceover later if needed

## Secrets needed

- HF_TOKEN

Store only in:
- GitHub Actions secrets
- Vercel environment variables
- n8n credentials
- Hugging Face Space secrets

Never store token in markdown, email, or public files.

## First workflow

### PLAUD creative packet

Input:
- PLAUD Note Pro
- AI productivity gadget
- affiliate route pending
- OctoAmazonas product discovery

Generate:
1. Product card draft
2. Three short video hooks
3. Three image/video prompts
4. Affiliate disclosure block
5. CTA text for product page

## Safety and trust rules

The worker must not:
- invent false product specs
- claim guaranteed income
- fake reviews
- imply endorsement without evidence
- hide affiliate relationship
- create medical, legal, or financial claims

The worker should use language like:
- may help
- designed for
- useful for
- check official details
- affiliate disclosure

## Learning loop

Every generated asset gets an outcome:
- produced
- published
- clicked
- replied
- approved
- paid
- ignored
- blocked

The next generation should prefer asset types that produced measurable outcomes.

## First implementation route

Option A: GitHub Actions calls Hugging Face Inference API on schedule.
Option B: Hugging Face Space hosts a small internal generator.
Option C: Vercel worker calls Hugging Face and writes results to GitHub.

Preferred first version:
- GitHub Actions + HF_TOKEN + markdown output file

Reason:
- low cost
- easy to inspect
- results go straight into system memory

## First output file target

Generated outputs should be written to:

outputs/creative_packets/PLAUD_NOTE_PRO_PACKET.md

## Current status

Spec created. Implementation requires HF_TOKEN and a runner path.
