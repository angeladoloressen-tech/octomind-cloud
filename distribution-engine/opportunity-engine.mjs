const DEFAULT_WEIGHTS = {
  attention: 1,
  retention: 3,
  intent: 7,
  commercial_evidence: 15,
  revenue: 30,
};

function n(value) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function opportunityFeatures(row = {}) {
  return {
    attention: n(row.attention),
    retention: n(row.retention),
    intent: n(row.intent),
    commercial_evidence: n(row.commercial_evidence),
    revenue: n(row.revenue),
    effort_hours: Math.max(0, n(row.effort_hours)),
    cash_cost: Math.max(0, n(row.cash_cost)),
    rights_risk: row.rights_risk === true ? 1 : 0,
    eligibility_blocked: row.eligibility_blocked === true ? 1 : 0,
  };
}

export function heuristicOpportunityScore(row = {}, weights = DEFAULT_WEIGHTS) {
  const f = opportunityFeatures(row);
  if (f.eligibility_blocked) return -Infinity;
  const upside =
    f.attention * weights.attention +
    f.retention * weights.retention +
    f.intent * weights.intent +
    f.commercial_evidence * weights.commercial_evidence +
    f.revenue * weights.revenue;
  const friction = f.effort_hours * 2 + f.cash_cost * 5 + f.rights_risk * 100;
  return upside - friction;
}

export function empiricalLift(history = [], candidate = {}) {
  const same = history.filter((row) =>
    row.platform === candidate.platform && row.asset_kind === candidate.asset_kind
  );
  if (same.length < 3) return { observations: same.length, lift: 0, confidence: 'low' };
  const avgIntent = same.reduce((s, r) => s + n(r.intent), 0) / same.length;
  const avgRetention = same.reduce((s, r) => s + n(r.retention), 0) / same.length;
  const avgRevenue = same.reduce((s, r) => s + n(r.revenue), 0) / same.length;
  return {
    observations: same.length,
    lift: avgIntent * 7 + avgRetention * 3 + avgRevenue * 30,
    confidence: same.length >= 12 ? 'medium' : 'low',
  };
}

export function rankOpportunities(candidates = [], history = []) {
  return candidates.map((candidate) => {
    const baseline = heuristicOpportunityScore(candidate);
    const empirical = empiricalLift(history, candidate);
    const score = Number.isFinite(baseline) ? baseline + empirical.lift : baseline;
    return { ...candidate, score, empirical };
  }).sort((a, b) => b.score - a.score);
}

export function modelReadiness(history = [], options = {}) {
  const minRows = Number(options.minRows ?? 50);
  const labels = history.filter((r) =>
    r.outcome_known === true &&
    [r.intent, r.retention, r.revenue].some((v) => Number.isFinite(Number(v)))
  ).length;
  return {
    backend: labels >= minRows ? 'tabular-model-eligible' : 'heuristic',
    labeledRows: labels,
    minRows,
    readyForExternalTabularModel: labels >= minRows,
    rule: labels >= minRows
      ? 'Enough labeled aggregate rows exist to evaluate an optional tabular model backend.'
      : 'Collect aggregate outcome rows first; do not pretend to have predictive evidence yet.',
  };
}

export function buildTrainingRows(events = []) {
  return events.map((e) => ({
    date: e.date ?? null,
    asset_id: e.asset_id ?? null,
    asset_kind: e.asset_kind ?? 'unknown',
    platform: e.platform ?? 'unknown',
    attention: n(e.attention),
    retention: n(e.retention),
    intent: n(e.intent),
    commercial_evidence: n(e.commercial_evidence),
    revenue: n(e.revenue),
    effort_hours: n(e.effort_hours),
    cash_cost: n(e.cash_cost),
    outcome_known: e.outcome_known === true,
  }));
}
