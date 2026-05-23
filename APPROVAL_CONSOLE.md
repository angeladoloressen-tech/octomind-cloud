# Approval Console

## Purpose

Replace copy-paste approvals with durable approval records.

## Buttons

- Approve next safe actions
- Start revenue sprint
- Prepare CRM actions
- Prepare proposal pack
- Run security review
- Hold risky actions

## Record fields

- action key
- action label
- status
- source
- timestamp
- notes

## Backend tables

- octomind_approvals
- octomind_sales_tasks
- octomind_sales_leads
- octomind_enterprise_deals

## Runtime

Supabase Edge Function: octomind-brain version 4.

## Rule

Buttons prepare work and record approvals. Risky external actions still require explicit human confirmation.
