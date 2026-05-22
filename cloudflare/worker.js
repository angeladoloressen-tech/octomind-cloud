const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-admin-token, authorization"
};

const YOUTUBE_UPLOAD_SCOPE = "https://www.googleapis.com/auth/youtube.upload";
const YOUTUBE_REFRESH_KEY = "secret:youtube_refresh_token";
const YOUTUBE_STATE_PREFIX = "oauth:youtube:state:";

const SAFETY = {
  wallet: false,
  trading: false,
  money_ops: false,
  email_send: false,
  official_submission: false,
  destructive_actions: false,
  human_approval_required: true
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "content-type": "application/json;charset=utf-8", ...cors }
  });
}

function html(body, status = 200) {
  return new Response(body, {
    status,
    headers: { "content-type": "text/html;charset=utf-8", ...cors }
  });
}

function has(env, key) {
  return Boolean(env[key] && String(env[key]).trim());
}

function isAdmin(req, env) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") || req.headers.get("x-admin-token");
  return Boolean(env.ADMIN_TOKEN && token && token === env.ADMIN_TOKEN);
}

function esc(x = "") {
  return String(x).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[c]));
}

function bytesToBase64(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
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
      client_id: has(env, "YOUTUBE_CLIENT_ID"),
      client_secret: has(env, "YOUTUBE_CLIENT_SECRET"),
      redirect_uri: has(env, "YOUTUBE_REDIRECT_URI"),
      refresh_token_secret: has(env, "YOUTUBE_REFRESH_TOKEN"),
      encrypted_refresh_token_in_kv: encryptedToken,
      state_store: Boolean(env.LEADS),
      admin_token: has(env, "ADMIN_TOKEN")
    },
    ready_for_oauth_start: has(env, "YOUTUBE_CLIENT_ID") && has(env, "YOUTUBE_CLIENT_SECRET") && has(env, "YOUTUBE_REDIRECT_URI") && has(env, "ADMIN_TOKEN") && Boolean(env.LEADS),
    ready_for_upload: has(env, "YOUTUBE_CLIENT_ID") && has(env, "YOUTUBE_CLIENT_SECRET") && has(env, "ADMIN_TOKEN") && (has(env, "YOUTUBE_REFRESH_TOKEN") || encryptedToken)
  };
}

async function createYoutubeAuthUrl(req, env) {
  if (!isAdmin(req, env)) return html("<h1>Unauthorized</h1>", 401);
  const missing = [];
  for (const k of ["YOUTUBE_CLIENT_ID", "YOUTUBE_CLIENT_SECRET", "YOUTUBE_REDIRECT_URI", "ADMIN_TOKEN"]) if (!has(env, k)) missing.push(k);
  if (!env.LEADS) missing.push("LEADS_KV_BINDING");
  if (missing.length) return json({ ok: false, missing, next: "Add these as Cloudflare Worker secrets/bindings, then open /auth/youtube/start again." }, 400);

  const state = crypto.randomUUID();
  await env.LEADS.put(YOUTUBE_STATE_PREFIX + state, JSON.stringify({ created_at: new Date().toISOString() }), { expirationTtl: 600 });
  const params = new URLSearchParams({
    client_id: env.YOUTUBE_CLIENT_ID,
    redirect_uri: env.YOUTUBE_REDIRECT_URI,
    response_type: "code",
    scope: YOUTUBE_UPLOAD_SCOPE,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state
  });
  const authUrl = "https://accounts.google.com/o/oauth2/v2/auth?" + params.toString();
  return html(`<!doctype html><html><head><meta charset="utf-8"><title>CERBERA YouTube OAuth</title><style>${style()}</style></head><body><main><section><h1>CERBERA YouTube Bridge</h1><p>One-time Google consent. Choose the CERBERA channel, then allow upload permission.</p><a class="btn" href="${esc(authUrl)}">Open Google consent</a><pre>${esc(JSON.stringify({ scope: YOUTUBE_UPLOAD_SCOPE, target_handle: "@cerberaexe", expires_in_minutes: 10 }, null, 2))}</pre></section></main></body></html>`);
}

async function exchangeYoutubeCode(code, env) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.YOUTUBE_CLIENT_ID,
      client_secret: env.YOUTUBE_CLIENT_SECRET,
      redirect_uri: env.YOUTUBE_REDIRECT_URI,
      grant_type: "authorization_code"
    })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error_description || data.error || "OAuth token exchange failed");
  return data;
}

async function handleYoutubeCallback(req, env) {
  const url = new URL(req.url);
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
    return html(`<!doctype html><html><head><meta charset="utf-8"><title>CERBERA Connected</title><style>${style()}</style></head><body><main><section><h1>Connection result</h1><pre>${esc(JSON.stringify({ ok: true, refresh_token_stored_encrypted: Boolean(tokenData.refresh_token), access_token_received: Boolean(tokenData.access_token), next: "/youtube/status then /youtube/upload-test" }, null, 2))}</pre></section></main></body></html>`);
  } catch (error) {
    return html(`<h1>OAuth failed</h1><pre>${esc(error.message)}</pre>`, 500);
  }
}

