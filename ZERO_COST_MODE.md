# Zero-Cost Mode

This repository operates under a hard **0 EUR recurring infrastructure budget** until there is confirmed revenue and explicit human approval to spend it.

## Non-negotiable rules

1. No subscription upgrade, paid API, paid compute, paid database, paid monitoring, or paid deployment may be enabled automatically.
2. Missing paid-service credentials must never make the core system look broken. Optional paid integrations should skip cleanly.
3. Scheduled background jobs are disabled by default. Workflows run manually when they support a real task.
4. Deployments to external cloud providers are manual only.
5. Local/open-source execution is preferred whenever practical: local models, local files, local scripts, and existing hardware first.
6. A service being technically available is not permission to create a billable resource.
7. Expected or hypothetical revenue does not count as funding. Only confirmed available funds count.
8. Any future paid dependency requires explicit human approval before activation.

## Operating priority

The system should optimize for this order:

1. Produce something a real person can buy.
2. Capture a real lead using a zero-cost path.
3. Deliver value with local/free tooling.
4. Record confirmed revenue.
5. Only then consider optional paid infrastructure, and only with explicit approval.

## Default architecture

- Compute: local-first
- LLM: local-first where possible
- Storage: repository/local disk first
- CI: manual, task-driven checks
- Deploy: manual only
- Monitoring: no paid monitoring dependency
- Database: no paid database required for core operation
- External APIs: optional, never core-required when they can create cost

## Revenue gate

Until `confirmed_revenue > 0`:

- recurring_paid_infrastructure = disabled
- automatic_cloud_deploy = disabled
- paid_api_calls = disabled
- scheduled_background_compute = disabled

Even after revenue exists, paid infrastructure remains disabled until explicitly approved.
