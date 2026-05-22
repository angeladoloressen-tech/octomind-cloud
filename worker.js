const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-admin-token, authorization"
};

const PAYMENT_LINKS = {
  audit: {
    slug: "audit",
    name: "Octomind Quick Automation Audit",
    price: "49€",
    price_eur: 49,
    url: "https://buy.stripe.com/4gMeVdbkg0Pk84X5YR6Na0u",
    promise: "Find 3 automation gaps that are leaking money and receive a clear action map.",
    delivery: "Short diagnosis, 3 revenue opportunities, first automation step, 24h action report."
  },
  sprint: {
    slug: "sprint",
    name: "Octomind Revenue Sprint",
    price: "149€",
    price_eur: 149,
    url: "https://buy.stripe.com/eVqaEX2NK8hMad59b36Na0v",
    promise: "Turn one offer into a simple lead capture and sales follow-up flow.",
    delivery: "Offer structure, portal intake route, payment path, first-customer follow-up pack."
  },
  launch: {
    slug: "launch",
    name: "Octomind Octo Launch Pack",
    price: "199€",
    price_eur: 199,
    url: "https://buy.stripe.com/9B64gzews7dI1Gz9b36Na0x",
    promise: "A compact launch pack for creators and small businesses that need a payment-ready system.",
    delivery: "Offer clarity, lead capture flow, payment link placement, message pack, launch checklist."
  }
};

const OUTREACH = {
  short_dm: `Hey, I opened a small automation audit slot today.\n\nFor 49€, I review your business/channel workflow and find 3 places where money or leads are leaking.\n\nYou get a clear action report within 24h.\n\nPay here: ${PAYMENT_LINKS.audit.url}`,
  creator_dm: `Your content/business already has demand signals. I can check where the sales path is leaking and give you 3 direct fixes.\n\nQuick Automation Audit: 49€\n24h delivery: ${PAYMENT_LINKS.audit.url}`,
  small_business_dm: `I help small businesses turn messy workflows into simple lead and payment systems.\n\nThe 49€ Quick Automation Audit finds 3 revenue leaks and the first automation to fix.\n\nPayment: ${PAYMENT_LINKS.audit.url}`,
  email_subject: "Quick automation audit for your business",
  email_body: `Hi,\n\nI run Octomind, a small revenue automation system.\n\nFor 49€, I can review your current customer/lead workflow and identify 3 specific places where you are losing time, leads, or money.\n\nDelivery within 24h:\n- short workflow diagnosis\n- 3 revenue opportunities\n- first automation step to implement\n\nPayment link: ${PAYMENT_LINKS.audit.url}\n\nBest,\nOctomind`
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

function redirect(url) {
  return Response.redirect(url, 302);
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function isAdmin(request, env) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || request.headers.get("x-admin-token");
  return Boolean(env.ADMIN_TOKEN && token && token === env.ADMIN_TOKEN);
}

function secretKeyName(key = "") {
  return /token|secret|password|passwd|private[_-]?key|api[_-]?key|client[_-]?secret|refresh[_-]?token|authorization/i.test(String(key));
}

function secretLikeValue(value = "") {
  const text = String(value);
  return /-----BEGIN [A-Z ]*PRIVATE KEY-----/i.test(text)
    || /\b(?:sk|pk|ghp|gho|ghu|ghs|github_pat|ya29|xox[baprs])-?[A-Za-z0-9_\-]{16,}\b/.test(text)
    || /\b[A-Za-z0-9_\-]{32,}\.[A-Za-z0-9_\-]{16,}\.[A-Za-z0-9_\-]{16,}\b/.test(text)
    || /Bearer\s+[A-Za-z0-9_\-.]{20,}/i.test(text);
}

function redactText(value = "") {
  return String(value)
    .replace(/-----BEGIN [\s\S]*?PRIVATE KEY-----/gi, "[REDACTED_PRIVATE_KEY]")
    .replace(/Bearer\s+[A-Za-z0-9_\-.]{20,}/gi, "Bearer [REDACTED_SECRET]")
    .replace(/\b(?:sk|pk|ghp|gho|ghu|ghs|github_pat|ya29|xox[baprs])-?[A-Za-z0-9_\-]{16,}\b/g, "[REDACTED_SECRET]")
    .replace(/\b[A-Za-z0-9_\-]{32,}\.[A-Za-z0-9_\-]{16,}\.[A-Za-z0-9_\-]{16,}\b/g, "[REDACTED_JWT]");
}

function sanitizeObject(value, flags = [], key = "") {
  if (value == null) return value;
  if (typeof value === "string") {
    if (secretKeyName(key) || secretLikeValue(value)) {
      flags.push("SECRET_DETECTED_NOT_STORED");
      return "[REDACTED_SECRET]";
    }
    return redactText(value).slice(0, 5000);
  }
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.slice(0, 30).map((item) => sanitizeObject(item, flags, key));
  if (typeof value === "object") {
    const out = {};
    for (const [childKey, childValue] of Object.entries(value).slice(0, 80)) {
      out[childKey] = sanitizeObject(childValue, flags, childKey);
    }
    return out;
  }
  return String(value).slice(0, 1000);
}

async function readPayload(request) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 120000) return { error: "Payload too large. Max 120000 bytes." };
  const type = request.headers.get("content-type") || "";
  if (type.includes("application/json")) return { data: await request.json().catch(() => ({})) };
  if (type.includes("form")) return { data: Object.fromEntries(await request.formData()) };
  const text = await request.text();
  return { data: { type: "raw_text", text } };
}

