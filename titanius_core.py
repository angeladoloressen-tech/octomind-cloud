import argparse
import html
import json
import logging
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

from flask import Flask, jsonify, request

APP_NAME = "OctoMind Athena Gate"
DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 5050
DRY_RUN_ONLY = True
WALLET_EXECUTION_ENABLED = False
MOTHER_APPROVAL_REQUIRED = True

BASE_DIR = Path(__file__).resolve().parent
RUNTIME_DIR = BASE_DIR / "runtime" / "athena_gate"
DB_PATH = RUNTIME_DIR / "titanius_logs.db"
LOG_PATH = RUNTIME_DIR / "titanius.log"

app = Flask(__name__)

SENSITIVE_KEYS = {
    "api_key",
    "secret",
    "private_key",
    "mnemonic",
    "seed",
    "token",
    "password"
}

MONEY_INTENT_KEYS = {
    "amount",
    "tx",
    "transaction",
    "trade",
    "order",
    "payment",
    "withdraw",
    "deposit",
    "gas",
    "swap",
    "arbitrage"
}

BANNED_TERMS = {
    "hack",
    "exploit",
    "bypass"
}

def utc_now():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

def ensure_runtime():
    RUNTIME_DIR.mkdir(parents=True, exist_ok=True)
    logging.basicConfig(
        filename=str(LOG_PATH),
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s"
    )

def sanitize(value):
    if isinstance(value, dict):
        clean = {}
        for key, item in value.items():
            key_text = str(key).lower()
            if key_text in SENSITIVE_KEYS:
                clean[key] = "[REDACTED]"
            else:
                clean[key] = sanitize(item)
        return clean
    if isinstance(value, list):
        return [sanitize(item) for item in value[:50]]
    return value

def detect_risks(payload):
    text = json.dumps(payload, ensure_ascii=False, default=str).lower()
    flags = []

    for key in MONEY_INTENT_KEYS:
        if key in text:
            flags.append(f"money_intent:{key}")

    for key in SENSITIVE_KEYS:
        if key in text:
            flags.append(f"sensitive_intent:{key}")

    for term in BANNED_TERMS:
        if term in text:
            flags.append(f"banned_term:{term}")

    if isinstance(payload, dict):
        amount = payload.get("amount")
        if isinstance(amount, (int, float)) and amount > 5000:
            flags.append("risk:high_amount_over_5000")

        case_text = str(payload.get("case", "")).lower()
        if "crypto" in case_text:
            flags.append("risk:crypto_domain_detected")

    return sorted(set(flags))

def init_db():
    ensure_runtime()
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            "CREATE TABLE IF NOT EXISTS risk_logs "
            "(id INTEGER PRIMARY KEY AUTOINCREMENT, "
            "timestamp TEXT, decision TEXT, risk_flags TEXT, payload TEXT)"
        )

def log_to_db(event):
    init_db()
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            "INSERT INTO risk_logs (timestamp, decision, risk_flags, payload) VALUES (?, ?, ?, ?)",
            (
                event["created_at"],
                event["decision"],
                json.dumps(event["risk_flags"], ensure_ascii=False),
                json.dumps(event.get("input_preview", {}), ensure_ascii=False)
            )
        )

@app.get("/")
def index():
    return """
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>OctoMind Athena Gate</title>
  </head>
  <body style="background:#111827;color:#e5e7eb;font-family:monospace;padding:40px;">
    <h1>OctoMind Athena Gate</h1>
    <p>Status: localhost-only dry-run gate active.</p>
    <p>Wallet execution: disabled.</p>
    <p>Mother approval: required.</p>
  </body>
</html>
""", 200

@app.get("/api/health")
def health():
    return jsonify({
        "status": "ATHENA_GATE_HEALTHY",
        "app": APP_NAME,
        "host": DEFAULT_HOST,
        "port": DEFAULT_PORT,
        "dry_run_only": DRY_RUN_ONLY,
        "wallet_execution_enabled": WALLET_EXECUTION_ENABLED,
        "mother_approval_required": MOTHER_APPROVAL_REQUIRED,
        "created_at": utc_now()
    })

@app.post("/analyze")
def analyze():
    payload = request.get_json(silent=True) or {}
    clean_payload = sanitize(payload)
    risk_flags = detect_risks(clean_payload)

    decision = "SIMULATED_ONLY"
    if risk_flags:
        decision = "BLOCKED_BY_DRY_RUN_GATE"

    event = {
        "status": "ATHENA_ANALYZE_DRY_RUN",
        "decision": decision,
        "risk_flags": risk_flags,
        "wallet_execution_enabled": False,
        "mother_approval_required": True,
        "input_preview": clean_payload,
        "created_at": utc_now()
    }

    logging.info("ATHENA_DRY_RUN_EVENT %s", json.dumps(event, ensure_ascii=False))
    log_to_db(event)
    return jsonify(event), 200

