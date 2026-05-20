from __future__ import annotations

import argparse
import json
import os
import shlex
from pathlib import Path
from typing import Any


def load_policy(root: Path) -> dict[str, Any]:
    path = root / "tools" / "octomind_hazard_policy.json"
    if not path.exists():
        return {"loaded": False, "blocked_files": {}, "blocked_fragments": []}
    data = json.loads(path.read_text(encoding="utf-8"))
    data["loaded"] = True
    return data


def split_command(command: str) -> list[str]:
    try:
        return shlex.split(command)
    except ValueError:
        return command.split()


def check_command(command: str, policy: dict[str, Any]) -> dict[str, Any]:
    normalized = " ".join(command.strip().split())
    tokens = split_command(normalized)
    basenames = {os.path.basename(token) for token in tokens}

    file_hits = []
    for filename, reason in policy.get("blocked_files", {}).items():
        if filename in basenames or filename in normalized:
            file_hits.append({"file": filename, "reason": reason})

    fragment_hits = []
    lowered = normalized.lower()
    for fragment in policy.get("blocked_fragments", []):
        if fragment.lower() in lowered:
            fragment_hits.append(fragment)

    if file_hits or fragment_hits:
        return {
            "decision": "BLOCKED",
            "command": normalized,
            "file_hits": file_hits,
            "fragment_hits": fragment_hits,
            "required_action": "Convert to dry-run-only and require owner approval before execution."
        }

    return {
        "decision": "ALLOWED_FOR_SMOKE_ONLY",
        "command": normalized,
        "file_hits": [],
        "fragment_hits": []
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=".")
    parser.add_argument("--list", action="store_true")
    parser.add_argument("--list-policy", action="store_true")
    parser.add_argument("--check-command", default="")
    parser.add_argument("command", nargs=argparse.REMAINDER)
    args = parser.parse_args()

    root = Path(args.root).resolve()
    policy = load_policy(root)

    command = args.check_command
    if not command and args.command:
        command = " ".join(token for token in args.command if token != "--").strip()

    if args.list or args.list_policy:
        result = {
            "status": "ATHENA_GUARD_POLICY_LOADED" if policy.get("loaded") else "ATHENA_GUARD_POLICY_MISSING",
            "blocked_file_count": len(policy.get("blocked_files", {})),
            "blocked_fragment_count": len(policy.get("blocked_fragments", [])),
            "blocked_files": policy.get("blocked_files", {})
        }
    elif command:
        result = check_command(command, policy)
    else:
        result = {
            "status": "ATHENA_GUARD_READY",
            "usage": [
                "python3 tools/athena_guard.py --root . --list",
                "python3 tools/athena_guard.py --root . --list-policy",
                "python3 tools/athena_guard.py --root . --check-command 'python3 migration_auto.py'",
                "python3 tools/athena_guard.py -- python3 migration_auto.py"
            ]
        }

    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 2 if result.get("decision") == "BLOCKED" else 0


if __name__ == "__main__":
    raise SystemExit(main())
