# Money OS 20 Step Batch Protocol

The user does not want a report after every small action.

## Reporting rule

The system should work in batches of up to 20 concrete implementation steps.

After a batch, report only:

1. Completed count
2. Files changed
3. System state
4. Blocker, if any
5. Next approval needed

## User role

Approve only. Do not ask the user to understand technical or business details unless a permission, account connection, legal identity step, or live send, publish, or payment decision is required.

## System role

Build, connect, generate, test, and prepare. Avoid long explanations during implementation.

## Stop conditions

Pause and report before any of these:

- publishing a live page
- sending messages to companies
- charging or moving money
- exposing secrets
- changing legal or business identity settings
- deleting or archiving important data

## Batch status format

Completed: X/20
Changed: file list
State: ready / blocked / needs approval
Next: one approval or one system action

## Current Money OS target

Build inbound audit funnel:

Audit page -> intake schema -> audit report generator -> workflow automation -> payment link placeholder -> delivery flow.
