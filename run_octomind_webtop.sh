#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
export PYTHONDONTWRITEBYTECODE=1
export PYTHONPYCACHEPREFIX="${TMPDIR:-/tmp}/octomind_pycache"
printf '%s\n' '{"status":"OCTOMIND_WEBTOP_STARTING","backend":"http://127.0.0.1:8765/api/health","webtop":"webtop/index.html","browser_opened":false,"note":"No automatic browser opening."}'
python3 api/octomind_backend.py
