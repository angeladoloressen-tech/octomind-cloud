const ROLE_NEEDS = {
  canonicalHome: ['canonical'],
  discoveryPath: ['discovery', 'professional-distribution', 'demo'],
  audienceCapture: ['audience-capture'],
  valuePath: []
};

function kindScore(asset, platform) {
  return platform.assetKinds?.includes(asset.kind) ? 35 : 0;
}

function roleScore(asset, platform) {
  let score = 0;
  for (const [layer, roles] of Object.entries(ROLE_NEEDS)) {
    if (asset[layer]) continue;
    if (roles.some((r) => platform.roles?.includes(r))) score += 30;
  }
  return score;
}

function strategicScore(asset, platform) {
  let score = 0;
  if (asset.kind === 'research' && platform.id === 'zenodo') score += 25;
  if (['research', 'dataset', 'benchmark', 'software'].includes(asset.kind) && platform.id === 'huggingface') score += 20;
  if (asset.kind === 'essay' && platform.id === 'linkedin-newsletter') score += 20;
  if (['essay', 'research', 'documentation'].includes(asset.kind) && platform.id === 'github-pages') score += 15;
  return score;
}

function readinessPenalty(platform) {
  if (platform.currentStatus === 'connector-not-available') return 15;
  if (platform.currentStatus === 'not-connected') return 20;
  if (platform.currentStatus?.includes('not-enabled')) return 10;
  return 0;
}

export function routeAsset(asset, platforms = []) {
  if (asset.firstPublicationRightsActive && asset.fullManuscriptPublic !== true && asset.status === 'pitching') {
    return [{ platform: 'hold-unpublished', score: 1000, reason: 'Preserve first-publication rights while editorial pitch is active.' }];
  }

  return platforms.map((platform) => {
    const score = kindScore(asset, platform) + roleScore(asset, platform) + strategicScore(asset, platform) - readinessPenalty(platform);
    return {
      platform: platform.id,
      name: platform.name,
      score,
      status: platform.currentStatus,
      reason: `${asset.kind} fit + missing-layer fit + strategic fit, adjusted for readiness.`
    };
  }).filter((r) => r.score > 0).sort((a, b) => b.score - a.score);
}

export function routePortfolio(assets = [], platforms = []) {
  return assets.map((asset) => ({
    assetId: asset.id,
    title: asset.title,
    routes: routeAsset(asset, platforms).slice(0, 3)
  }));
}
