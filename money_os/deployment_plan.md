# Money OS Deployment Plan

Status: prepared, not publicly launched.

## Goal

Publish the Revenue Leak Audit page only after legal and privacy approval.

## Deployment candidates

1. Vercel static deployment
2. GitHub Pages
3. Cloudflare Pages

## Required before public launch

- Legal identity / Impressum approved
- Privacy text approved for form submissions
- Contact email approved
- Form endpoint connected
- CRM storage connected
- Payment links verified

## Recommended deployment path

1. Render money_os/site/index.html from money_os/audit_page.html
2. Deploy static site to Vercel or Pages
3. Confirm URL loads
4. Connect form endpoint
5. Run a test submission with demo data
6. Generate audit report
7. Show paid setup offer after audit report

## Stop rule

Do not publish a public live page that collects real leads until legal and privacy approval exists.

## Revenue path after deployment

Audit page -> opt-in lead -> audit report -> 499 EUR setup payment link -> intake -> delivery -> 149 EUR monthly support.
