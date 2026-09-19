# Security Policy

## Public portal rule

AION Observatory is a public static portal. It must never contain or expose:

- API keys, access tokens, refresh tokens, passwords, private keys, or session cookies;
- `.env` files or secret configuration values;
- customer records, payment details, personal identifiers, or private contact data;
- raw internal logs, private database exports, or confidential evidence;
- unreviewed autonomous actions or credentials for external services.

## Accepted public content

Only sanitized, human-approved exports are allowed:

- public status summaries;
- release notes;
- governance decisions;
- non-sensitive evidence references;
- reproducible static demonstrations;
- public roadmap items.

## Secret response

If a secret is committed or published:

1. Revoke or rotate it at the provider immediately.
2. Remove it from the current tree.
3. Remove it from Git history when required.
4. Review forks, caches, artifacts, logs, and releases.
5. Document the incident without repeating the secret value.

Deleting a file alone is not treated as complete remediation.

## Reporting

Use a private channel for real vulnerabilities or exposed credentials. Do not paste secrets into public Issues or Discussions.

## Publication controls

Every public release should pass a local secret scan and manual review before merge. GitHub push protection should remain enabled for the user account and should not be bypassed without a documented false-positive review.