@app.get("/logs")
def view_logs():
    try:
        init_db()
        with sqlite3.connect(DB_PATH) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute("SELECT * FROM risk_logs ORDER BY id DESC LIMIT 100")
            rows = cursor.fetchall()

        logs = []
        for row in rows:
            item = dict(row)
            item["risk_flags"] = json.loads(item["risk_flags"]) if item.get("risk_flags") else []
            item["payload"] = json.loads(item["payload"]) if item.get("payload") else {}
            logs.append(item)

        return jsonify({"status": "SUCCESS", "total": len(logs), "logs": logs}), 200
    except Exception as exc:
        logging.error("LOG_READ_ERROR %s", exc)
        return jsonify({"status": "ERROR", "message": str(exc)}), 500

@app.post("/logs/clear")
def clear_logs_disabled():
    event = {
        "status": "ATHENA_LOG_CLEAR_DISABLED",
        "decision": "BLOCKED_BY_DRY_RUN_GATE",
        "risk_flags": ["destructive_log_clear_disabled"],
        "wallet_execution_enabled": False,
        "mother_approval_required": True,
        "input_preview": {"route": "/logs/clear"},
        "created_at": utc_now()
    }
    logging.warning("ATHENA_LOG_CLEAR_DISABLED %s", json.dumps(event, ensure_ascii=False))
    return jsonify(event), 403

@app.get("/logs/view")
def view_logs_html():
    filter_decision = request.args.get("filter")
    query = "SELECT * FROM risk_logs"
    params = []

    if filter_decision == "blocked":
        query += " WHERE decision = ?"
        params.append("BLOCKED_BY_DRY_RUN_GATE")

    query += " ORDER BY id DESC LIMIT 100"

    try:
        init_db()
        with sqlite3.connect(DB_PATH) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute(query, params)
            rows = cursor.fetchall()

        row_html = []
        for row in rows:
            item = dict(row)
            try:
                payload_obj = json.loads(item.get("payload") or "{}")
                pretty_payload = json.dumps(payload_obj, indent=2, ensure_ascii=False)
            except Exception:
                pretty_payload = str(item.get("payload", ""))

            decision = str(item.get("decision", ""))
            decision_color = "#ef4444" if decision == "BLOCKED_BY_DRY_RUN_GATE" else "#e5e7eb"

            row_html.append(
                "<tr>"
                f"<td>{html.escape(str(item.get('id', '')))}</td>"
                f"<td>{html.escape(str(item.get('timestamp', '')))}</td>"
                f"<td style='color:{decision_color};font-weight:bold;'>{html.escape(decision)}</td>"
                f"<td>{html.escape(str(item.get('risk_flags', '')))}</td>"
                f"<td><pre>{html.escape(pretty_payload)}</pre></td>"
                "</tr>"
            )

        active_label = "Blocked only" if filter_decision == "blocked" else "All entries"
        page = f"""
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Athena Risk Logs</title>
    <style>
      body {{ background:#111827; color:#e5e7eb; font-family:monospace; padding:20px; }}
      h1 {{ color:#f59e0b; border-bottom:2px solid #f59e0b; padding-bottom:10px; }}
      table {{ width:100%; border-collapse:collapse; margin-top:20px; background:#1f2937; border:2px solid #ffffff; }}
      th, td {{ border:1px solid #4b5563; padding:10px; text-align:left; vertical-align:top; }}
      th {{ background:#374151; color:#10b981; }}
      pre {{ margin:0; font-size:12px; max-width:420px; overflow-x:auto; white-space:pre-wrap; }}
      a {{ color:#93c5fd; }}
      .disabled {{ color:#9ca3af; border:1px solid #4b5563; padding:6px 10px; display:inline-block; margin-bottom:12px; }}
    </style>
  </head>
  <body>
    <h1>Athena Risk Logs</h1>
    <div class="disabled">Log cleanup is disabled in dry-run mode.</div>
    <div>View: {html.escape(active_label)} | <a href="/logs/view">All</a> | <a href="/logs/view?filter=blocked">Blocked</a></div>
    <table>
      <tr><th>ID</th><th>Time</th><th>Decision</th><th>Flags</th><th>Payload</th></tr>
      {"".join(row_html)}
    </table>
  </body>
</html>
"""
        return page, 200
    except Exception as exc:
        logging.error("HTML_LOG_READ_ERROR %s", exc)
        return f"Error: {html.escape(str(exc))}", 500

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="OctoMind Athena Gate")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT, help="Server port number")
    parser.add_argument("--host", type=str, default=DEFAULT_HOST, help="Server host address")
    args = parser.parse_args()

    init_db()
    logging.info(
        "ATHENA_GATE_START host=%s port=%s dry_run_only=%s",
        args.host,
        args.port,
        DRY_RUN_ONLY
    )
    app.run(host=args.host, port=args.port, debug=False)
