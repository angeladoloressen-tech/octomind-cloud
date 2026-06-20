const byId = (id) => document.getElementById(id);

const formatLabel = (value) => String(value ?? "—")
  .replaceAll("_", " ")
  .toLowerCase()
  .replace(/\b\w/g, (character) => character.toUpperCase());

const formatDate = (value) => {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC"
  }).format(parsed) + " UTC";
};

const renderLedger = (entries = []) => {
  const container = byId("release-ledger");
  if (!container) return;

  if (!Array.isArray(entries) || entries.length === 0) {
    container.innerHTML = '<p class="empty-state">No governed public releases have been published yet.</p>';
    return;
  }

  container.innerHTML = entries.map((entry) => `
    <article class="ledger-row">
      <div class="ledger-id">${entry.id ?? "UNTRACKED"}</div>
      <div class="ledger-status">${formatLabel(entry.status)}</div>
      <div class="ledger-copy">
        <strong>${entry.title ?? "Untitled release"}</strong>
        <p>${entry.summary ?? "No public summary available."}</p>
      </div>
    </article>
  `).join("");
};

const renderRoadmap = (items = []) => {
  const container = byId("roadmap-list");
  if (!container) return;

  if (!Array.isArray(items) || items.length === 0) {
    container.innerHTML = '<li><span>—</span><p>No public roadmap items are currently approved.</p></li>';
    return;
  }

  container.innerHTML = items.map((item, index) => `
    <li>
      <span>${String(index + 1).padStart(2, "0")}</span>
      <p>${item}</p>
    </li>
  `).join("");
};

const applyStatus = (payload) => {
  byId("portal-status").textContent = formatLabel(payload.portal_status);
  byId("core-mode").textContent = formatLabel(payload.core_mode);
  byId("paid-api-mode").textContent = formatLabel(payload.paid_api_mode);
  byId("human-approval").textContent = formatLabel(payload.human_approval);
  byId("status-note").textContent = payload.public_note ?? "Sanitized public status loaded.";
  byId("updated-at").textContent = `Last updated: ${formatDate(payload.generated_at)}`;

  const metrics = payload.public_metrics ?? {};
  byId("metric-opportunities").textContent = Number(metrics.qualified_opportunities ?? 0);
  byId("metric-experiments").textContent = Number(metrics.monetization_experiments ?? 0);
  byId("metric-releases").textContent = Number(metrics.governed_releases ?? 0);

  renderLedger(payload.release_ledger);
  renderRoadmap(payload.next_controlled_milestones);
};

const failClosed = () => {
  byId("portal-status").textContent = "Status Unavailable";
  byId("core-mode").textContent = "Private Local-First";
  byId("paid-api-mode").textContent = "Disabled";
  byId("human-approval").textContent = "Required";
  byId("status-note").textContent = "Public status data could not be loaded. No private fallback data is exposed.";
  byId("updated-at").textContent = "Last updated: unavailable";
  renderLedger([]);
  renderRoadmap([]);
};

fetch("data/public_status.json", { cache: "no-store" })
  .then((response) => {
    if (!response.ok) throw new Error(`Status request failed: ${response.status}`);
    return response.json();
  })
  .then(applyStatus)
  .catch((error) => {
    console.error("AION Observatory public status error:", error);
    failClosed();
  });
