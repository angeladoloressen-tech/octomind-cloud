# Octomind Reality Dashboard

This dashboard prevents false optimism.

## Current status model

```text
GREEN  = confirmed money or confirmed demand evidence
YELLOW = routes and assets exist, but money is still zero
RED    = no money, no demand evidence, no confirmed deploy
```

## Current known status

```text
STATUS: YELLOW
REASON: Stripe balance is zero, but at least one reply or partner-route signal exists.
```

## Dashboard fields

```text
revenue_eur_available
revenue_eur_pending
payment_intents_count
subscriptions_count
real_leads_count
payment_clicks_count
replies_count
deploy_confirmed
status_color
reason
next_system_action
```

## Evidence rules

A setup asset is not proof by itself.

```text
payment route exists -> not revenue
email draft exists -> not outreach
repo commit exists -> not live deploy
form exists -> not demand
```

## Required evidence

```text
payment_received
subscription_created
payment_intent_created
real_non_test_lead
reply_received
payment_click
confirmed_deploy
booked_call
```

## Action rules

```text
no money -> sharpen offer or target segment
no reply -> change segment or message
reply but no money -> create smaller paid entry or ask for partner route
click but no payment -> reduce friction and sharpen promise
blocked tool -> create nearest cloud path and log blocker
```

## Operator rule

The operator receives no terminal, Finder, Desktop, local setup, or double-click work.

## Next implementation target

Add these fields to the live admin console when deploy path is confirmed.
