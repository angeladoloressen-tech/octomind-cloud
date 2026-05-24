# Money OS System Index

Status: active.

## Root

- `money_os/KERNEL.md` is the root brain.
- `money_os/OPERATING_STATE.json` is the current state file.
- `money_os/orchestrator/ACTIVE_QUEUE.json` is the execution queue.
- `money_os/orchestrator/GUARD.md` is the anti-mess guard.
- All modules must obey the kernel.

## Critical path

1. Launch gate
2. Deploy target
3. Storage backend
4. English-first audit page
5. Paid pilot route
6. Believer route
7. Stripe verified payment

## Active files by module

### Orchestrator

- `money_os/KERNEL.md`
- `money_os/SYSTEM_INDEX.md`
- `money_os/OPERATING_STATE.json`
- `money_os/orchestrator/ACTIVE_QUEUE.json`
- `money_os/orchestrator/GUARD.md`

### Launch

- `money_os/launch/approval_flags.json`
- `money_os/launch/launch_approval_packet.md`
- `money_os/launch/launch_dashboard.md`
- `money_os/launch/check_launch_status.py`
- `money_os/launch/storage_decision_tree.md`
- `.github/workflows/money_os_launch_gate.yml`
- `vercel.json`

### Payments

- `money_os/payments/usd_payment_links.json`
- `money_os/finance/stripe_live_snapshot.json`
- `money_os/finance/payment_link_os_spec.md`
- `money_os/finance/cashflow_cockpit_spec.md`
- `money_os/finance/product_sprawl_rule.md`

### Funnel

- `money_os/audit_page.html`
- `api/audit-intake.js`

### Funding

- `money_os/funding/founder_finance_mode.md`
- `money_os/funding/believer_packet.md`
- `money_os/funding/believer_deck_log.json`
- `money_os/funding/first_20_believer_tracker.csv`
- `money_os/funding/believer_scoring_rubric.md`
- `money_os/funding/believer_message_sequence.md`
- `money_os/funding/named_target_discovery_v1.csv`
- `money_os/funding/top_5_named_targets_scored.md`
- `money_os/funding/approval_ready_outreach_pack.md`
- `money_os/funding/paid_pilot_offer.md`
- `money_os/funding/paid_pilot_target_pack_uae_turkey_greece.md`
- `money_os/funding/ecosystem_draft_hub71.md`
- `money_os/funding/ecosystem_draft_dubai_digital.md`

### Markets

- `money_os/markets/greece_turkey_dubai_market_map.md`
- `money_os/markets/dollar_mode.md`

### Industries

- `money_os/industries/industry_expansion_protocol.md`
- `money_os/industries/industry_targets.json`
- `money_os/industries/industry_skill_matrix.md`
- `money_os/industries/beauty_studios/README.md`
- `money_os/industries/beauty_studios/audit_checklist.md`
- `money_os/industries/beauty_studios/landing_copy_en.md`

### Language

- `money_os/language/multilingual_market_protocol.md`
- `money_os/language/target_country_language_map.json`

### Skills

- `money_os/skills/skill_modules.json`

### Emergency / Focus

- `money_os/emergency/zero_cent_emergency_mode.md`
- `money_os/emergency/cash_conversion_only.md`
- `money_os/emergency/first_payment_sprint.md`

## Mess control

Any future file must fit the kernel and be added to this index if it becomes active.

Files not in this index are considered notes, drafts, or archive candidates.
