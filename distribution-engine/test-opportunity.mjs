import assert from 'node:assert/strict';
import {
  heuristicOpportunityScore,
  rankOpportunities,
  modelReadiness,
  buildTrainingRows,
} from './opportunity-engine.mjs';

const blocked = heuristicOpportunityScore({ eligibility_blocked: true, intent: 99 });
assert.equal(blocked, -Infinity);

const lowCost = heuristicOpportunityScore({ intent: 2, retention: 1, effort_hours: 1, cash_cost: 0 });
const highCost = heuristicOpportunityScore({ intent: 2, retention: 1, effort_hours: 8, cash_cost: 4 });
assert.ok(lowCost > highCost);

const ranked = rankOpportunities([
  { id: 'a', platform: 'github', asset_kind: 'research', intent: 2, effort_hours: 1 },
  { id: 'b', platform: 'video', asset_kind: 'research', intent: 0, effort_hours: 8 },
]);
assert.equal(ranked[0].id, 'a');

assert.equal(modelReadiness([], { minRows: 10 }).backend, 'heuristic');
const history = Array.from({ length: 10 }, (_, i) => ({
  date: `2026-09-${String(i + 1).padStart(2, '0')}`,
  platform: 'github',
  asset_kind: 'research',
  intent: 1,
  retention: 1,
  revenue: 0,
  outcome_known: true,
}));
assert.equal(modelReadiness(history, { minRows: 10 }).readyForExternalTabularModel, true);
assert.equal(buildTrainingRows(history).length, 10);

console.log('predictive opportunity engine tests: PASS');
