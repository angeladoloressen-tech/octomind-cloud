# OCTO Automation Status

This repo is now prepared for a safe background automation path.

## What is active
- GitHub Actions background pulse workflow
- n8n lead intake workflow JSON draft
- Reports directory for generated pulse/status files

## Safety boundary
OCTO may generate reports, drafts, lead responses, and audit packets.
OCTO must not submit official applications, upload identity documents, send official emails, or make payments without explicit human approval.

## Next infrastructure gates
1. GitHub auth must be active locally.
2. Workflow must be pushed to GitHub default branch.
3. n8n workflow must be imported into a real n8n instance.
4. Stripe/payment and email delivery must be connected before real selling.
