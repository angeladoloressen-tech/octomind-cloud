from pathlib import Path

root = Path(__file__).resolve().parents[1]
paths = [
    'money_os/audit_page.html',
    'money_os/intake_schema.json',
    'money_os/generate_audit_report.py',
    'money_os/20_step_batch_protocol.md',
]
missing = [p for p in paths if not (root / p).exists()]
if missing:
    print('missing:', ', '.join(missing))
    raise SystemExit(1)
print('money os ok')
