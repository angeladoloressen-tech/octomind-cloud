#!/usr/bin/env python3
import argparse
import json
import os
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

SAFE_DIRS = [
    "dist",
    "__pycache__",
    ".pytest_cache",
    ".ruff_cache",
    ".cache",
]

SAFE_FILES = [
    "titanius.log",
    "titanius_live.log",
    "gateway_live.log",
    "karargah_sinir_agi.json",
]

UNSAFE_AUTOMATION_FILES = [
    "autonomous_pipeline.yml",
    "deploy_web3.sh",
    "auto_evolve.sh",
    "auto_github_agent.sh",
    "auto_growth.sh",
    "auto_repair.sh",
    "auto_social.sh",
    "start_ouroboros.sh",
]

GENERATED_BUCKETS = [
    "runtime",
    "logs",
    "backups",
    "reports",
]

AGENT_SANDBOX_DIRS = [
    "hq_agents",
]

PYTHON_ENV_DIRS = [
    ".venv",
    "venv",
    "env",
]

NODE_DEPENDENCY_DIRS = [
    "node_modules",
    "octolawyer-cloud/node_modules",
]

DEPENDENCY_DIRS = PYTHON_ENV_DIRS + NODE_DEPENDENCY_DIRS


def bytes_for(path):
    if not path.exists():
        return 0
    if path.is_file() or path.is_symlink():
        return path.stat().st_size
    total = 0
    for child in path.rglob("*"):
        try:
            if child.is_file() or child.is_symlink():
                total += child.stat().st_size
        except OSError:
            pass
    return total


def count_files(path):
    if not path.exists():
        return 0
    if path.is_file():
        return 1
    total = 0
    for child in path.rglob("*"):
        if child.is_file():
            total += 1
    return total


def human(size):
    units = ["B", "KB", "MB", "GB"]
    value = float(size)
    for unit in units:
        if value < 1024 or unit == units[-1]:
            return f"{value:.1f}{unit}"
        value /= 1024
    return f"{value:.1f}GB"


def safe_targets():
    targets = [ROOT / name for name in SAFE_DIRS + SAFE_FILES]
    targets.extend(ROOT.rglob("__pycache__"))
    targets.extend(ROOT.rglob("*.pyc"))
    targets.extend((ROOT / "logs").glob("*.log") if (ROOT / "logs").exists() else [])
    targets.extend((ROOT / "runtime" / "pids").glob("*.pid") if (ROOT / "runtime" / "pids").exists() else [])
    return sorted(set(targets))


def remove_path(path):
    if not path.exists() and not path.is_symlink():
        return False
    if path.is_dir() and not path.is_symlink():
        shutil.rmtree(path)
    else:
        path.unlink()
    return True


def inspect(paths):
    rows = []
    for name in paths:
        path = ROOT / name
        rows.append({
            "path": name,
            "exists": path.exists(),
            "bytes": bytes_for(path),
            "size": human(bytes_for(path)),
            "files": count_files(path),
        })
    return rows


def inspect_unsafe_automation():
    rows = []
    for name in UNSAFE_AUTOMATION_FILES:
        path = ROOT / name
        rows.append({
            "path": name,
            "exists": path.exists(),
            "bytes": bytes_for(path),
            "size": human(bytes_for(path)),
            "files": count_files(path),
        })
    for pattern in ("**/.github/workflows", "**/.devcontainer"):
        for path in ROOT.glob(pattern):
            rows.append({
                "path": str(path.relative_to(ROOT)),
                "exists": path.exists(),
                "bytes": bytes_for(path),
                "size": human(bytes_for(path)),
                "files": count_files(path),
            })
    return rows


def main():
    parser = argparse.ArgumentParser(description="Octomind local artifact budget guard.")
    parser.add_argument("--apply", action="store_true", help="Remove safe generated artifacts.")
    parser.add_argument("--purge-generated", action="store_true", help="Also remove runtime/logs/backups/reports.")
    parser.add_argument("--purge-agent-sandboxes", action="store_true", help="Also remove local agent repo clones.")
    parser.add_argument("--purge-python-env", action="store_true", help="Also remove local Python virtual environments.")
    parser.add_argument("--purge-node-deps", action="store_true", help="Also remove local Node dependency directories.")
    parser.add_argument("--purge-deps", action="store_true", help="Also remove local dependency directories.")
    args = parser.parse_args()

    targets = safe_targets()
    if args.purge_generated:
        targets.extend(ROOT / name for name in GENERATED_BUCKETS)
    if args.purge_agent_sandboxes:
        targets.extend(ROOT / name for name in AGENT_SANDBOX_DIRS)
    if args.purge_python_env:
        targets.extend(ROOT / name for name in PYTHON_ENV_DIRS)
    if args.purge_node_deps:
        targets.extend(ROOT / name for name in NODE_DEPENDENCY_DIRS)
    if args.purge_deps:
        targets.extend(ROOT / name for name in DEPENDENCY_DIRS)

    targets = sorted(set(path for path in targets if path.exists()), key=lambda p: str(p))
    before = sum(bytes_for(path) for path in targets)
    removed = []

    if args.apply:
        for path in targets:
            size = bytes_for(path)
            if remove_path(path):
                removed.append({"path": str(path.relative_to(ROOT)), "bytes": size, "size": human(size)})

    audit_paths = GENERATED_BUCKETS + AGENT_SANDBOX_DIRS + DEPENDENCY_DIRS + SAFE_DIRS + SAFE_FILES
    report = {
        "mode": "apply" if args.apply else "audit",
        "safe_target_count": len(targets),
        "safe_target_bytes": before,
        "safe_target_size": human(before),
        "removed": removed,
        "audit": inspect(audit_paths),
        "unsafe_automation": inspect_unsafe_automation(),
        "policy": {
            "mac_role": "compute_only",
            "durable_storage": ["GitHub", "Cloudflare", "Supabase"],
            "local_allowed": ["source code", "package lockfiles", "temporary process state"],
            "local_forbidden": [
                "durable generated reports",
                "long lived logs",
                "model caches",
                "manual backup piles",
                "local agent repo clones",
                "public localhost production webhooks",
                "automatic git push scripts",
            ],
        },
    }
    print(json.dumps(report, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