function textBlob(data) {
  return JSON.stringify(data || {}).toLowerCase();
}

function scoreText(text, words) {
  return words.reduce((score, word) => score + (text.includes(word) ? 1 : 0), 0);
}

function classifyIntake(data) {
  const forced = String(data.type || data.kind || "").toLowerCase();
  const text = textBlob(data);
  const candidates = [
    ["lead", scoreText(text, ["lead", "customer", "client", "kunde", "kontakt", "offer", "angebot", "whatsapp", "instagram", "email", "problem"])],
    ["system_asset", scoreText(text, ["octomind", "cloudflare", "worker", "github", "repo", "workflow", "wrangler", "kv", "portal", "automation"])],
    ["incident", scoreText(text, ["error", "hata", "failed", "broken", "crash", "deploy", "stuck", "sorun"])],
    ["finance", scoreText(text, ["money", "revenue", "gelir", "payment", "stripe", "invoice", "fatura", "price", "eur", "€", "cash"])],
    ["content", scoreText(text, ["video", "youtube", "post", "script", "caption", "thumbnail", "content", "kanal"])],
    ["task", scoreText(text, ["todo", "task", "yap", "fix", "clean", "move", "migrate", "gönder", "temizle"])],
    ["idea", scoreText(text, ["idea", "fikir", "plan", "experiment", "deney", "strategy"])]
  ];
  const allowed = candidates.map(([name]) => name);
  if (allowed.includes(forced)) return forced;
  candidates.sort((a, b) => b[1] - a[1]);
  return candidates[0][1] > 0 ? candidates[0][0] : "general_input";
}

function evaluateIntake(data, riskFlags = []) {
  const text = textBlob(data);
  const classification = classifyIntake(data);
  const revenueScore = Math.min(100, scoreText(text, ["lead", "client", "customer", "offer", "payment", "stripe", "invoice", "revenue", "gelir", "cash", "money", "€", "eur", "49", "149", "199", "299"]) * 12);
  const systemScore = scoreText(text, ["octomind", "system", "sistem", "cloud", "bulut", "worker", "github", "repo", "portal", "mac", "automation", "deploy", "wrangler", "kv"]);
  const urgencyScore = scoreText(text, ["urgent", "now", "asap", "hemen", "simdi", "hata", "failed", "broken", "deploy", "payment", "müşteri", "customer"]);
  const belongsToSystem = systemScore > 0 || ["system_asset", "incident", "task"].includes(classification);
  let priority = "LOW";
  if (riskFlags.includes("SECRET_DETECTED_NOT_STORED") || urgencyScore >= 2 || revenueScore >= 36) priority = "HIGH";
  else if (belongsToSystem || revenueScore >= 12 || classification === "lead") priority = "MEDIUM";
  return {
    classification,
    belongs_to_system: belongsToSystem,
    priority,
    revenue_score: revenueScore,
    risk_flags: [...new Set(riskFlags)],
    next_action: nextAction(classification),
    mac_dependency: false,
    source_of_truth: "cloud_portal_kv"
  };
}

function nextAction(classification) {
  return ({
    lead: "Qualify contact, send the 49€ audit link, then upsell 149€ sprint.",
    system_asset: "Import into cloud source of truth and preserve no-Mac policy.",
    incident: "Open repair queue and prioritize blocker removal.",
    finance: "Route to revenue ledger and payment decision queue.",
    content: "Route to content pipeline and attach payment CTA.",
    task: "Convert to cloud task and execute through repo or portal automation.",
    idea: "Score for speed-to-cash and turn into a testable experiment.",
    general_input: "Store in cloud inbox and classify again when more signal arrives."
  })[classification] || "Store in cloud inbox.";
}

