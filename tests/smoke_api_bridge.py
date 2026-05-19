import os
import sys
import json
import time
import signal
import socket
import pathlib
import subprocess
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
PORT = "8766"

def wait_port(port, timeout=10):
    start = time.time()
    while time.time() - start < timeout:
        try:
            with socket.create_connection(("127.0.0.1", int(port)), timeout=0.5):
                return True
        except OSError:
            time.sleep(0.2)
    return False

env = os.environ.copy()
env["OCTOMIND_PORT"] = PORT
proc = subprocess.Popen(
    [sys.executable, str(ROOT / "api" / "octomind_backend.py")],
    cwd=str(ROOT),
    env=env,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True
)

try:
    if not wait_port(PORT):
        out, err = proc.communicate(timeout=2)
        raise SystemExit(json.dumps({
            "ok": False,
            "status": "backend_not_ready",
            "stdout": out,
            "stderr": err
        }, indent=2))

    payload = json.dumps({
        "command": "smoke",
        "sensor": {"signal": 72, "motion": 41, "heat": 22.4},
        "camera": {"mode": "simulated", "objects": 3, "focus": "stable"}
    }).encode("utf-8")

    req = urllib.request.Request(
        f"http://127.0.0.1:{PORT}/api/analyze",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    with urllib.request.urlopen(req, timeout=20) as res:
        data = json.loads(res.read().decode("utf-8"))

    assert data["ok"] is True
    assert "analysis" in data["result"]

    print(json.dumps({
        "ok": True,
        "status": "analysis_ok",
        "provider": data["result"]["provider"],
        "has_analysis": bool(data["result"]["analysis"])
    }, indent=2))
finally:
    proc.terminate()
    try:
        proc.wait(timeout=3)
    except subprocess.TimeoutExpired:
        proc.kill()
