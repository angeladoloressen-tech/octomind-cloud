export const LAYERS = ['canonicalHome', 'discoveryPath', 'audienceCapture', 'valuePath'];

const WEIGHTS = {
  canonicalHome: 40,
  discoveryPath: 30,
  audienceCapture: 20,
  valuePath: 10,
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
  return {
    complete: missing.length === 0,
    missing,
    state: missing.length ? 'DISTRIBUTION_INCOMPLETE' : 'DISTRIBUTION_COMPLETE',
  };
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
  return events
    .filter((e) => e.type === 'payment' && e.verified === true)
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);
}

export function auditPortfolio(assets = [], revenueEvents = []) {
  const audited = assets.map((raw) => {
    const asset = normalizeAsset(raw);
    const gate = distributionGate(asset);
    return {
      ...asset,
      ...gate,
      action: nextAction(asset),
      priority: priorityScore(asset),
      rightsRisk: rightsRisk(asset),
    };
  }).sort((a, b) => b.priority - a.priority);

  return {
    generatedAt: new Date().toISOString(),
    totalAssets: audited.length,
    completeAssets: audited.filter((a) => a.complete).length,
    incompleteAssets: audited.filter((a) => !a.complete).length,
    verifiedRevenue: verifiedRevenue(revenueEvents),
    actionQueue: audited.filter((a) => a.action !== 'OPTIMIZE'),
    assets: audited,
  };
}
