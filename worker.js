const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-admin-token"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...cors }
  });
}

function html(body, status = 200) {
  return new Response(body, {
    status,
    headers: { "content-type": "text/html; charset=utf-8", ...cors }
  });
}

function isAdmin(request, env) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || request.headers.get("x-admin-token");
  return Boolean(env.ADMIN_TOKEN && token && token === env.ADMIN_TOKEN);
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function getMarketScan() {
  try {
    const [binanceRes, coinbaseRes] = await Promise.all([
      fetch("https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT"),
      fetch("https://api.exchange.coinbase.com/products/ETH-USD/ticker")
    ]);
    const binance = await binanceRes.json();
    const coinbase = await coinbaseRes.json();
    const priceBinance = Number(binance.price);
    const priceCoinbase = Number(coinbase.price);
    const spread = Math.abs(priceBinance - priceCoinbase);
    const spreadPercentage = (spread / priceBinance) * 100;
    return {
      timestamp: new Date().toISOString(),
      binance_price: priceBinance,
      coinbase_price: priceCoinbase,
      spread_usd: spread.toFixed(2),
      spread_percentage: spreadPercentage.toFixed(4) + "%",
      action: spreadPercentage > 0.5 ? "MANUAL_REVIEW_REQUIRED" : "MONITORING"
    };
  } catch (error) {
    return { timestamp: new Date().toISOString(), status: "ERROR", message: error.message };
  }
}

async function listLeads(env, includeTest = false) {
  if (!env.LEADS) return [];
  const listed = await env.LEADS.list({ prefix: "lead:" });
  const leads = [];
  for (const key of listed.keys) {
    const value = await env.LEADS.get(key.name, "json");
    if (!value) continue;
    if (!includeTest && String(value.contact || "").toLowerCase() === "test@example.com") continue;
    leads.push({ key: key.name, ...value });
  }
  leads.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  return leads;
}

async function cleanupTestLeads(env) {
  if (!env.LEADS) return { deleted: 0 };
  const listed = await env.LEADS.list({ prefix: "lead:" });
  let deleted = 0;
  for (const key of listed.keys) {
    const value = await env.LEADS.get(key.name, "json");
    if (value && String(value.contact || "").toLowerCase() === "test@example.com") {
      await env.LEADS.delete(key.name);
      deleted += 1;
    }
  }
  return { deleted };
}