function normalizeIntake(data, request, riskFlags = []) {
  const now = new Date().toISOString();
  const clean = sanitizeObject(data, riskFlags);
  const evaluation = evaluateIntake(clean, riskFlags);
  const title = clean.title || clean.name || clean.offer || clean.subject || `${evaluation.classification} ${now}`;
  return {
    id: crypto.randomUUID(),
    created_at: now,
    portal_version: "stripe-revenue-portal-v2",
    title: String(title).slice(0, 160),
    type: clean.type || evaluation.classification,
    contact: clean.contact || clean.email || clean.whatsapp || "",
    source: clean.source || request.headers.get("referer") || "portal",
    payload: clean,
    evaluation
  };
}

async function storeIntake(env, intake) {
  if (!env.LEADS) return false;
  await env.LEADS.put(`intake:${intake.created_at}:${intake.id}`, JSON.stringify(intake));
  if (intake.evaluation.classification === "lead") {
    await env.LEADS.put(`lead:${intake.created_at}:${intake.id}`, JSON.stringify({
      id: intake.id,
      created_at: intake.created_at,
      name: intake.payload.name || intake.title,
      contact: intake.contact,
      offer: intake.payload.offer || "single portal intake",
      problem: intake.payload.problem || intake.payload.text || intake.payload.description || intake.title,
      evaluation: intake.evaluation
    }));
  }
  return true;
}

async function handleIntake(request, env, forced = {}) {
  const parsed = await readPayload(request);
  if (parsed.error) return json({ ok: false, status: "REJECTED", message: parsed.error }, 413);
  const riskFlags = [];
  const intake = normalizeIntake({ ...parsed.data, ...forced }, request, riskFlags);
  const stored = await storeIntake(env, intake);
  return json({ ok: true, status: "INTAKE_ACCEPTED", stored, intake, payment_links: PAYMENT_LINKS });
}

async function trackClick(env, request, offer) {
  if (!env.LEADS) return;
  const record = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    type: "payment_click",
    offer: offer.slug,
    price_eur: offer.price_eur,
    user_agent: request.headers.get("user-agent") || "",
    referer: request.headers.get("referer") || ""
  };
  await env.LEADS.put(`payment_click:${record.created_at}:${record.id}`, JSON.stringify(record));
}

async function listRecords(env, prefix) {
  if (!env.LEADS) return [];
  const listed = await env.LEADS.list({ prefix });
  const rows = [];
  for (const key of listed.keys) {
    const value = await env.LEADS.get(key.name, "json");
    if (value) rows.push({ key: key.name, ...value });
  }
  rows.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  return rows;
}

function metricsFor(rows) {
  const metrics = { total: rows.length, by_classification: {}, by_priority: {}, system_owned: 0, revenue_score_total: 0, high_priority: 0 };
  for (const row of rows) {
    const ev = row.evaluation || {};
    const cls = ev.classification || row.type || "unknown";
    const pri = ev.priority || "UNKNOWN";
    metrics.by_classification[cls] = (metrics.by_classification[cls] || 0) + 1;
    metrics.by_priority[pri] = (metrics.by_priority[pri] || 0) + 1;
    if (ev.belongs_to_system) metrics.system_owned += 1;
    if (pri === "HIGH") metrics.high_priority += 1;
    metrics.revenue_score_total += Number(ev.revenue_score || 0);
  }
  metrics.average_revenue_score = rows.length ? Math.round(metrics.revenue_score_total / rows.length) : 0;
  return metrics;
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
    return { timestamp: new Date().toISOString(), binance_price: priceBinance, coinbase_price: priceCoinbase, spread_usd: spread.toFixed(2), spread_percentage: spreadPercentage.toFixed(4) + "%", action: spreadPercentage > 0.5 ? "MANUAL_REVIEW_REQUIRED" : "MONITORING" };
  } catch (error) {
    return { timestamp: new Date().toISOString(), status: "ERROR", message: error.message };
  }
}

