const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-admin-token, authorization"
};

const YOUTUBE_UPLOAD_SCOPE = "https://www.googleapis.com/auth/youtube.upload";
const YOUTUBE_REFRESH_KEY = "secret:youtube_refresh_token";
const YOUTUBE_STATE_PREFIX = "oauth:youtube:state:";
const MAX_INTAKE_BYTES = 120000;

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

function requiredEnv(env, keys) {
  return keys.filter((key) => !env[key]);
}

function hasEnv(env, key) {
  return Boolean(env[key]);
}

function bytesToBase64(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function deriveSecretKey(env) {
  if (!env.ADMIN_TOKEN) throw new Error("ADMIN_TOKEN is required for encrypted token storage");
  const enc = new TextEncoder();
  const material = await crypto.subtle.importKey("raw", enc.encode(env.ADMIN_TOKEN), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: enc.encode("octomind-youtube-bridge-v1"), iterations: 100000, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encryptSecret(value, env) {
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveSecretKey(env);
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(value));
  return JSON.stringify({ alg: "AES-GCM", iv: bytesToBase64(iv), data: bytesToBase64(new Uint8Array(cipher)) });
}

async function decryptSecret(box, env) {
  const parsed = JSON.parse(box);
  const key = await deriveSecretKey(env);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: base64ToBytes(parsed.iv) }, key, base64ToBytes(parsed.data));
  return new TextDecoder().decode(plain);
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
  if (contentLength > MAX_INTAKE_BYTES) {
    return { error: `Payload too large. Max ${MAX_INTAKE_BYTES} bytes.` };
  }
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
    ["system_asset", scoreText(text, ["octomind", "cloudflare", "worker", "github", "repo", "workflow", "wrangler", "kv", "portal", "youtube", "cerbera", "automation"])],
    ["incident", scoreText(text, ["error", "hata", "failed", "broken", "crash", "lint", "deploy", "stuck", "takildim", "sorun"])],
    ["finance", scoreText(text, ["money", "revenue", "gelir", "payment", "stripe", "invoice", "fatura", "price", "eur", "€", "cash"])],
    ["content", scoreText(text, ["video", "youtube", "post", "script", "caption", "thumbnail", "content", "kanal"] )],
    ["task", scoreText(text, ["todo", "task", "yap", "fix", "clean", "move", "migrate", "gönder", "temizle"] )],
    ["idea", scoreText(text, ["idea", "fikir", "plan", "experiment", "deney", "strategy"] )]
  ];
  const allowed = candidates.map(([name]) => name);
  if (allowed.includes(forced)) return forced;
  candidates.sort((a, b) => b[1] - a[1]);
  return candidates[0][1] > 0 ? candidates[0][0] : "general_input";
}

function evaluateIntake(data, riskFlags = []) {
  const text = textBlob(data);
  const classification = classifyIntake(data);
  const systemScore = scoreText(text, ["octomind", "system", "sistem", "cloud", "bulut", "worker", "github", "repo", "portal", "mac", "youtube", "cerbera", "automation", "deploy", "wrangler", "kv"]);
  const revenueScore = Math.min(100, (
    scoreText(text, ["lead", "client", "customer", "kunde", "offer", "angebot", "payment", "stripe", "invoice", "revenue", "gelir", "cash", "money", "€", "eur", "99", "149", "199", "299"]) * 12
  ));
  const urgencyScore = scoreText(text, ["urgent", "now", "asap", "hemen", "simdi", "hata", "failed", "broken", "deploy", "token", "secret", "payment", "müşteri", "customer"]);
  const belongsToSystem = systemScore > 0 || ["system_asset", "incident", "task"].includes(classification);
  let priority = "LOW";
  if (riskFlags.includes("SECRET_DETECTED_NOT_STORED") || urgencyScore >= 2 || revenueScore >= 36) priority = "HIGH";
  else if (belongsToSystem || revenueScore >= 12 || classification === "lead") priority = "MEDIUM";
  const nextActionMap = {
    lead: "Qualify contact, match offer, create revenue follow-up.",
    system_asset: "Import into cloud source of truth, verify binding, preserve no-Mac policy.",
    incident: "Open repair queue, inspect deploy/runtime status, prioritize blocker removal.",
    finance: "Route to revenue ledger and payment decision queue.",
    content: "Route to content pipeline, check channel/account readiness.",
    task: "Convert to cloud task and execute through repo or portal automation.",
    idea: "Score for speed-to-cash and turn into a testable experiment.",
    general_input: "Store in cloud inbox, classify again when more signal arrives."
  };
  return {
    classification,
    belongs_to_system: belongsToSystem,
    priority,
    revenue_score: revenueScore,
    risk_flags: [...new Set(riskFlags)],
    next_action: nextActionMap[classification] || nextActionMap.general_input,
    mac_dependency: false,
    source_of_truth: "cloud_portal_kv"
  };
}

