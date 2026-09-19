export const MARKET_CELL_RULES = Object.freeze({
  minStandaloneValue: 0.75,
  minLocalEvidence: 0.6,
  minDemandEvidence: 0.5,
  minIntentSignalsToScale: 3,
  minKnownOutcomesToScale: 5,
});

const clamp01 = (n) => Math.max(0, Math.min(1, Number(n ?? 0)));

export function doorwayRisk(cell = {}) {
  const reasons = [];
  if (cell.funnelsToSameDestination === true) reasons.push('funnels-to-same-destination');
  if (cell.nearDuplicateOfOtherCells === true) reasons.push('near-duplicate-pages');
  if (cell.hiddenPortfolioFootprintIntent === true) reasons.push('footprint-concealment-intent');
  if (cell.primaryPurpose === 'rank-manipulation') reasons.push('ranking-manipulation-primary-purpose');
  return { risky: reasons.length > 0, reasons };
}

export function evaluateMarketCell(cell = {}) {
  const risk = doorwayRisk(cell);
  const standaloneValue = clamp01(cell.standaloneValue);
  const localEvidence = clamp01(cell.localEvidence);
  const demandEvidence = clamp01(cell.demandEvidence);
  const conversionClarity = clamp01(cell.conversionClarity);
  const maintainability = clamp01(cell.maintainability);

  const score = Math.round(100 * (
    standaloneValue * 0.30 +
    localEvidence * 0.20 +
    demandEvidence * 0.20 +
    conversionClarity * 0.20 +
    maintainability * 0.10
  ));

  const policySafe = !risk.risky &&
    standaloneValue >= MARKET_CELL_RULES.minStandaloneValue &&
    localEvidence >= MARKET_CELL_RULES.minLocalEvidence;

  return {
    id: cell.id ?? null,
    score,
    policySafe,
    risk,
    recommendation: !policySafe ? 'DO_NOT_SCALE' : score >= 70 ? 'PILOT_ONE_CELL' : 'IMPROVE_BEFORE_PILOT',
  };
}

export function scaleGate({ cell, outcomes = [] } = {}) {
  const evaluation = evaluateMarketCell(cell);
  const known = outcomes.filter((o) => o?.outcome_known === true);
  const intent = known.reduce((sum, o) => sum + Number(o.intent ?? 0), 0);
  const revenue = known.reduce((sum, o) => sum + Number(o.revenue ?? 0), 0);

  const evidenceReady = known.length >= MARKET_CELL_RULES.minKnownOutcomesToScale &&
    intent >= MARKET_CELL_RULES.minIntentSignalsToScale;

  return {
    ...evaluation,
    knownOutcomes: known.length,
    intentSignals: intent,
    verifiedRevenue: revenue,
    allowScale: evaluation.policySafe && evidenceReady,
    mode: evaluation.policySafe && evidenceReady ? 'SCALE_CAREFULLY' : 'PROVE_ONE_CELL',
    rule: evaluation.policySafe && evidenceReady
      ? 'Scale only by creating independently useful, non-duplicate cells with real local evidence.'
      : 'Do not mass-deploy. Prove one independently useful cell with measurable outcomes first.',
  };
}
