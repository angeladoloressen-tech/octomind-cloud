function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "content-type": "application/json;charset=utf-8" }
  });
}

const SAFETY = {
  wallet: false,
  trading: false,
  money_ops: false,
  email_send: false,
  official_submission: false,
  destructive_actions: false,
  human_approval_required: true
};

function has(env, key) {
  return Boolean(env[key] && String(env[key]).trim());
}

function esc(x) {
  return String(x || "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  }[c]));
}

function envStatus(env) {
  return {
    claude: has(env, "CLAUDE_KEY"),
    github: has(env, "GITHUB_TOKEN") && has(env, "GITHUB_REPO"),
    supabase: has(env, "SB_URL") && has(env, "SB_KEY"),
    repo: env.GITHUB_REPO || null
  };
}

async function sb(env, path, opts = {}) {
  if (!has(env, "SB_URL") || !has(env, "SB_KEY")) return null;
  try {
    const r = await fetch(env.SB_URL + "/rest/v1/" + path, {
      ...opts,
      headers: {
        apikey: env.SB_KEY,
        Authorization: "Bearer " + env.SB_KEY,
        "Content-Type": "application/json",
        Prefer: "return=representation",
        ...(opts.headers || {})
      }
    });
    if (!r.ok) return null;
    const t = await r.text();
    return t ? JSON.parse(t) : null;
  } catch {
    return null;
  }
}

async function loadMemory(env) {
  const [memory, cycles, tools] = await Promise.all([
    sb(env, "octomind_brain?order=updated_at.desc&limit=12"),
    sb(env, "octomind_cycles?order=created_at.desc&limit=8"),
    sb(env, "octomind_tools?order=created_at.desc&limit=8")
  ]);
  return {
    memory: Array.isArray(memory) ? memory : [],
    cycles: Array.isArray(cycles) ? cycles : [],
    tools: Array.isArray(tools) ? tools : []
  };
}

async function saveMemory(env, brain, githubCommit, now) {
  if (!has(env, "SB_URL") || !has(env, "SB_KEY")) return false;

  if (brain && brain.yeni_bilgi && typeof brain.yeni_bilgi === "object") {
    for (const [k, v] of Object.entries(brain.yeni_bilgi)) {
      const key = encodeURIComponent(String(k));
      const old = await sb(env, "octomind_brain?key=eq." + key);
      if (old && old.length) {
        await sb(env, "octomind_brain?key=eq." + key, {
          method: "PATCH",
          body: JSON.stringify({ value: String(v), updated_at: now })
        });
      } else {
        await sb(env, "octomind_brain", {
          method: "POST",
          body: JSON.stringify({ key: String(k), value: String(v), created_at: now, updated_at: now })
        });
      }
    }
  }

  await sb(env, "octomind_cycles", {
    method: "POST",
    body: JSON.stringify({
      dusunce: brain?.dusunce || brain?.düşünce || "",
      aksiyon: brain?.aksiyon || "",
      gelir_fikri: brain?.gelir_fikri || "",
      evrim_skoru: Number(brain?.evrim_skoru || 0),
      github_commit: Boolean(githubCommit),
      created_at: now
    })
  });

  return true;
}

async function ghCommit(env, file, content, message) {
  if (!has(env, "GITHUB_TOKEN") || !has(env, "GITHUB_REPO")) return false;

  const safePath = String(file || "reports/octomind_cycle.md")
    .replace(/^\/+/, "")
    .replace(/\.\./g, "_")
    .replace(/[^A-Za-z0-9_./-]/g, "_");

  const url = "https://api.github.com/repos/" + env.GITHUB_REPO + "/contents/" + safePath;

  const existing = await fetch(url, {
    headers: {
      Authorization: "token " + env.GITHUB_TOKEN,
      "User-Agent": "Octomind-Cloud-Brain"
    }
  }).then(r => r.ok ? r.json() : null).catch(() => null);

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: "token " + env.GITHUB_TOKEN,
      "Content-Type": "application/json",
      "User-Agent": "Octomind-Cloud-Brain"
    },
    body: JSON.stringify({
      message: message || "octomind: safe cloud cycle",
      content: btoa(unescape(encodeURIComponent(String(content || "")))),
      ...(existing?.sha ? { sha: existing.sha } : {})
    })
  });

  return res.ok;
}

function fallbackBrain() {
  return {
    dusunce: "Cloud brain base is online; reasoning secret is not attached yet.",
    aksiyon: "Keep runtime in Cloudflare and attach CLAUDE_KEY when ready.",
    yeni_bilgi: { mode: "cloud_only_safe_base" },
    gelir_fikri: "Octomind Cloud Audit: setup, cleanup, deployment and safety report package.",
    kod_yaz: {
      dosya: "reports/octomind_safe_cycle.md",
      icerik: "# Octomind Safe Cycle\n\nCloud base is online. Attach reasoning and memory secrets next.\n"
    },
    evrim_skoru: 0.1
  };
}