function normalizeIntake(data, request, riskFlags = []) {
  const now = new Date().toISOString();
  const clean = sanitizeObject(data, riskFlags);
  const evaluation = evaluateIntake(clean, riskFlags);
  const title = clean.title || clean.name || clean.offer || clean.subject || `${evaluation.classification} ${now}`;
  return {
    id: crypto.randomUUID(),
    created_at: now,
    portal_version: "single-cloud-intake-v1",
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
  return json({ ok: true, status: "INTAKE_ACCEPTED", stored, intake });
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

async function listIntake(env, includeTest = false) {
  const rows = await listRecords(env, "intake:");
  if (includeTest) return rows;
  return rows.filter((row) => String(row.contact || row.payload?.contact || "").toLowerCase() !== "test@example.com" && row.payload?.source !== "test");
}

async function listLeads(env, includeTest = false) {
  const rows = await listRecords(env, "lead:");
  if (includeTest) return rows;
  return rows.filter((row) => String(row.contact || "").toLowerCase() !== "test@example.com");
}

function metricsFor(rows) {
  const metrics = { total: rows.length, by_classification: {}, by_priority: {}, system_owned: 0, revenue_score_total: 0, high_priority: 0 };
  for (const row of rows) {
    const ev = row.evaluation || {};
    const cls = ev.classification || "unknown";
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

async function getStoredYoutubeRefreshToken(env) {
  if (env.YOUTUBE_REFRESH_TOKEN) return env.YOUTUBE_REFRESH_TOKEN;
  if (!env.LEADS) return null;
  const encrypted = await env.LEADS.get(YOUTUBE_REFRESH_KEY);
  if (!encrypted) return null;
  return decryptSecret(encrypted, env);
}

async function youtubeStatus(env) {
  const encryptedToken = env.LEADS ? Boolean(await env.LEADS.get(YOUTUBE_REFRESH_KEY)) : false;
  return {
    service: "cerbera-youtube-upload-bridge",
    target_channel: "CERBERA",
    target_handle: "@cerberaexe",
    create_channel: false,
    mode: "youtube_upload_operator",
    oauth: {
      client_id: hasEnv(env, "YOUTUBE_CLIENT_ID"),
      client_secret: hasEnv(env, "YOUTUBE_CLIENT_SECRET"),
      redirect_uri: hasEnv(env, "YOUTUBE_REDIRECT_URI"),
      refresh_token_secret: hasEnv(env, "YOUTUBE_REFRESH_TOKEN"),
      encrypted_refresh_token_in_kv: encryptedToken,
      state_store: hasEnv(env, "LEADS"),
      admin_token: hasEnv(env, "ADMIN_TOKEN")
    },
    ready_for_oauth_start: requiredEnv(env, ["YOUTUBE_CLIENT_ID", "YOUTUBE_CLIENT_SECRET", "YOUTUBE_REDIRECT_URI", "ADMIN_TOKEN"]).length === 0 && Boolean(env.LEADS),
    ready_for_upload: requiredEnv(env, ["YOUTUBE_CLIENT_ID", "YOUTUBE_CLIENT_SECRET", "ADMIN_TOKEN"]).length === 0 && (hasEnv(env, "YOUTUBE_REFRESH_TOKEN") || encryptedToken)
  };
}

async function createYoutubeAuthUrl(request, env) {
  if (!isAdmin(request, env)) return html("<h1>Unauthorized</h1>", 401);
  const missing = requiredEnv(env, ["YOUTUBE_CLIENT_ID", "YOUTUBE_CLIENT_SECRET", "YOUTUBE_REDIRECT_URI", "ADMIN_TOKEN"]);
  if (!env.LEADS) missing.push("LEADS_KV_BINDING");
  if (missing.length) return json({ ok: false, missing, next: "Add the missing values as Cloudflare Worker secrets/bindings." }, 400);
  const state = crypto.randomUUID();
  await env.LEADS.put(YOUTUBE_STATE_PREFIX + state, JSON.stringify({ created_at: new Date().toISOString() }), { expirationTtl: 600 });
  const params = new URLSearchParams({ client_id: env.YOUTUBE_CLIENT_ID, redirect_uri: env.YOUTUBE_REDIRECT_URI, response_type: "code", scope: YOUTUBE_UPLOAD_SCOPE, access_type: "offline", prompt: "consent", include_granted_scopes: "true", state });
  const authUrl = "https://accounts.google.com/o/oauth2/v2/auth?" + params.toString();
  return html(`<!doctype html><html><head><meta charset="utf-8"><title>CERBERA YouTube OAuth</title><style>${styles()}</style></head><body><div class="wrap"><section class="card"><div class="eyebrow">CERBERA YouTube Bridge</div><h1>Connect YouTube upload permission</h1><p>One-time consent for upload permission. Choose the CERBERA channel in Google.</p><p><a class="button" href="${escapeHtml(authUrl)}">Open Google consent</a></p><pre>${escapeHtml(JSON.stringify({ scope: YOUTUBE_UPLOAD_SCOPE, target_handle: "@cerberaexe", expires_in_minutes: 10 }, null, 2))}</pre></section></div></body></html>`);
}

async function exchangeYoutubeCode(code, env) {
  const body = new URLSearchParams({ code, client_id: env.YOUTUBE_CLIENT_ID, client_secret: env.YOUTUBE_CLIENT_SECRET, redirect_uri: env.YOUTUBE_REDIRECT_URI, grant_type: "authorization_code" });
  const res = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error_description || data.error || "OAuth token exchange failed");
  return data;
}

async function handleYoutubeCallback(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) return html("<h1>Missing code or state</h1>", 400);
  if (!env.LEADS) return html("<h1>Missing LEADS KV binding</h1>", 500);
  const stateKey = YOUTUBE_STATE_PREFIX + state;
  const stateRecord = await env.LEADS.get(stateKey);
  if (!stateRecord) return html("<h1>OAuth state expired or invalid</h1>", 400);
  await env.LEADS.delete(stateKey);
  try {
    const tokenData = await exchangeYoutubeCode(code, env);
    if (tokenData.refresh_token) await env.LEADS.put(YOUTUBE_REFRESH_KEY, await encryptSecret(tokenData.refresh_token, env));
    return html(`<!doctype html><html><head><meta charset="utf-8"><title>CERBERA YouTube Connected</title><style>${styles()}</style></head><body><div class="wrap"><section class="card"><div class="eyebrow">CERBERA YouTube Bridge</div><h1>Connection result</h1><pre>${escapeHtml(JSON.stringify({ ok: true, refresh_token_stored_encrypted: Boolean(tokenData.refresh_token), access_token_received: Boolean(tokenData.access_token), token_type: tokenData.token_type || null, expires_in: tokenData.expires_in || null, next: "/youtube/status then /youtube/upload-test" }, null, 2))}</pre></section></div></body></html>`);
  } catch (error) {
    return html(`<h1>OAuth failed</h1><pre>${escapeHtml(error.message)}</pre>`, 500);
  }
}

async function getYoutubeAccessToken(env) {
  const refreshToken = await getStoredYoutubeRefreshToken(env);
  if (!refreshToken) throw new Error("No YouTube refresh token. Open /auth/youtube/start first.");
  const body = new URLSearchParams({ client_id: env.YOUTUBE_CLIENT_ID, client_secret: env.YOUTUBE_CLIENT_SECRET, refresh_token: refreshToken, grant_type: "refresh_token" });
  const res = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) throw new Error(data.error_description || data.error || "Could not refresh YouTube access token");
  return data.access_token;
}

function concatBytes(parts) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) { out.set(part, offset); offset += part.length; }
  return out;
}

