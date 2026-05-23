# Storage Decision Tree

Status: prepared.

## Goal

Choose a safe backend for audit intake records before public lead capture starts.

## Option A: Make webhook

Best for fastest no-code automation.

Use when:
- owner wants speed
- lead volume is low at first
- report generation can happen in Make

Risk:
- depends on Make scenario reliability

## Option B: Google Sheets

Best for simple review and manual oversight.

Use when:
- owner wants visible records
- no complex app database is needed

Risk:
- privacy and access control must be checked

## Option C: Supabase

Best for scalable app backend.

Use when:
- public funnel is live
- records need structured storage
- future dashboard is planned

Risk:
- requires database setup and privacy review

## Option D: Vercel KV or Postgres

Best for integrated Vercel app deployment.

Use when:
- the project is deployed on Vercel
- serverless endpoint should store records directly

Risk:
- requires project and storage resource configuration

## Current recommendation

Start with Make webhook or Google Sheets only after privacy approval. Move to Supabase or Vercel storage when lead volume grows.
