#!/usr/bin/env python3
"""
OCTOMIND ZERO-SECRET BOOTSTRAP
Purpose: get a Cloudflare Worker online first, without Claude/GitHub/Supabase secrets.
After the Worker is live, add secrets with wrangler secret put.
"""
import os
import re
import sys
import time
import json
import shutil
import subprocess
import urllib.request
from pathlib import Path

G='\033[0;32m'; B='\033[0;34m'; P='\033[0;35m'; Y='\033[1;33m'; R='\033[0;31m'; NC='\033[0m'

def log(x): print(f"{G}[✓]{NC} {x}", flush=True)
def info(x): print(f"{B}[→]{NC} {x}", flush=True)
def warn(x): print(f"{Y}[!]{NC} {x}", flush=True)
def fail(x): print(f"{R}[✗]{NC} {x}", flush=True); sys.exit(1)

HOME = Path.home()
ROOT = HOME / 'octomind'
APP = ROOT / 'octomind-zero-secret-worker'
URL_FILE = ROOT / 'octomind_zero_secret_url.txt'
ROOT.mkdir(parents=True, exist_ok=True)
APP.mkdir(parents=True, exist_ok=True)
os.chdir(APP)

print(f"""{P}
═══════════════════════════════════════════════
  OCTOMIND ZERO-SECRET CLOUD BOOTSTRAP
═══════════════════════════════════════════════{NC}
Goal: deploy first. Secrets later.
No Claude key required. No GitHub token required. No Supabase key required.
""")


def sh(cmd, check=False, capture=False, env=None):
    merged = os.environ.copy()
    if env:
        merged.update(env)
    if capture:
        return subprocess.run(cmd, text=True, capture_output=True, env=merged)
    return subprocess.run(cmd, text=True, env=merged, check=check)

info('Checking Node/npm/wrangler')
if not shutil.which('node'):
    if shutil.which('brew'):
        warn('Node is missing. Installing with Homebrew.')
        sh(['brew', 'install', 'node'], check=True)
    else:
        fail('Node.js missing and Homebrew not found. Install Node.js first.')

if not shutil.which('npm'):
    fail('npm not found.')

if not shutil.which('wrangler'):
    info('Installing Wrangler globally')
    sh(['npm', 'install', '-g', 'wrangler@latest'], check=True)

v = sh(['wrangler', '--version'], capture=True)
log((v.stdout or v.stderr or 'wrangler ready').strip().splitlines()[0])

worker_js = r'''
function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {"content-type": "application/json;charset=utf-8"}
  });
}

function html() {
  const now = new Date().toISOString();
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Octomind Zero-Secret Brain</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#09090b;color:#e4e4e7;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}.header{padding:22px 26px;background:#18181b;border-bottom:1px solid #27272a;display:flex;justify-content:space-between;align-items:center}.logo{color:#a78bfa;font-size:18px;font-weight:900;letter-spacing:4px}.live{color:#22c55e;font-size:11px;letter-spacing:2px}.body{padding:24px}.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:22px}.card{background:#18181b;border:1px solid #27272a;border-radius:14px;padding:18px;text-align:center}.num{font-size:30px;color:#a78bfa;font-weight:900}.lbl{font-size:10px;color:#71717a;letter-spacing:2px;margin-top:7px}.panel{background:#111114;border:1px solid #27272a;border-radius:14px;padding:18px;margin-bottom:16px}.title{font-size:11px;color:#71717a;letter-spacing:3px;margin-bottom:12px}.ok{color:#22c55e}.warn{color:#f59e0b}pre{white-space:pre-wrap;color:#a1a1aa;font-size:12px;line-height:1.6}.footer{padding:14px 24px;color:#52525b;border-top:1px solid #18181b;text-align:center;font-size:10px}@media(max-width:800px){.grid{grid-template-columns:1fr 1fr}.header{display:block}.live{margin-top:8px}}
</style>
</head>
<body>
<div class="header"><div class="logo">OCTOMIND</div><div class="live">ZERO-SECRET WORKER · LIVE</div></div>
<div class="body">
<div class="grid">
<div class="card"><div class="num">1</div><div class="lbl">WORKER</div></div>
<div class="card"><div class="num">0</div><div class="lbl">SECRETS NEEDED</div></div>
<div class="card"><div class="num">SAFE</div><div class="lbl">MODE</div></div>
<div class="card"><div class="num">${now.slice(11,16)}</div><div class="lbl">UTC</div></div>
</div>
<div class="panel"><div class="title">STATUS</div><pre class="ok">Cloud brain is online. This is the base layer. Add Claude/GitHub/Supabase secrets later.</pre></div>
<div class="panel"><div class="title">NEXT COMMANDS</div><pre>curl -X POST ${location.origin}/run
curl ${location.origin}/status
wrangler secret put CLAUDE_KEY
wrangler secret put GITHUB_TOKEN
wrangler secret put GITHUB_REPO
wrangler secret put SB_URL
wrangler secret put SB_KEY</pre></div>
<div class="panel"><div class="title">SAFETY</div><pre class="warn">No wallet. No trading. No payment. No email. No official submission. Human approval required for external actions.</pre></div>
</div>
<div class="footer">Octomind Zero-Secret Bootstrap · ${now}</div>
</body>
</html>`;
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === "/status") {
      return json({
        ok: true,
        mode: "zero_secret_safe_bootstrap",
        worker: "online",
        timestamp: new Date().toISOString(),
        secrets_expected_later: ["CLAUDE_KEY", "GITHUB_TOKEN", "GITHUB_REPO", "SB_URL", "SB_KEY"],
        safety: {
          wallet: false,
          trading: false,
          money_ops: false,
          email_send: false,
          official_submission: false
        }
      });
    }
    if (url.pathname === "/run" && req.method === "POST") {
      return json({
        ok: true,
        mode: "dry_run_no_secret",
        timestamp: new Date().toISOString(),
        brain: {
          dusunce: "Base cloud worker is alive.",
          aksiyon: "Next step is adding secrets and database memory.",
          gelir_fikri: "Sell Octomind Cloud Audit as a setup/report package.",
          evrim_skoru: 0.1
        }
      });
    }
    return new Response(html(), {headers: {"content-type": "text/html;charset=utf-8"}});
  },
  async scheduled(event, env, ctx) {
    console.log("octomind zero-secret scheduled pulse", new Date().toISOString());
  }
};
'''