async function think(env, ctx) {
  if (!has(env, "CLAUDE_KEY")) return fallbackBrain();

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.CLAUDE_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 900,
      system: `You are Octomind Cloud Brain.
Return only compact JSON.
Never perform wallet, trading, payment, email sending, official submission, destructive or irreversible external actions.
Only produce safe analysis, drafts, repository reports, and next-step decisions.
Required JSON keys: dusunce, aksiyon, yeni_bilgi, gelir_fikri, kod_yaz, evrim_skoru.`,
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
      aksiyon: "Fallback safe report generated.",
      yeni_bilgi: { last_error: "claude_non_json" },
      gelir_fikri: "AI systems audit and cleanup package.",
      kod_yaz: {
        dosya: "reports/octomind_json_fallback.md",
        icerik: "# JSON Fallback\n\nClaude returned non-JSON. Safe fallback activated.\n"
      },
      evrim_skoru: 0
    };
  }
}

function buildContext(memoryBundle, now, mode) {
  const memory = memoryBundle.memory.map(m => `${m.key}: ${m.value}`).join("\n") || "no persistent memory yet";
  const cycles = memoryBundle.cycles.map(c => `${(c.created_at || "").slice(0, 16)} | ${c.aksiyon || ""}`).join("\n") || "no prior cycles";
  const tools = memoryBundle.tools.map(t => t.name).join(", ") || "none";

  return `Time: ${now}
Mode: ${mode}

Memory:
${memory}

Recent cycles:
${cycles}

Tools/reports:
${tools}

Mission:
Build a cloud-only AI command brain for product, revenue, automation and safe execution.
Mac is not runtime. Cloudflare is runtime. GitHub is durable source. Supabase is optional memory.
Return one safe next step and one revenue-oriented artifact.`;
}

async function runCycle(env, mode = "manual") {
  const now = new Date().toISOString();
  const status = envStatus(env);
  const memoryBundle = await loadMemory(env);
  const ctx = buildContext(memoryBundle, now, mode);
  const brain = await think(env, ctx);

  let githubCommit = false;
  if (brain?.kod_yaz?.dosya && brain?.kod_yaz?.icerik) {
    githubCommit = await ghCommit(
      env,
      brain.kod_yaz.dosya,
      brain.kod_yaz.icerik,
      "octomind: safe cloud cycle " + now
    );
  }

  const dbSaved = await saveMemory(env, brain, githubCommit, now);

  return {
    ok: true,
    timestamp: now,
    mode,
    status,
    db_saved: dbSaved,
    github_commit: githubCommit,
    safety: SAFETY,
    brain
  };
}

function html(env) {
  const now = new Date().toISOString();
  const s = envStatus(env);
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Octomind Cloud Brain</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#09090b;color:#e4e4e7;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}.header{padding:22px 26px;background:#18181b;border-bottom:1px solid #27272a;display:flex;justify-content:space-between;align-items:center}.logo{color:#a78bfa;font-size:18px;font-weight:900;letter-spacing:4px}.live{color:#22c55e;font-size:11px;letter-spacing:2px}.body{padding:24px}.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:22px}.card{background:#18181b;border:1px solid #27272a;border-radius:14px;padding:18px;text-align:center}.num{font-size:28px;color:#a78bfa;font-weight:900}.lbl{font-size:10px;color:#71717a;letter-spacing:2px;margin-top:7px}.panel{background:#111114;border:1px solid #27272a;border-radius:14px;padding:18px;margin-bottom:16px}.title{font-size:11px;color:#71717a;letter-spacing:3px;margin-bottom:12px}.ok{color:#22c55e}.warn{color:#f59e0b}pre{white-space:pre-wrap;color:#a1a1aa;font-size:12px;line-height:1.6}.footer{padding:14px 24px;color:#52525b;border-top:1px solid #18181b;text-align:center;font-size:10px}@media(max-width:800px){.grid{grid-template-columns:1fr 1fr}.header{display:block}.live{margin-top:8px}}
</style>
</head>
<body>
<div class="header"><div class="logo">OCTOMIND</div><div class="live">CLOUD WORKER · LIVE</div></div>
<div class="body">
<div class="grid">
<div class="card"><div class="num">ON</div><div class="lbl">WORKER</div></div>
<div class="card"><div class="num">${s.claude ? "ON" : "OFF"}</div><div class="lbl">CLAUDE</div></div>
<div class="card"><div class="num">${s.github ? "ON" : "OFF"}</div><div class="lbl">GITHUB</div></div>
<div class="card"><div class="num">${s.supabase ? "ON" : "OFF"}</div><div class="lbl">MEMORY</div></div>
</div>
<div class="panel"><div class="title">STATUS</div><pre class="ok">Cloud brain is online. Mac is only a screen. Cloudflare is runtime.</pre></div>
<div class="panel"><div class="title">ENDPOINTS</div><pre>GET  /status
POST /run
GET  /health</pre></div>
<div class="panel"><div class="title">SAFETY</div><pre class="warn">No wallet. No trading. No payment. No email. No official submission. Human approval required for external actions.</pre></div>
</div>
<div class="footer">Octomind Cloud Brain · ${now}</div>
</body>
</html>`;
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);

    if (url.pathname === "/health") {
      return json({ ok: true, service: "octomind-cloud-brain", timestamp: new Date().toISOString() });
    }

    if (url.pathname === "/status") {
      return json({
        ok: true,
        mode: "cloud_only",
        worker: "online",
        timestamp: new Date().toISOString(),
        status: envStatus(env),
        safety: SAFETY
      });
    }

    if (url.pathname === "/run" && req.method === "POST") {
      return json(await runCycle(env, "manual"));
    }

    return new Response(html(env), { headers: { "content-type": "text/html;charset=utf-8" } });
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(runCycle(env, "scheduled"));
  }
};