import os
import json
import time
import urllib.request
import urllib.error
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

def json_bytes(data):
    return json.dumps(data, ensure_ascii=False, indent=2).encode("utf-8")

def build_prompt(payload):
    sensor = payload.get("sensor", {})
    camera = payload.get("camera", {})
    command = payload.get("command", "analyze")
    return (
        "You are OctoMind Mother Logs. Analyze this webtop sensor and camera packet. "
        "Return a concise operational diagnosis with risks, next action, and confidence. "
        f"Command: {command}. "
        f"Sensor: {json.dumps(sensor, ensure_ascii=False)}. "
        f"Camera: {json.dumps(camera, ensure_ascii=False)}."
    )

def extract_openai_text(data):
    chunks = []
    for item in data.get("output", []):
        for content in item.get("content", []):
            text = content.get("text")
            if text:
                chunks.append(text)
    if chunks:
        return "\n".join(chunks).strip()
    if data.get("output_text"):
        return str(data["output_text"]).strip()
    return json.dumps(data, ensure_ascii=False)[:1200]

def call_openai(prompt):
    key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not key:
        return None
    model = os.environ.get("OCTOMIND_OPENAI_MODEL", "gpt-4.1-mini")
    body = {
        "model": model,
        "input": prompt
    }
    req = urllib.request.Request(
        "https://api.openai.com/v1/responses",
        data=json.dumps(body).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {key}"
        },
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=40) as res:
        data = json.loads(res.read().decode("utf-8"))
    return {
        "provider": "openai",
        "model": model,
        "analysis": extract_openai_text(data)
    }

def call_gemini(prompt):
    key = os.environ.get("GEMINI_API_KEY", os.environ.get("GOOGLE_API_KEY", "")).strip()
    if not key:
        return None
    model = os.environ.get("OCTOMIND_GEMINI_MODEL", "gemini-1.5-flash")
    endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
    body = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ]
    }
    req = urllib.request.Request(
        endpoint,
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=40) as res:
        data = json.loads(res.read().decode("utf-8"))
    parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
    text = "\n".join([p.get("text", "") for p in parts if p.get("text")]).strip()
    return {
        "provider": "gemini",
        "model": model,
        "analysis": text or json.dumps(data, ensure_ascii=False)[:1200]
    }

def local_fallback(payload):
    sensor = payload.get("sensor", {})
    camera = payload.get("camera", {})
    signal = float(sensor.get("signal", 0) or 0)
    motion = float(sensor.get("motion", 0) or 0)
    heat = float(sensor.get("heat", 0) or 0)
    objects = int(camera.get("objects", 0) or 0)
    risk = "low"
    if signal > 82 or motion > 72 or heat > 31 or objects > 6:
        risk = "high"
    elif signal > 55 or motion > 45 or heat > 26 or objects > 3:
        risk = "medium"
    return {
        "provider": "local_fallback",
        "model": "deterministic-sensor-rules",
        "analysis": (
            f"Sensor packet processed without external API key. "
            f"Risk is {risk}. Signal={signal}, motion={motion}, heat={heat}, objects={objects}. "
            "Next action: keep the camera window active and send a real provider key through the backend environment."
        )
    }

def analyze(payload):
    prompt = build_prompt(payload)
    preferred = os.environ.get("OCTOMIND_AI_PROVIDER", "auto").strip().lower()
    errors = []
    providers = []
    if preferred in ["openai", "auto"]:
        providers.append(call_openai)
    if preferred in ["gemini", "google", "auto"]:
        providers.append(call_gemini)
    for fn in providers:
        try:
            result = fn(prompt)
            if result:
                return result
        except Exception as e:
            errors.append(f"{fn.__name__}: {e}")
    result = local_fallback(payload)
    if errors:
        result["provider_errors"] = errors
    return result

class Handler(BaseHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def send_json(self, code, data):
        body = json_bytes(data)
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_json(200, {"ok": True})

    def do_GET(self):
        if self.path.startswith("/health"):
            self.send_json(200, {
                "ok": True,
                "service": "octomind-webtop-api-bridge",
                "openai_available": bool(os.environ.get("OPENAI_API_KEY")),
                "gemini_available": bool(os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")),
                "time": time.time()
            })
            return
        self.send_json(200, {
            "ok": True,
            "service": "octomind-webtop-api-bridge",
            "routes": ["/health", "/api/analyze"]
        })

    def do_POST(self):
        if not self.path.startswith("/api/analyze"):
            self.send_json(404, {"ok": False, "error": "not_found"})
            return
        try:
            length = int(self.headers.get("Content-Length", "0") or "0")
            raw = self.rfile.read(length).decode("utf-8")
            payload = json.loads(raw or "{}")
            result = analyze(payload)
            self.send_json(200, {
                "ok": True,
                "result": result,
                "received": payload,
                "time": time.time()
            })
        except Exception as e:
            self.send_json(500, {"ok": False, "error": str(e)})

def main():
    host = os.environ.get("OCTOMIND_HOST", "127.0.0.1")
    port = int(os.environ.get("OCTOMIND_PORT", "8765"))
    server = ThreadingHTTPServer((host, port), Handler)
    print(json.dumps({
        "status": "OCTOMIND_BACKEND_READY",
        "host": host,
        "port": port,
        "health": f"http://{host}:{port}/health",
        "api": f"http://{host}:{port}/api/analyze"
    }, indent=2), flush=True)
    server.serve_forever()

if __name__ == "__main__":
    main()
