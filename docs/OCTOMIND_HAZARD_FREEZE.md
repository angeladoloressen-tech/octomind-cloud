# OCTOMIND Hazard Freeze

Experimental automation files are blocked by default until they are converted to dry-run-first tools.

Blocked files:

- migration_auto.py
- neural_link.py
- genesis_all_in_one.py
- web_gateway.py
- athena_gate_init.py
- athena_pulse.py

Promotion requirements:

- dry-run by default
- explicit apply flag
- no secret output
- no broad git add
- no git push without owner approval
- smoke test passed

Guard smoke:

```bash
python3 tools/athena_guard.py --list-policy
python3 tools/athena_guard.py -- python3 migration_auto.py
python3 tools/athena_guard.py -- python3 athena_pulse.py
python3 tools/athena_guard.py -- echo hello
```