async function getYoutubeAccessToken(env) {
  const refreshToken = await getStoredYoutubeRefreshToken(env);
  if (!refreshToken) throw new Error("No YouTube refresh token. Open /auth/youtube/start first.");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.YOUTUBE_CLIENT_ID,
      client_secret: env.YOUTUBE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token"
    })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) throw new Error(data.error_description || data.error || "Could not refresh YouTube access token");
  return data.access_token;
}

function concatBytes(parts) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
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

async function uploadYoutubeVideo(req, env) {
  if (!isAdmin(req, env)) return json({ ok: false, status: "UNAUTHORIZED" }, 401);
  const payload = await req.json().catch(() => ({}));
  try {
    const accessToken = await getYoutubeAccessToken(env);
    const { bytes, contentType, source } = await bytesFromUploadPayload(payload);
    const boundary = "cerbera_upload_" + crypto.randomUUID().replaceAll("-", "");
    const metadata = {
      snippet: {
        title: payload.title || `CERBERA Autopilot Test ${new Date().toISOString()}`,
        description: payload.description || "Private CERBERA YouTube Upload Bridge test.",
        tags: payload.tags || ["CERBERA", "autopilot", "test"],
        categoryId: payload.categoryId || "22"
      },
      status: {
        privacyStatus: payload.privacyStatus || "private",
        selfDeclaredMadeForKids: false,
        containsSyntheticMedia: payload.containsSyntheticMedia ?? true
      }
    };
    const enc = new TextEncoder();
    const multipart = concatBytes([
      enc.encode(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`),
      enc.encode(`--${boundary}\r\nContent-Type: ${contentType}\r\n\r\n`),
      bytes,
      enc.encode(`\r\n--${boundary}--`)
    ]);
    const uploadRes = await fetch("https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status&uploadType=multipart", {
      method: "POST",
      headers: { authorization: `Bearer ${accessToken}`, "content-type": `multipart/related; boundary=${boundary}` },
      body: multipart
    });
    const data = await uploadRes.json().catch(() => ({}));
    if (!uploadRes.ok) return json({ ok: false, status: uploadRes.status, error: data }, uploadRes.status);
    return json({ ok: true, channel: "CERBERA", handle: "@cerberaexe", privacyStatus: metadata.status.privacyStatus, source, videoId: data.id, youtube_response: data });
  } catch (error) {
    return json({ ok: false, error: error.message, next: "Complete OAuth first, then POST a small videoUrl or videoBase64." }, 400);
  }
}

function cloudStatus(env) {
  return {
    claude: has(env, "CLAUDE_KEY"),
    github: has(env, "GITHUB_TOKEN") && has(env, "GITHUB_REPO"),
    supabase: has(env, "SB_URL") && has(env, "SB_KEY"),
    repo: env.GITHUB_REPO || null
  };
}

async function runCycle(env, mode = "manual") {
  return {
    ok: true,
    timestamp: new Date().toISOString(),
    mode,
    status: cloudStatus(env),
    youtube: await youtubeStatus(env),
    safety: SAFETY,
    next: "Use /youtube/status, then /auth/youtube/start, then POST /youtube/upload-test."
  };
}

function style() {
  return `body{margin:0;background:#09090b;color:#e4e4e7;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}main{max-width:980px;margin:0 auto;padding:36px 22px}section{background:#111114;border:1px solid #27272a;border-radius:18px;padding:22px}h1{color:#a78bfa}pre{white-space:pre-wrap;background:#050506;border:1px solid #27272a;border-radius:12px;padding:14px;color:#a1a1aa}.btn{display:inline-block;background:#a78bfa;color:#09090b;padding:12px 16px;border-radius:12px;font-weight:900;text-decoration:none}`;
}

function indexPage(env) {
  const now = new Date().toISOString();
  const s = cloudStatus(env);
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Octomind Cloud Brain</title><style>${style()}</style></head><body><main><section><h1>OCTOMIND CLOUD BRAIN</h1><p>Cloudflare Worker live. CERBERA YouTube Bridge installed in deployed worker path.</p><pre>${esc(JSON.stringify({ worker: "online", claude: s.claude, github: s.github, supabase: s.supabase, endpoints: ["/health", "/status", "/run", "/youtube/status", "/auth/youtube/start", "/auth/youtube/callback", "/youtube/upload-test"], time: now }, null, 2))}</pre></section></main></body></html>`;
}

export default {
  async fetch(req, env) {
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    const url = new URL(req.url);

    if (url.pathname === "/health") return json({ ok: true, service: "octomind-cloud-brain", timestamp: new Date().toISOString(), youtube_bridge: "installed" });
    if (url.pathname === "/status") return json({ ok: true, mode: "cloud_only", worker: "online", timestamp: new Date().toISOString(), status: cloudStatus(env), youtube: await youtubeStatus(env), safety: SAFETY });
    if (url.pathname === "/youtube/status") return json(await youtubeStatus(env));
    if (url.pathname === "/auth/youtube/start") return createYoutubeAuthUrl(req, env);
    if (url.pathname === "/auth/youtube/callback") return handleYoutubeCallback(req, env);
    if (url.pathname === "/youtube/upload-test" && req.method === "POST") return uploadYoutubeVideo(req, env);
    if (url.pathname === "/run" && req.method === "POST") return json(await runCycle(env, "manual"));

    return html(indexPage(env));
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runCycle(env, "scheduled"));
  }
};