function styles() {
  return `:root{--bg:#070a12;--panel:#0d1321;--line:#223047;--text:#eef2ff;--muted:#9ca3af;--brand:#7dd3fc;--brand2:#a78bfa;--ok:#34d399}*{box-sizing:border-box}body{margin:0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:radial-gradient(circle at top left,rgba(125,211,252,.12),transparent 34%),radial-gradient(circle at top right,rgba(167,139,250,.13),transparent 28%),var(--bg);color:var(--text);min-height:100vh}.wrap{max-width:1120px;margin:0 auto;padding:42px 26px 64px}.nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:56px}.brand{display:flex;align-items:center;gap:14px;font-weight:800;letter-spacing:.08em}.mark{width:42px;height:42px;border-radius:14px;display:grid;place-items:center;background:linear-gradient(135deg,var(--brand),var(--brand2));color:#06111f;font-weight:900;box-shadow:0 18px 48px rgba(125,211,252,.18)}.navlinks{display:flex;gap:18px;color:var(--muted);font-size:14px}h1{font-size:clamp(38px,6vw,72px);line-height:.95;margin:0 0 22px;letter-spacing:-.055em}h2{font-size:24px;margin:0 0 14px}h3{font-size:17px;margin:0 0 8px}p{color:#cbd5e1;line-height:1.65}.hero{max-width:850px}.eyebrow{color:var(--brand);font-weight:800;letter-spacing:.14em;font-size:12px;text-transform:uppercase;margin-bottom:18px}.sub{font-size:19px;color:#cbd5e1;max-width:760px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:18px;margin:34px 0}.card,.lead{background:linear-gradient(180deg,rgba(255,255,255,.035),rgba(255,255,255,.015));border:1px solid var(--line);border-radius:24px;padding:24px;box-shadow:0 20px 80px rgba(0,0,0,.22)}.price,.chip{display:inline-flex;align-items:center;border:1px solid rgba(125,211,252,.22);color:#dbeafe;background:rgba(125,211,252,.08);padding:8px 12px;border-radius:999px;font-weight:700;font-size:14px}.status{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px}.formgrid{display:grid;grid-template-columns:1fr 1fr;gap:14px}@media(max-width:720px){.formgrid{grid-template-columns:1fr}.navlinks{display:none}}input,textarea,select{width:100%;padding:15px 16px;border-radius:14px;border:1px solid #2b3a55;background:#08111f;color:var(--text);outline:none;margin:8px 0 14px;font-size:15px}input:focus,textarea:focus,select:focus{border-color:var(--brand)}button,a.button{display:inline-block;text-decoration:none;padding:15px 20px;border:0;border-radius:14px;background:linear-gradient(135deg,var(--brand),var(--brand2));color:#06111f;font-weight:900;cursor:pointer;font-size:15px}button.secondary,a.secondary{background:#101827;color:#e5e7eb;border:1px solid #29364f}pre{white-space:pre-wrap;background:#050914;border:1px solid #1f2937;padding:16px;border-radius:16px;color:#d1d5db;overflow:auto}.section{margin-top:38px}.muted{color:var(--muted)}.lead{margin:14px 0}.leadhead{display:flex;justify-content:space-between;gap:18px;align-items:flex-start}.badge{font-size:12px;color:#07111f;background:var(--ok);border-radius:999px;padding:6px 10px;font-weight:800}`;
}