function styles() {
  return `:root{--bg:#070a12;--line:#223047;--text:#eef2ff;--muted:#9ca3af;--brand:#7dd3fc;--brand2:#a78bfa;--ok:#34d399;--warn:#fbbf24;--bad:#fb7185}*{box-sizing:border-box}body{margin:0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:radial-gradient(circle at top left,rgba(125,211,252,.12),transparent 34%),radial-gradient(circle at top right,rgba(167,139,250,.13),transparent 28%),var(--bg);color:var(--text);min-height:100vh}.wrap{max-width:1160px;margin:0 auto;padding:42px 26px 64px}.nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:48px}.brand{display:flex;align-items:center;gap:14px;font-weight:800;letter-spacing:.08em}.mark{width:42px;height:42px;border-radius:14px;display:grid;place-items:center;background:linear-gradient(135deg,var(--brand),var(--brand2));color:#06111f;font-weight:900}.navlinks{display:flex;gap:18px;color:var(--muted);font-size:14px}h1{font-size:clamp(38px,6vw,72px);line-height:.95;margin:0 0 22px;letter-spacing:-.055em}h2{font-size:24px;margin:0 0 14px}h3{font-size:17px;margin:0 0 8px}p{color:#cbd5e1;line-height:1.65}.hero{max-width:900px}.eyebrow{color:var(--brand);font-weight:800;letter-spacing:.14em;font-size:12px;text-transform:uppercase;margin-bottom:18px}.sub{font-size:19px;color:#cbd5e1;max-width:780px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:18px;margin:30px 0}.card,.lead{background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,.015));border:1px solid var(--line);border-radius:24px;padding:24px;box-shadow:0 20px 80px rgba(0,0,0,.22)}.chip,.price{display:inline-flex;align-items:center;border:1px solid rgba(125,211,252,.22);color:#dbeafe;background:rgba(125,211,252,.08);padding:8px 12px;border-radius:999px;font-weight:700;font-size:14px}.status{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px}.formgrid{display:grid;grid-template-columns:1fr 1fr;gap:14px}@media(max-width:720px){.formgrid{grid-template-columns:1fr}.navlinks{display:none}}input,textarea,select{width:100%;padding:15px 16px;border-radius:14px;border:1px solid #2b3a55;background:#08111f;color:var(--text);outline:none;margin:8px 0 14px;font-size:15px}input:focus,textarea:focus,select:focus{border-color:var(--brand)}button,a.button{display:inline-block;text-decoration:none;padding:15px 20px;border:0;border-radius:14px;background:linear-gradient(135deg,var(--brand),var(--brand2));color:#06111f;font-weight:900;cursor:pointer;font-size:15px;margin:4px 8px 4px 0}button.secondary,a.secondary{background:#101827;color:#e5e7eb;border:1px solid #29364f}.section{margin-top:38px}.muted{color:var(--muted)}pre{white-space:pre-wrap;background:#050914;border:1px solid #1f2937;padding:16px;border-radius:16px;color:#d1d5db;overflow:auto}.lead{margin:14px 0}.leadhead{display:flex;justify-content:space-between;gap:18px;align-items:flex-start}.badge{font-size:12px;color:#07111f;background:var(--ok);border-radius:999px;padding:6px 10px;font-weight:800}.high{background:var(--bad)}.medium{background:var(--warn)}`;
}

