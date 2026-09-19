import assert from 'node:assert/strict';
import { evaluateMarketCell, scaleGate } from './market-cell-engine.mjs';

const spammy = evaluateMarketCell({
  id: 'city-a',
  standaloneValue: 0.2,
  localEvidence: 0.1,
  demandEvidence: 0.9,
  conversionClarity: 0.9,
  maintainability: 0.8,
  funnelsToSameDestination: true,
  nearDuplicateOfOtherCells: true,
});
assert.equal(spammy.policySafe, false);
assert.equal(spammy.recommendation, 'DO_NOT_SCALE');
assert.equal(spammy.risk.risky, true);

const useful = {
  id: 'rheine-ai-transparency',
  standaloneValue: 0.9,
  localEvidence: 0.8,
  demandEvidence: 0.7,
  conversionClarity: 0.8,
  maintainability: 0.9,
};
const pilot = scaleGate({ cell: useful, outcomes: [] });
assert.equal(pilot.mode, 'PROVE_ONE_CELL');
assert.equal(pilot.allowScale, false);

const outcomes = Array.from({ length: 5 }, (_, i) => ({
  outcome_known: true,
  intent: i < 3 ? 1 : 0,
  revenue: i === 0 ? 100 : 0,
}));
const proven = scaleGate({ cell: useful, outcomes });
assert.equal(proven.allowScale, true);
assert.equal(proven.mode, 'SCALE_CAREFULLY');

console.log('market-cell engine tests: PASS');
