const DEFAULT_ROLE_MAP = {
  newsletter: 'subscriber',
  research_inquiry: 'inquiry',
  project_inquiry: 'inquiry',
  service_inquiry: 'inquiry',
};

function toCount(value) {
  const n = Number(value ?? 0);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function adaptJotform(forms = [], { roleMap = {} } = {}) {
  const roles = { ...DEFAULT_ROLE_MAP, ...roleMap };
  const events = [];
  const diagnostics = [];

  for (const form of forms) {
    const role = form.role ?? null;
    const count = toCount(form.submission_count ?? form.submissionCount ?? form.metadata?.submission_count);
    const status = String(form.status ?? form.metadata?.status ?? 'UNKNOWN').toUpperCase();
    const eventType = role ? roles[role] : null;

    if (eventType && count > 0) {
      events.push({ source: 'jotform', type: eventType, count, snapshot: true });
    }

    diagnostics.push({
      source: 'jotform',
      formId: form.id ?? null,
      role,
      status,
      submissionCount: count,
      enabled: status === 'ENABLED',
    });
  }

  return { events, diagnostics };
}