wrangler_toml = '''name = "octomind-zero-secret"
main = "worker.js"
compatibility_date = "2024-09-23"

[triggers]
crons = ["0 * * * *"]
'''

package_json = {
    "name": "octomind-zero-secret-worker",
    "version": "1.0.0",
    "private": True,
    "scripts": {"deploy": "wrangler deploy", "dev": "wrangler dev", "tail": "wrangler tail"},
    "devDependencies": {"wrangler": "latest"}
}

(APP / 'worker.js').write_text(worker_js, encoding='utf-8')
(APP / 'wrangler.toml').write_text(wrangler_toml, encoding='utf-8')
(APP / 'package.json').write_text(json.dumps(package_json, indent=2), encoding='utf-8')
log(f'Worker files written: {APP}')

info('Checking Cloudflare login')
who = sh(['wrangler', 'whoami'], capture=True)
if who.returncode != 0:
    warn('Cloudflare login needed. Browser login will open. Complete it, then return here.')
    sh(['wrangler', 'login'], check=True)
else:
    log('Cloudflare login already OK')

info('Deploying Worker')
# Important: inherit terminal stdin/stdout. Do not capture output; this keeps wrangler interactive.
deploy = sh(['wrangler', 'deploy'])
if deploy.returncode != 0:
    fail('Deploy failed. Run: cd ~/octomind/octomind-zero-secret-worker && wrangler deploy')

info('Reading deployments for URL')
out = sh(['wrangler', 'deployments', 'list'], capture=True)
text = (out.stdout or '') + '\n' + (out.stderr or '')
match = re.search(r'https://[A-Za-z0-9._-]+\.workers\.dev', text)
url = match.group(0) if match else ''

if not url:
    # Common default; user can still inspect dashboard if account subdomain is custom.
    url = 'https://octomind-zero-secret.YOUR-SUBDOMAIN.workers.dev'
    warn('Could not auto-read workers.dev URL. Open Cloudflare dashboard or inspect wrangler deploy output above.')
else:
    URL_FILE.write_text(url, encoding='utf-8')
    log(f'URL saved: {URL_FILE}')
    try:
        raw = urllib.request.urlopen(url + '/status', timeout=20).read().decode()
        print(raw)
    except Exception as e:
        warn(f'Status check warning: {e}')

print(f"""{P}
═══════════════════════════════════════════════
{G}  OCTOMIND ZERO-SECRET WORKER READY{NC}
{P}═══════════════════════════════════════════════{NC}

Dashboard : {url}/
Status    : curl {url}/status
Run       : curl -X POST {url}/run
Local     : {APP}

Next, when ready:
  cd {APP}
  wrangler secret put CLAUDE_KEY
  wrangler secret put GITHUB_TOKEN
  wrangler secret put GITHUB_REPO
  wrangler secret put SB_URL
  wrangler secret put SB_KEY

{Y}Base cloud brain is now the priority. Secrets are phase 2.{NC}
{P}═══════════════════════════════════════════════{NC}
""")
