# Learning Loop

Date: 2026-05-25

Purpose: make the revenue system improve from outcomes instead of repeating the same actions.

## Learning principle

The system learns from evidence, not emotion.

Every action must be classified by outcome:
- sent
- blocked
- replied
- auto-replied
- approved
- paid
- ignored
- risky
- duplicate

The next action must change based on the outcome.

## Current lessons

### Lesson 1: Warm-thread direct reply can work

Evidence:
- PLAUD warm thread existed.
- Direct email reply was sent successfully.
- Saved draft route had previously been blocked.

Rule:
- If a warm thread exists and draft sending fails, a shorter direct reply can be attempted.

### Lesson 2: Duplicate-send risk exists

Evidence:
- PLAUD thread shows more than one similar sent reply.

Rule:
- Before sending in a warm thread, search the same thread or recent sent mail.
- If a similar message was already sent within 48 hours, do not send again.
- Instead, mark as waiting.

### Lesson 3: Auto-reply is not human interest

Evidence:
- PLAUD affiliate inbox returned automatic replies.
- COC also returned an automatic reply.

Rule:
- Auto-reply can confirm the channel is alive.
- Auto-reply does not count as approval, interest, or payment signal.

### Lesson 4: Warm signal beats cold outreach

Evidence:
- PLAUD produced a real human reply.
- Other companies mostly have outbound follow-ups but no human replies yet.

Rule:
- Prioritize PLAUD until application/tracking route is handled.
- Do not send more cold follow-ups to the same companies without a new signal.

## Feedback fields for every opportunity

Each opportunity should have:

- Company
- Route: affiliate / service / diagnostic / product / funding
- Stage
- Last action
- Last outcome
- Evidence source
- Next action
- Risk note
- Score

## Scoring model

Start with 0 points.

Add:
- +5 human reply
- +4 affiliate or payment route exists
- +3 direct next action exists
- +3 product/service fit is clear
- +2 auto-reply/channel alive
- +2 previous successful send path exists

Subtract:
- -5 no reply after follow-up
- -4 duplicate-send risk
- -4 unclear delivery scope
- -3 requires login or third-party form
- -3 no payment route
- -2 only idea, no buyer signal

Priority:
- P0: 8 or more
- P1: 4 to 7
- P2: 0 to 3
- Park: below 0

## Action policy by priority

P0:
- Move now.
- Create or update GitHub issue.
- Send safe warm-thread reply only if not duplicate.
- Prepare application/product/payment route.

P1:
- Track and prepare.
- Do not over-message.
- Wait for human reply or new signal.

P2:
- Keep in queue.
- No active effort unless capacity exists.

Park:
- Stop working until new evidence appears.

## Daily learning review

Every day, the system should answer:

1. What produced a human reply?
2. What produced only auto-replies?
3. What got blocked?
4. What caused duplicate risk?
5. What moved closest to money?
6. What should be stopped?
7. What rule should be updated?

## Current command

Focus on PLAUD application and tracking route.
Do not keep building abstract architecture unless it improves application, payment, product listing, or delivery.
