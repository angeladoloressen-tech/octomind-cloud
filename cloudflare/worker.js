function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "content-type": "application/json;charset=utf-8" }
  });
}

function html(env) {
  const now = new Date().toISOString();
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Octomind Cloud Brain</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#09090b;color:#e4e4e7;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}.header{padding:22px 26px;background:#18181b;border-bottom:1px solid #27272a;display:flex;justify-content:space-between;align-items:center}.logo{color:#a78bfa;font-size:18px;font-weight:900;letter-spacing:4px}.live{color:#22c55e;font-size:11px;letter-spacing:2px}.body{padding:24px}.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:22px}.card{background:#18181b;border:1px solid #27272a;border-radius:14px;padding:18px;text-align:center}.num{font-size:30px;color:#a78bfa;font-weight:900}.lbl{font-size:10px;color:#71717a;letter-spacing:2px;margin-top:7px}.panel{background:#111114;border:1px solid #27272a;border-radius:14px;padding:18px;margin-bottom:16px}.title{font-size:11px;color:#71717a;letter-spacing:3px;margin-bottom:12px}.ok{color:#22c55e}.warn{color:#f59e0b}pre{white-space:pre-wrap;color:#a1a1aa;font-size:12px;line-height:1.6}.footer{padding:14px 24px;color:#52525b;border-top:1px solid #18181b;text-align:center;font-size:10px}@media(max-width:800px){.grid{grid-template-columns:1fr 1fr}.header{display:block}.live{margin-top:8px}}
</style>
</head>
<body>
<div class="header"><div class="logo">OCTOMIND</div><div class="live">CLOUD WORKER · LIVE</div></div>
<div class="body">
<div class="grid">
<div class="card"><div class="num">1</div><div class="lbl">WORKER</div></div>
<div class="card"><div class="num">${env.CLAUDE_KEY ? "ON" : "OFF"}</div><div class="lbl">CLAUDE</div></div>
<div class="card"><div class="num">${env.GITHUB_TOKEN ? "ON" : "OFF"}</div><div class="lbl">GITHUB</div></div>
<div class="card"><div class="num">${now.slice(11,16)}</div><div class="lbl">UTC</div></div>
</div>
<div class="panel"><div class="title">STATUS</div><pre class="ok">Cloud brain is online. Mac is not the runtime. Cloudflare is the runtime.</pre></div>
<div class="panel"><div class="title">ENDPOINTS</div><pre>GET  /status
POST /run</pre></div>
<div class="panel"><div class="title">SAFETY</div><pre class="warn">No wallet. No trading. No payment. No email. No official submission. Human approval required for external actions.</pre></div>
</div>
<div class="footer">Octomind Cloud Brain · ${now}</div>
</body>
</html>`;
}

async function think(env, ctx) {
  if (!env.CLAUDE_KEY) {
    return {
      dusunce: "Cloud base is alive; Claude secret is not attached yet.",
      aksiyon: "Attach CLAUDE_KEY later for active reasoning.",
      gelir_fikri: "Octomind Cloud Audit report package",
      evrim_skoru: 0.1
    };
  }

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.CLAUDE_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 700,
      system: "You are Octomind Cloud Brain. Return only compact JSON. Do not perform external irreversible actions.",
      messages: [{ role: "user", content: ctx }]
    })
  });

  const d = await r.json();
  const text = d?.content?.[0]?.text || "{}";
  try {
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    return {
      dusunce: "Claude returned non-JSON.",
      aksiyon: "Fallback safe mode.",
      gelir_fikri: "AI setup audit",
      evrim_skoru: 0
    };
  }
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);

    if (url.pathname === "/status") {
      return json({
        ok: true,
        mode: "cloud_only",
        worker: "online",
        timestamp: new Date().toISOString(),
        claude: Boolean(env.CLAUDE_KEY),
        github: Boolean(env.GITHUB_TOKEN),
        supabase: Boolean(env.SB_URL && env.SB_KEY),
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
      const brain = await think(env, "Run one safe Octomind cycle. Produce only analysis, next action, and revenue idea.");
      return json({
        ok: true,
        timestamp: new Date().toISOString(),
        brain
      });
    }

    return new Response(html(env), { headers: { "content-type": "text/html;charset=utf-8" } });
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(think(env, "Scheduled safe pulse."));
  }
};