async function bytesFromUploadPayload(payload) {
  if (payload.videoBase64) return { bytes: base64ToBytes(payload.videoBase64), contentType: payload.contentType || "video/mp4", source: "videoBase64" };
  if (payload.videoUrl) {
    const videoRes = await fetch(payload.videoUrl);
    if (!videoRes.ok) throw new Error(`Could not fetch videoUrl: ${videoRes.status}`);
    return { bytes: new Uint8Array(await videoRes.arrayBuffer()), contentType: videoRes.headers.get("content-type") || payload.contentType || "video/mp4", source: "videoUrl" };
  }
  throw new Error("Missing videoUrl or videoBase64. Provide a small test video source.");
}

async function uploadYoutubeVideo(request, env) {
  if (!isAdmin(request, env)) return json({ ok: false, status: "UNAUTHORIZED" }, 401);
  const missing = requiredEnv(env, ["YOUTUBE_CLIENT_ID", "YOUTUBE_CLIENT_SECRET", "ADMIN_TOKEN"]);
  if (missing.length) return json({ ok: false, missing }, 400);
  const payload = await request.json().catch(() => ({}));
  try {
    const accessToken = await getYoutubeAccessToken(env);
    const { bytes, contentType, source } = await bytesFromUploadPayload(payload);
    const boundary = "cerbera_upload_" + crypto.randomUUID().replaceAll("-", "");
    const metadata = { snippet: { title: payload.title || `CERBERA Autopilot Test ${new Date().toISOString()}`, description: payload.description || "Private CERBERA YouTube Upload Bridge test.", tags: payload.tags || ["CERBERA", "autopilot", "test"], categoryId: payload.categoryId || "22" }, status: { privacyStatus: payload.privacyStatus || "private", selfDeclaredMadeForKids: false, containsSyntheticMedia: payload.containsSyntheticMedia ?? true } };
    const enc = new TextEncoder();
    const multipart = concatBytes([enc.encode(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`), enc.encode(`--${boundary}\r\nContent-Type: ${contentType}\r\n\r\n`), bytes, enc.encode(`\r\n--${boundary}--`)]);
    const uploadRes = await fetch("https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status&uploadType=multipart", { method: "POST", headers: { authorization: `Bearer ${accessToken}`, "content-type": `multipart/related; boundary=${boundary}` }, body: multipart });
    const text = await uploadRes.text();
    const data = JSON.parse(text || "{}");
    if (!uploadRes.ok) return json({ ok: false, status: uploadRes.status, error: data }, uploadRes.status);
    return json({ ok: true, channel: "CERBERA", handle: "@cerberaexe", privacyStatus: metadata.status.privacyStatus, source, videoId: data.id, youtube_response: data });
  } catch (error) {
    return json({ ok: false, error: error.message, next: "Complete OAuth first, then POST a small test videoUrl or videoBase64." }, 400);
  }
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
  return `:root{--bg:#070a12;--panel:#0d1321;--line:#223047;--text:#eef2ff;--muted:#9ca3af;--brand:#7dd3fc;--brand2:#a78bfa;--ok:#34d399;--warn:#fbbf24;--bad:#fb7185}*{box-sizing:border-box}body{margin:0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:radial-gradient(circle at top left,rgba(125,211,252,.12),transparent 34%),radial-gradient(circle at top right,rgba(167,139,250,.13),transparent 28%),var(--bg);color:var(--text);min-height:100vh}.wrap{max-width:1160px;margin:0 auto;padding:42px 26px 64px}.nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:48px}.brand{display:flex;align-items:center;gap:14px;font-weight:800;letter-spacing:.08em}.mark{width:42px;height:42px;border-radius:14px;display:grid;place-items:center;background:linear-gradient(135deg,var(--brand),var(--brand2));color:#06111f;font-weight:900;box-shadow:0 18px 48px rgba(125,211,252,.18)}.navlinks{display:flex;gap:18px;color:var(--muted);font-size:14px}h1{font-size:clamp(38px,6vw,72px);line-height:.95;margin:0 0 22px;letter-spacing:-.055em}h2{font-size:24px;margin:0 0 14px}h3{font-size:17px;margin:0 0 8px}p{color:#cbd5e1;line-height:1.65}.hero{max-width:880px}.eyebrow{color:var(--brand);font-weight:800;letter-spacing:.14em;font-size:12px;text-transform:uppercase;margin-bottom:18px}.sub{font-size:19px;color:#cbd5e1;max-width:780px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:18px;margin:30px 0}.card,.lead{background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,.015));border:1px solid var(--line);border-radius:24px;padding:24px;box-shadow:0 20px 80px rgba(0,0,0,.22)}.chip,.price{display:inline-flex;align-items:center;border:1px solid rgba(125,211,252,.22);color:#dbeafe;background:rgba(125,211,252,.08);padding:8px 12px;border-radius:999px;font-weight:700;font-size:14px}.status{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px}.formgrid{display:grid;grid-template-columns:1fr 1fr;gap:14px}@media(max-width:720px){.formgrid{grid-template-columns:1fr}.navlinks{display:none}}input,textarea,select{width:100%;padding:15px 16px;border-radius:14px;border:1px solid #2b3a55;background:#08111f;color:var(--text);outline:none;margin:8px 0 14px;font-size:15px}input:focus,textarea:focus,select:focus{border-color:var(--brand)}button,a.button{display:inline-block;text-decoration:none;padding:15px 20px;border:0;border-radius:14px;background:linear-gradient(135deg,var(--brand),var(--brand2));color:#06111f;font-weight:900;cursor:pointer;font-size:15px}button.secondary,a.secondary{background:#101827;color:#e5e7eb;border:1px solid #29364f}pre{white-space:pre-wrap;background:#050914;border:1px solid #1f2937;padding:16px;border-radius:16px;color:#d1d5db;overflow:auto}.section{margin-top:38px}.muted{color:var(--muted)}.lead{margin:14px 0}.leadhead{display:flex;justify-content:space-between;gap:18px;align-items:flex-start}.badge{font-size:12px;color:#07111f;background:var(--ok);border-radius:999px;padding:6px 10px;font-weight:800}.high{background:var(--bad)}.medium{background:var(--warn)}`;
}

function portalPage() {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Octomind Single Portal</title><style>${styles()}</style></head><body><div class="wrap"><header class="nav"><div class="brand"><div class="mark">O</div><span>OCTOMIND</span></div><div class="navlinks"><span>Single Portal</span><span>Cloud KV</span><span>No Mac Source</span></div></header><main class="hero"><div class="eyebrow">Cloud source of truth</div><h1>One portal for every system input.</h1><p class="sub">All leads, tasks, logs, ideas, channel inputs and system assets enter here. Octomind classifies, redacts risky secrets, scores revenue signal and decides the next action in the cloud.</p><div class="status"><span class="chip">/portal</span><span class="chip">/intake</span><span class="chip">/admin/intake</span><span class="chip">NO_DESKTOP_NO_LOCAL_DOUBLE_CLICK</span></div></main><section class="grid section"><div class="card"><h3>System intake</h3><p>Worker, repo, deploy, YouTube, Cloudflare, automation and Mac cleanup signals are imported as cloud records.</p></div><div class="card"><h3>Revenue intake</h3><p>Leads, customer problems, offer requests and payment signals are scored for speed-to-cash priority.</p></div><div class="card"><h3>Secret guard</h3><p>Token-like data is redacted before storage. Secrets belong in secret managers, not inside portal records.</p></div></section><section class="card section"><h2>Send anything into Octomind</h2><form id="intakeForm"><div class="formgrid"><input name="title" placeholder="Title or source name" required><input name="contact" placeholder="Email, WhatsApp, account, or internal source"></div><div class="formgrid"><select name="type"><option value="lead">Lead</option><option value="system_asset">System asset</option><option value="incident">Incident / error</option><option value="finance">Finance / payment</option><option value="content">Content / channel</option><option value="task">Task</option><option value="idea">Idea</option><option value="general_input">General input</option></select><input name="source" placeholder="portal, github, youtube, cloudflare, chat"></div><textarea name="problem" placeholder="Paste the data, log, request, idea or system note here. Secrets will be redacted." rows="7" required></textarea><button>Ingest and evaluate</button></form><pre id="result">Ready for cloud intake.</pre></section><section class="card section"><h2>System signals</h2><button class="secondary" onclick="health()">Health</button> <button class="secondary" onclick="scan()">Market scan</button> <button class="secondary" onclick="yt()">YouTube status</button><pre id="signalBox">/health ready.</pre></section></div><script>document.getElementById("intakeForm").addEventListener("submit",async e=>{e.preventDefault();const payload=Object.fromEntries(new FormData(e.target).entries());const res=await fetch("/intake",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});document.getElementById("result").textContent=JSON.stringify(await res.json(),null,2)});async function health(){const res=await fetch("/health");document.getElementById("signalBox").textContent=JSON.stringify(await res.json(),null,2)}async function scan(){const res=await fetch("/scan");document.getElementById("signalBox").textContent=JSON.stringify(await res.json(),null,2)}async function yt(){const res=await fetch("/youtube/status");document.getElementById("signalBox").textContent=JSON.stringify(await res.json(),null,2)}</script></body></html>`;
}

function adminPage(intakeRows, metrics, token) {
  const rows = intakeRows.map((row) => {
    const ev = row.evaluation || {};
    const priority = String(ev.priority || "LOW").toLowerCase();
    return `<div class="lead"><div class="leadhead"><div><h3>${escapeHtml(row.title || "Untitled intake")}</h3><p><strong>Class:</strong> ${escapeHtml(ev.classification || "unknown")} | <strong>System:</strong> ${ev.belongs_to_system ? "yes" : "no"} | <strong>Revenue score:</strong> ${escapeHtml(ev.revenue_score ?? 0)}</p></div><span class="badge ${priority}">${escapeHtml(ev.priority || "LOW")}</span></div><p><strong>Next:</strong> ${escapeHtml(ev.next_action || "")}</p><p><strong>Contact:</strong> ${escapeHtml(row.contact || "")}</p><pre>${escapeHtml(JSON.stringify(row.payload || {}, null, 2).slice(0, 1200))}</pre><p class="muted">${escapeHtml(row.created_at || "")}</p></div>`;
  }).join("");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Octomind Admin</title><style>${styles()}</style></head><body><div class="wrap"><header class="nav"><div class="brand"><div class="mark">O</div><span>OCTOMIND</span></div><div class="navlinks"><span>Private Admin</span><span>Cloud Intake</span></div></header><main><div class="eyebrow">Admin Console</div><h1>Cloud Intake Inbox</h1><p class="sub">Everything enters through one portal and is evaluated before action.</p><div class="grid"><div class="card"><h3>Total</h3><p class="price">${metrics.total}</p></div><div class="card"><h3>System owned</h3><p class="price">${metrics.system_owned}</p></div><div class="card"><h3>High priority</h3><p class="price">${metrics.high_priority}</p></div><div class="card"><h3>Avg revenue score</h3><p class="price">${metrics.average_revenue_score}</p></div></div><section class="section"><pre>${escapeHtml(JSON.stringify(metrics, null, 2))}</pre></section><section class="section">${rows || "<pre>No intake yet.</pre>"}</section><section class="section"><a class="button secondary" href="/admin/cleanup-test?token=${encodeURIComponent(token || "")}">Clean test data</a></section></main></div></body></html>`;
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    const url = new URL(request.url);

    if (url.pathname === "/" || url.pathname === "/portal") return html(portalPage());
    if (url.pathname === "/health") return json({
      status: "OK",
      service: "octomind-single-cloud-portal",
      timestamp: new Date().toISOString(),
      storage: env.LEADS ? "KV_READY" : "NO_KV_BINDING",
      admin: env.ADMIN_TOKEN ? "ADMIN_READY" : "NO_ADMIN_TOKEN",
      single_portal: "/portal",
      intake_endpoint: "/intake",
      admin_inbox: "/admin/intake",
      metrics: "/admin/metrics",
      local_mac_dependency: false,
      cloud_policy: "NO_DESKTOP_NO_LOCAL_DOUBLE_CLICK",
      youtube: await youtubeStatus(env)
    });

    if (url.pathname === "/intake" && request.method === "POST") return handleIntake(request, env);
    if (url.pathname === "/lead" && request.method === "POST") return handleIntake(request, env, { type: "lead", source: "legacy_lead_endpoint" });
    if (url.pathname === "/offer") return json({ offers: [{ name: "AI Lead Scanner", price_eur: 99 }, { name: "Automation Fix Sprint", price_eur: 149 }, { name: "Octo Launch Pack", price_eur: 199 }, { name: "Revenue Bot Prototype", price_eur: 299 }] });
    if (url.pathname === "/scan") return json(await getMarketScan());

    if (url.pathname === "/youtube/status") return json(await youtubeStatus(env));
    if (url.pathname === "/auth/youtube/start") return createYoutubeAuthUrl(request, env);
    if (url.pathname === "/auth/youtube/callback") return handleYoutubeCallback(request, env);
    if (url.pathname === "/youtube/upload-test" && request.method === "POST") return uploadYoutubeVideo(request, env);

    if (url.pathname === "/admin") {
      if (!isAdmin(request, env)) return html("<h1>Unauthorized</h1>", 401);
      const intakeRows = await listIntake(env, url.searchParams.get("includeTest") === "1");
      return html(adminPage(intakeRows, metricsFor(intakeRows), url.searchParams.get("token")));
    }
    if (url.pathname === "/admin/intake") {
      if (!isAdmin(request, env)) return json({ status: "UNAUTHORIZED" }, 401);
      const intake = await listIntake(env, url.searchParams.get("includeTest") === "1");
      return json({ status: "OK", metrics: metricsFor(intake), intake });
    }
    if (url.pathname === "/admin/metrics") {
      if (!isAdmin(request, env)) return json({ status: "UNAUTHORIZED" }, 401);
      return json({ status: "OK", metrics: metricsFor(await listIntake(env, url.searchParams.get("includeTest") === "1")) });
    }
    if (url.pathname === "/admin/leads") {
      if (!isAdmin(request, env)) return json({ status: "UNAUTHORIZED" }, 401);
      return json({ status: "OK", leads: await listLeads(env, url.searchParams.get("includeTest") === "1") });
    }
    if (url.pathname === "/admin/cleanup-test") {
      if (!isAdmin(request, env)) return json({ status: "UNAUTHORIZED" }, 401);
      return json({ status: "OK", ...(await cleanupTestData(env)) });
    }
    if (url.pathname === "/api/routes") return json({ routes: ["/portal", "/health", "/intake POST", "/admin", "/admin/intake", "/admin/metrics", "/offer", "/scan", "/youtube/status", "/auth/youtube/start", "/auth/youtube/callback", "/youtube/upload-test POST"] });

    return json({ status: "NOT_FOUND", available: ["/portal", "/health", "/intake", "/admin", "/admin/intake", "/admin/metrics", "/api/routes"] }, 404);
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil((async () => {
      const scan = await getMarketScan();
      if (env.LEADS) await env.LEADS.put(`scan:${new Date().toISOString()}`, JSON.stringify(scan));
    })());
  }
};
