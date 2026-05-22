# Cloud Residency Rule

## Prime rule

The MacBook is not the system home. It is only a temporary workbench.

Authoritative state must live in cloud-backed systems:

- GitHub for code, governance, scripts, operating documents, and versioned memory
- Base44 for public demand gates
- Stripe for payment catalog and payment links
- Supabase or Base44 entities for request and status records
- Google Drive or another cloud folder for non-code archives when needed

## Local machine rule

Local files are temporary and should not become the only copy of important project state.

## Allowed temporary local items

- build output
- dependency caches
- downloaded logs
- generated screenshots
- editor swap files
- short-lived exports

## Not allowed as local-only state

- project scripts
- revenue documents
- product strategy documents
- generated workflows
- public gate copy
- Supabase schemas
- delivery templates
- audit templates
- payment catalog definitions

## Cleanup policy

Local cleanup must be conservative:

1. classify files
2. copy eligible files into a cloud-backed vault
3. write a manifest
4. verify the copy
5. only then move the local original into a recoverable archive folder

## Default cloud vault priority

1. Google Drive if installed
2. iCloud Drive if available
3. OneDrive if available
4. Dropbox if available
5. GitHub repository for code and documents

## Execution boundary

The operator cannot directly access MacBook files unless a local command is run on the machine.

The system may create safe cleanup scripts and cloud residency rules in GitHub.

## Final rule

Cloud first. Manifest always. No blind cleanup.
