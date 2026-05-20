# Octomind Cloud-Only Local Policy

Mac role: compute node only.

Durable storage belongs in:

- GitHub for source, chosen docs, and versioned handoffs
- Cloudflare Worker/D1/KV/R2 for cloud runtime and blobs
- Supabase for structured memory/state when enabled

Local disk is allowed only for:

- source checkout
- lockfiles and minimal dependencies needed to run
- temporary process state under `/tmp/octomind-webtop`
- short-lived build/test cache that can be deleted any time

Local disk is not allowed for:

- durable generated reports
- long-lived logs
- backup piles
- model caches
- repeated autonomous output directories
- local multi-agent repo clones
- public localhost tunnels used as production webhooks
- automatic git add/commit/push scripts without explicit flags

Commands:

```bash
python3 tools/octomind_cloud_guard.py
python3 tools/octomind_cloud_guard.py --apply
python3 tools/octomind_cloud_guard.py --apply --purge-generated
python3 tools/octomind_cloud_guard.py --apply --purge-deps
python3 tools/octomind_cloud_guard.py --apply --purge-agent-sandboxes
```

Default webtop runner writes PID/report state to `/tmp/octomind-webtop` and disables local logs. Set `OCTOMIND_LOCAL_ARTIFACTS=1` only when you intentionally want repo-local runtime files.

Genesis, migration, and webhook bridge scripts must default to dry-run. Cloud writes require `--apply`; local SSH/config/clone writes require their own explicit flags; GitHub hook updates must point to a stable cloud URL, not a localhost tunnel.