function layout(title, body) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><style>${styles()}</style></head><body><div class="wrap"><header class="nav"><div class="brand"><div class="mark">O</div><span>OCTOMIND</span></div><div class="navlinks"><span>Single Portal</span><span>Stripe</span><span>Cloud KV</span></div></header>${body}</div></body></html>`;
}

function offerCards() {
  return Object.values(PAYMENT_LINKS).map((offer) => `<div class="card"><h3>${escapeHtml(offer.name)}</h3><p>${escapeHtml(offer.promise)}</p><p>${escapeHtml(offer.delivery)}</p><span class="price">${escapeHtml(offer.price)}</span><p><a class="button" href="/buy?offer=${escapeHtml(offer.slug)}">Buy ${escapeHtml(offer.price)}</a></p></div>`).join("");
}

function portalPage() {
  return layout("Octomind Revenue Portal", `<main class="hero"><div class="eyebrow">Revenue Automation Studio</div><h1>One portal. Three payment paths. Zero Mac dependency.</h1><p class="sub">Octomind now captures inputs, evaluates revenue signal, and sends customers to Stripe payment links from the cloud.</p><div class="status"><span class="chip">/portal</span><span class="chip">/intake</span><span class="chip">Stripe Payment Links</span><span class="chip">NO_DESKTOP_NO_LOCAL_DOUBLE_CLICK</span></div></main><section class="grid section">${offerCards()}</section><section class="card section"><h2>Send anything into Octomind</h2><form id="intakeForm"><div class="formgrid"><input name="title" placeholder="Title or source name" required><input name="contact" placeholder="Email, WhatsApp, account, or internal source"></div><div class="formgrid"><select name="type"><option value="lead">Lead</option><option value="system_asset">System asset</option><option value="incident">Incident / error</option><option value="finance">Finance / payment</option><option value="content">Content / channel</option><option value="task">Task</option><option value="idea">Idea</option><option value="general_input">General input</option></select><select name="offer"><option>Quick Automation Audit - 49€</option><option>Revenue Sprint - 149€</option><option>Octo Launch Pack - 199€</option></select></div><textarea name="problem" placeholder="Paste the data, log, request, idea or system note here. Secrets will be redacted." rows="7" required></textarea><button>Ingest and evaluate</button></form><pre id="result">Ready for cloud intake.</pre></section><section class="card section"><h2>Sales Kit</h2><p class="muted">Ready-to-send messages and offer links.</p><a class="button secondary" href="/sales-kit">Open sales kit</a> <button class="secondary" onclick="health()">Health</button><pre id="signalBox">/health ready.</pre></section><script>document.getElementById("intakeForm").addEventListener("submit",async e=>{e.preventDefault();const payload=Object.fromEntries(new FormData(e.target).entries());const res=await fetch("/intake",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});document.getElementById("result").textContent=JSON.stringify(await res.json(),null,2)});async function health(){const res=await fetch("/health");document.getElementById("signalBox").textContent=JSON.stringify(await res.json(),null,2)}</script>`);
}

function salesKitPage() {
  return layout("Octomind Sales Kit", `<main class="hero"><div class="eyebrow">Sales Kit</div><h1>Copy, send, sell.</h1><p class="sub">The first revenue move is the 49€ audit. Use the higher offers as upsells after the first conversation.</p></main><section class="grid section">${offerCards()}</section><section class="card section"><h2>DM templates</h2><pre>${escapeHtml(JSON.stringify(OUTREACH, null, 2))}</pre></section>`);
}

function adminPage(intakeRows, clickRows, metrics, token) {
  const rows = intakeRows.map((row) => {
    const ev = row.evaluation || {};
    const priority = String(ev.priority || "LOW").toLowerCase();
    return `<div class="lead"><div class="leadhead"><div><h3>${escapeHtml(row.title || "Untitled intake")}</h3><p><strong>Class:</strong> ${escapeHtml(ev.classification || "unknown")} | <strong>Revenue score:</strong> ${escapeHtml(ev.revenue_score ?? 0)}</p></div><span class="badge ${priority}">${escapeHtml(ev.priority || "LOW")}</span></div><p><strong>Next:</strong> ${escapeHtml(ev.next_action || "")}</p><p><strong>Contact:</strong> ${escapeHtml(row.contact || "")}</p><pre>${escapeHtml(JSON.stringify(row.payload || {}, null, 2).slice(0, 1200))}</pre><p class="muted">${escapeHtml(row.created_at || "")}</p></div>`;
  }).join("");
  const clickList = clickRows.slice(0, 20).map((c) => `<p>${escapeHtml(c.created_at)} | ${escapeHtml(c.offer)} | ${escapeHtml(c.price_eur)}€</p>`).join("") || "<p>No payment clicks yet.</p>";
  return layout("Octomind Admin", `<main><div class="eyebrow">Admin Console</div><h1>Cloud Revenue Inbox</h1><p class="sub">Everything enters through one portal and Stripe clicks are tracked before payment handoff.</p><div class="grid"><div class="card"><h3>Total intake</h3><p class="price">${metrics.total}</p></div><div class="card"><h3>High priority</h3><p class="price">${metrics.high_priority}</p></div><div class="card"><h3>Payment clicks</h3><p class="price">${clickRows.length}</p></div><div class="card"><h3>Avg revenue score</h3><p class="price">${metrics.average_revenue_score}</p></div></div><section class="section"><pre>${escapeHtml(JSON.stringify(metrics, null, 2))}</pre></section><section class="card section"><h2>Payment links</h2><pre>${escapeHtml(JSON.stringify(PAYMENT_LINKS, null, 2))}</pre></section><section class="card section"><h2>Payment clicks</h2>${clickList}</section><section class="section">${rows || "<pre>No intake yet.</pre>"}</section><section class="section"><a class="button secondary" href="/admin/cleanup-test?token=${encodeURIComponent(token || "")}">Clean test data</a></section></main>`);
}

async function cleanupTestData(env) {
  if (!env.LEADS) return { deleted: 0 };
  let deleted = 0;
  for (const prefix of ["lead:", "intake:"]) {
    const listed = await env.LEADS.list({ prefix });
    for (const key of listed.keys) {
      const value = await env.LEADS.get(key.name, "json");
      const hay = JSON.stringify(value || {}).toLowerCase();
      if (hay.includes("test@example.com") || hay.includes('"source":"test"')) {
        await env.LEADS.delete(key.name);
        deleted += 1;
      }
    }
  }
  return { deleted };
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    const url = new URL(request.url);

    if (url.pathname === "/" || url.pathname === "/portal") return html(portalPage());
    if (url.pathname === "/sales-kit") return html(salesKitPage());
    if (url.pathname === "/offer") return json({ offers: PAYMENT_LINKS });
    if (url.pathname === "/scan") return json(await getMarketScan());
    if (url.pathname === "/youtube/status") return json({ service: "cerbera-youtube-upload-bridge", status: "PARKED", reason: "Revenue portal is active first. OAuth can be restored after first cash signal." });
    if (url.pathname === "/health") return json({
      status: "OK",
      service: "octomind-stripe-revenue-portal",
      timestamp: new Date().toISOString(),
      storage: env.LEADS ? "KV_READY" : "NO_KV_BINDING",
      admin: env.ADMIN_TOKEN ? "ADMIN_READY" : "NO_ADMIN_TOKEN",
      payment_links: "READY",
      offers: PAYMENT_LINKS,
      local_mac_dependency: false,
      cloud_policy: "NO_DESKTOP_NO_LOCAL_DOUBLE_CLICK"
    });

    if (url.pathname === "/buy") {
      const offer = PAYMENT_LINKS[url.searchParams.get("offer") || "audit"] || PAYMENT_LINKS.audit;
      await trackClick(env, request, offer);
      return redirect(offer.url);
    }

    if (url.pathname === "/intake" && request.method === "POST") return handleIntake(request, env);
    if (url.pathname === "/lead" && request.method === "POST") return handleIntake(request, env, { type: "lead", source: "legacy_lead_endpoint" });

    if (url.pathname === "/admin") {
      if (!isAdmin(request, env)) return html("<h1>Unauthorized</h1>", 401);
      const intakeRows = await listRecords(env, "intake:");
      const clickRows = await listRecords(env, "payment_click:");
      return html(adminPage(intakeRows, clickRows, metricsFor(intakeRows), url.searchParams.get("token")));
    }
    if (url.pathname === "/admin/intake") {
      if (!isAdmin(request, env)) return json({ status: "UNAUTHORIZED" }, 401);
      const intake = await listRecords(env, "intake:");
      return json({ status: "OK", metrics: metricsFor(intake), intake });
    }
    if (url.pathname === "/admin/metrics") {
      if (!isAdmin(request, env)) return json({ status: "UNAUTHORIZED" }, 401);
      const intake = await listRecords(env, "intake:");
      const payment_clicks = await listRecords(env, "payment_click:");
      return json({ status: "OK", metrics: metricsFor(intake), payment_clicks: payment_clicks.length });
    }
    if (url.pathname === "/admin/leads") {
      if (!isAdmin(request, env)) return json({ status: "UNAUTHORIZED" }, 401);
      return json({ status: "OK", leads: await listRecords(env, "lead:") });
    }
    if (url.pathname === "/admin/payment-clicks") {
      if (!isAdmin(request, env)) return json({ status: "UNAUTHORIZED" }, 401);
      return json({ status: "OK", clicks: await listRecords(env, "payment_click:") });
    }
    if (url.pathname === "/admin/cleanup-test") {
      if (!isAdmin(request, env)) return json({ status: "UNAUTHORIZED" }, 401);
      return json({ status: "OK", ...(await cleanupTestData(env)) });
    }
    if (url.pathname === "/api/routes") return json({ routes: ["/portal", "/sales-kit", "/buy?offer=audit", "/buy?offer=sprint", "/buy?offer=launch", "/health", "/intake POST", "/admin", "/admin/intake", "/admin/metrics", "/admin/payment-clicks", "/offer", "/scan"] });

    return json({ status: "NOT_FOUND", available: ["/portal", "/sales-kit", "/buy?offer=audit", "/health", "/intake", "/admin", "/api/routes"] }, 404);
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil((async () => {
      const scan = await getMarketScan();
      if (env.LEADS) await env.LEADS.put(`scan:${new Date().toISOString()}`, JSON.stringify(scan));
    })());
  }
};
