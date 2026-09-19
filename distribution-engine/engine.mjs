export const LAYERS = ['canonicalHome', 'discoveryPath', 'audienceCapture', 'valuePath'];

const WEIGHTS = { canonicalHome: 40, discoveryPath: 30, audienceCapture: 20, valuePath: 10 };

export const SIGNAL_STAGE = {
  impression: 'attention', view: 'attention', profile_visit: 'attention',
  follow: 'retention', subscriber: 'retention', returning_visit: 'retention',
  github_star: 'retention', github_watch: 'retention',
  reply: 'intent', inquiry: 'intent', editor_interest: 'intent', meeting_request: 'intent',
  cta_click: 'intent', github_fork: 'intent',
  commission_agreed: 'commercial_evidence', contract_signed: 'commercial_evidence',
  payment: 'revenue',
  outbound_pitch: 'activity', commit: 'activity', merged_pr: 'activity', publication: 'activity',
};

function bool(v) {
  return v === true || (typeof v === 'string' && v.trim().length > 0);
}

export function normalizeAsset(asset) {
  return {
    id: asset.id,
    title: asset.title ?? asset.id,
    kind: asset.kind ?? 'unknown',
    status: asset.status ?? 'draft',
    canonicalHome: bool(asset.canonicalHome),
    discoveryPath: bool(asset.discoveryPath),
    audienceCapture: bool(asset.audienceCapture),
    valuePath: bool(asset.valuePath) || asset.valueRole === 'credibility',
    valueRole: asset.valueRole ?? null,
    fullManuscriptPublic: asset.fullManuscriptPublic === true,
    firstPublicationRightsActive: asset.firstPublicationRightsActive === true,
    evergreen: asset.evergreen !== false,
    strategic: asset.strategic === true,
    signals: Array.isArray(asset.signals) ? asset.signals : [],
  };
}

export function distributionGate(asset) {
  const a = normalizeAsset(asset);
  const missing = LAYERS.filter((layer) => !a[layer]);
  return { complete: missing.length === 0, missing, state: missing.length ? 'DISTRIBUTION_INCOMPLETE' : 'DISTRIBUTION_COMPLETE' };
}

export function rightsRisk(asset) {
  const a = normalizeAsset(asset);
  return a.firstPublicationRightsActive && a.fullManuscriptPublic;
}

export function nextAction(asset) {
  const a = normalizeAsset(asset);
  if (rightsRisk(a)) return 'HOLD_UNPUBLISHED';
  if (!a.canonicalHome) return 'CANONICALIZE';
  if (!a.discoveryPath) return 'DISTRIBUTE';
  if (!a.audienceCapture) return 'CAPTURE';
  if (!a.valuePath) return 'CONVERT';
  return 'OPTIMIZE';
}

export function priorityScore(asset) {
  const a = normalizeAsset(asset);
  let score = 0;
  for (const layer of LAYERS) if (!a[layer]) score += WEIGHTS[layer];
  if (a.strategic) score += 20;
  if (a.evergreen) score += 10;
  if (rightsRisk(a)) score += 100;
  return score;
}

export function verifiedRevenue(events = []) {
  return events.filter((e) => e.type === 'payment' && e.verified === true)
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);
}

export function signalSummary(events = []) {
  const out = { activity: 0, attention: 0, retention: 0, intent: 0, commercial_evidence: 0, revenue: 0 };
  for (const event of events) {
    const stage = SIGNAL_STAGE[event.type];
    if (stage) out[stage] += Number(event.count ?? 1);
  }
  return out;
}

export function creationPolicy(auditedAssets = []) {
  const blockers = auditedAssets.filter((a) => a.strategic && !a.complete);
  return {
    mode: blockers.length ? 'DISTRIBUTION_FIRST' : 'BALANCED',
    allowNewMajorProject: blockers.length === 0,
    blockerIds: blockers.map((a) => a.id),
    rule: blockers.length
      ? 'Finish distribution gaps in strategic assets before creating a new major project.'
      : 'No strategic distribution blockers detected.',
  };
}

export function auditPortfolio(assets = [], events = []) {
  const audited = assets.map((raw) => {
    const asset = normalizeAsset(raw);
    const gate = distributionGate(asset);
    return { ...asset, ...gate, action: nextAction(asset), priority: priorityScore(asset), rightsRisk: rightsRisk(asset) };
  }).sort((a, b) => b.priority - a.priority);

  return {
    generatedAt: new Date().toISOString(),
    totalAssets: audited.length,
    completeAssets: audited.filter((a) => a.complete).length,
    incompleteAssets: audited.filter((a) => !a.complete).length,
    verifiedRevenue: verifiedRevenue(events),
    signals: signalSummary(events),
    creationPolicy: creationPolicy(audited),
    actionQueue: audited.filter((a) => a.action !== 'OPTIMIZE'),
    assets: audited,
  };
}