function landingPage() {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Octomind Revenue Systems</title><style>${styles()}</style></head><body><div class="wrap"><header class="nav"><div class="brand"><div class="mark">O</div><span>OCTOMIND</span></div><div class="navlinks"><span>Automation</span><span>Lead Systems</span><span>Revenue Operations</span></div></header><main class="hero"><div class="eyebrow">Revenue Automation Studio</div><h1>Automated lead capture for small business workflows.</h1><p class="sub">Octomind builds focused automation systems that capture demand, qualify opportunities and turn operational friction into structured revenue signals.</p><div class="status"><span class="chip">Live Worker</span><span class="chip">KV Lead Storage</span><span class="chip">Admin Inbox</span><span class="chip">Manual Payment Approval</span></div></main><section class="grid section"><div class="card"><h3>AI Lead Scanner</h3><p>For local businesses that need a simple way to find, qualify and organize customer opportunities.</p><span class="price">Starting at 99€</span></div><div class="card"><h3>Automation Fix Sprint</h3><p>Rapid diagnosis and repair for broken workflows, forms, automations and small business systems.</p><span class="price">Starting at 149€</span></div><div class="card"><h3>Revenue Bot Prototype</h3><p>A compact prototype that captures leads, routes requests and creates a clear sales follow-up path.</p><span class="price">Starting at 299€</span></div></section><section class="card section"><h2>Request a system review</h2><p class="muted">Submit your business problem. The request is stored securely in the Octomind lead inbox.</p><form id="leadForm"><div class="formgrid"><input name="name" placeholder="Name or business name" required><input name="contact" placeholder="Email, WhatsApp or Instagram" required></div><select name="offer"><option>AI Lead Scanner - 99€</option><option>Automation Fix Sprint - 149€</option><option>Revenue Bot Prototype - 299€</option></select><textarea name="problem" placeholder="Describe the workflow, customer problem or revenue bottleneck" rows="5" required></textarea><button>Submit request</button></form><pre id="result">Ready.</pre></section><section class="card section"><h2>System signal</h2><p class="muted">Internal scan endpoint for monitoring market data and operational signals.</p><button class="secondary" onclick="scan()">Run scan</button><pre id="scanBox">/scan ready.</pre></section></div><script>document.getElementById("leadForm").addEventListener("submit",async e=>{e.preventDefault();const payload=Object.fromEntries(new FormData(e.target).entries());const res=await fetch("/lead",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});document.getElementById("result").textContent=JSON.stringify(await res.json(),null,2)});async function scan(){const res=await fetch("/scan");document.getElementById("scanBox").textContent=JSON.stringify(await res.json(),null,2)}</script></body></html>`;
}

function adminPage(leads, token) {
  const rows = leads.map((lead) => `<div class="lead"><div class="leadhead"><div><h3>${escapeHtml(lead.name || "Unnamed lead")}</h3><p><strong>Contact:</strong> ${escapeHtml(lead.contact || "")}</p></div><span class="badge">NEW</span></div><p><strong>Offer:</strong> ${escapeHtml(lead.offer || "")}</p><p><strong>Request:</strong> ${escapeHtml(lead.problem || "")}</p><p class="muted">${escapeHtml(lead.created_at || "")}</p></div>`).join("");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Octomind Lead Inbox</title><style>${styles()}</style></head><body><div class="wrap"><header class="nav"><div class="brand"><div class="mark">O</div><span>OCTOMIND</span></div><div class="navlinks"><span>Private Admin</span><span>Lead Inbox</span></div></header><main><div class="eyebrow">Admin Console</div><h1>Lead Inbox</h1><p class="sub">Qualified requests captured from the public Octomind revenue page.</p><div class="status"><span class="chip">Total leads: ${leads.length}</span><span class="chip">Storage: KV</span><span class="chip">Access: Token protected</span></div><section class="section">${rows || "<pre>No leads yet.</pre>"}</section><section class="section"><a class="button secondary" href="/admin/cleanup-test?token=${encodeURIComponent(token || "")}">Clean test leads</a></section></main></div></body></html>`;
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    const url = new URL(request.url);
    if (url.pathname === "/") return html(landingPage());
    if (url.pathname === "/health") return json({ status: "OK", service: "octomind-revenue-systems", timestamp: new Date().toISOString(), storage: env.LEADS ? "KV_READY" : "NO_KV_BINDING", admin: env.ADMIN_TOKEN ? "ADMIN_READY" : "NO_ADMIN_TOKEN", cloud_policy: "NO_DESKTOP_NO_LOCAL_DOUBLE_CLICK" });
    if (url.pathname === "/offer") return json({ offers: [{ name: "AI Lead Scanner", price_eur: 99 }, { name: "Automation Fix Sprint", price_eur: 149 }, { name: "Revenue Bot Prototype", price_eur: 299 }] });
    if (url.pathname === "/scan") return json(await getMarketScan());
    if (url.pathname === "/lead" && request.method === "POST") {
      const data = await request.json().catch(() => null);
      if (!data || !data.contact || !data.problem) return json({ status: "REJECTED", message: "contact and problem are required" }, 400);
      const lead = { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...data };
      if (env.LEADS) await env.LEADS.put("lead:" + lead.created_at + ":" + lead.id, JSON.stringify(lead));
      return json({ status: "LEAD_CAPTURED", stored: Boolean(env.LEADS), lead });
    }
    if (url.pathname === "/admin") {
      if (!isAdmin(request, env)) return html("<h1>Unauthorized</h1>", 401);
      return html(adminPage(await listLeads(env, url.searchParams.get("includeTest") === "1"), url.searchParams.get("token")));
    }
    if (url.pathname === "/admin/leads") {
      if (!isAdmin(request, env)) return json({ status: "UNAUTHORIZED" }, 401);
      return json({ status: "OK", leads: await listLeads(env, url.searchParams.get("includeTest") === "1") });
    }
    if (url.pathname === "/admin/cleanup-test") {
      if (!isAdmin(request, env)) return json({ status: "UNAUTHORIZED" }, 401);
      return json({ status: "OK", ...(await cleanupTestLeads(env)) });
    }
    return json({ status: "NOT_FOUND", available: ["/", "/health", "/offer", "/scan", "/lead", "/admin", "/admin/leads", "/admin/cleanup-test"] }, 404);
  }
};
