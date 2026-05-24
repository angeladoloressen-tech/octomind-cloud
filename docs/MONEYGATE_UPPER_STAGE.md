# Moneygate Upper Stage

Airtable Signal Workflow Board is now the canonical brain.

Flow:
Lead -> Moneygate -> Payment -> Delivery -> Pulse -> Registry -> Command Queue.

Active gates:
- First Signal Check: 19 EUR
- Signal Audit: 49 EUR
- Pilot Deposit: 10000 EUR

Rules:
- Do not create separate trackers without registry entry.
- Use Moneygate for payment routing.
- If revenue is zero, prioritize buyer reply, payment, delivery, or intro.
- Replit deployment remains blocked until reauthentication.

Next command:
Execute from Command Queue and update Pulse after each action.
