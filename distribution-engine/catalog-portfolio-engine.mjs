const clamp = (n, min, max) => Math.max(min, Math.min(max, Number(n ?? 0)));

export function catalogCompliance(item = {}) {
  const reasons = [];
  if (item.accountEligible === false) reasons.push('ACCOUNT_ELIGIBILITY_REQUIRED');
  if (item.guardianRequired === true && item.guardianInvolved !== true) reasons.push('GUARDIAN_INVOLVEMENT_REQUIRED');
  if (item.aiGenerated === true && item.aiDisclosureReady !== true) reasons.push('AI_DISCLOSURE_NOT_READY');
  if (item.qualityReviewed !== true) reasons.push('QUALITY_REVIEW_REQUIRED');
  if (item.duplicateOrRepackaged === true) reasons.push('DUPLICATE_OR_REPACKAGED_CONTENT');
  if (item.misleadingMetadata === true) reasons.push('MISLEADING_METADATA');
  return { pass: reasons.length === 0, reasons };
}

export function demandScore(item = {}) {
  const search = clamp(item.searchEvidence, 0, 10) * 2;
  const comments = clamp(item.audienceQuestions, 0, 10) * 2;
  const buyerPain = clamp(item.buyerPainEvidence, 0, 10) * 3;
  const competitionGap = clamp(item.competitionGap, 0, 10) * 2;
  const differentiation = clamp(item.differentiation, 0, 10) * 3;
  return search + comments + buyerPain + competitionGap + differentiation;
}

export function outcomeScore(item = {}) {
  const views = Math.log10(1 + Number(item.views ?? 0)) * 3;
  const samples = Number(item.sampleDownloads ?? 0) * 2;
  const wishlists = Number(item.wishlists ?? 0) * 4;
  const sales = Number(item.sales ?? 0) * 15;
  const reviews = Number(item.verifiedReviews ?? 0) * 6;
  const refunds = Number(item.refunds ?? 0) * -10;
  return views + samples + wishlists + sales + reviews + refunds;
}

export function decideCatalogAction(item = {}, history = []) {
  const compliance = catalogCompliance(item);
  if (!compliance.pass) return { action: 'BLOCK', compliance, reason: compliance.reasons.join(',') };

  const demand = demandScore(item);
  const known = history.filter((r) => r.outcomeKnown === true && r.conceptId === item.conceptId);
  const outcome = outcomeScore({
    views: known.reduce((s, r) => s + Number(r.views ?? 0), 0),
    sampleDownloads: known.reduce((s, r) => s + Number(r.sampleDownloads ?? 0), 0),
    wishlists: known.reduce((s, r) => s + Number(r.wishlists ?? 0), 0),
    sales: known.reduce((s, r) => s + Number(r.sales ?? 0), 0),
    verifiedReviews: known.reduce((s, r) => s + Number(r.verifiedReviews ?? 0), 0),
    refunds: known.reduce((s, r) => s + Number(r.refunds ?? 0), 0),
  });

  if (known.length === 0) {
    return { action: demand >= 55 ? 'PILOT_ONE_PRODUCT' : 'RESEARCH_DEMAND', demand, outcome, knownOutcomes: 0 };
  }
  if (outcome <= 0) return { action: 'STOP_OR_REPOSITION', demand, outcome, knownOutcomes: known.length };
  if (known.length < 3 || Number(item.sales ?? 0) < 3) {
    return { action: 'ITERATE_SINGLE_PRODUCT', demand, outcome, knownOutcomes: known.length };
  }
  return { action: 'EXPAND_CAREFULLY', demand, outcome, knownOutcomes: known.length };
}

export function rankCatalogConcepts(items = [], history = []) {
  return items.map((item) => ({
    conceptId: item.conceptId,
    title: item.title,
    ...decideCatalogAction(item, history),
  })).sort((a, b) => {
    const priority = { BLOCK: -1000, RESEARCH_DEMAND: 10, STOP_OR_REPOSITION: 20, ITERATE_SINGLE_PRODUCT: 40, PILOT_ONE_PRODUCT: 60, EXPAND_CAREFULLY: 80 };
    return (priority[b.action] ?? 0) - (priority[a.action] ?? 0) || (b.demand ?? 0) - (a.demand ?? 0);
  });
}
