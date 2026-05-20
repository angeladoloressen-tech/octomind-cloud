# OctoMind Security Notes

This file records critical governance and security notes for the current project state.

## Critical findings

- Supabase `public.invite_codes` and `public.match_drops` currently need RLS and policy review.
- Do not expose invite codes through anon client access.
- Frontend gates are not security boundaries.
- Private core must never be published as the public product.

## Required posture

- Treat all client-visible access checks as UX only.
- Keep invite issuance and redemption constrained to reviewed backend/database policy paths.
- Review any public table exposure before relying on it for access control or secret-bearing data.
- Keep private execution systems separate from public surfaces.
