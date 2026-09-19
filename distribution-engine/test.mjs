import assert from 'node:assert/strict';
import { auditPortfolio, distributionGate, nextAction, verifiedRevenue } from './engine.mjs';

const incomplete = {
  id: 'x',
  canonicalHome: true,
  discoveryPath: false,
  audienceCapture: false,
  valuePath: false,
};

assert.equal(distributionGate(incomplete).complete, false);
assert.deepEqual(distributionGate(incomplete).missing, ['discoveryPath', 'audienceCapture', 'valuePath']);
assert.equal(nextAction(incomplete), 'DISTRIBUTE');

const risky = {
  id: 'rights',
  canonicalHome: true,
  discoveryPath: true,
  audienceCapture: true,
  valuePath: true,
  firstPublicationRightsActive: true,
  fullManuscriptPublic: true,
};
assert.equal(nextAction(risky), 'HOLD_UNPUBLISHED');

assert.equal(verifiedRevenue([
  { type: 'pitch', amount: 300, verified: false },
  { type: 'payment', amount: 120, verified: true },
  { type: 'payment', amount: 50, verified: false },
]), 120);

const report = auditPortfolio([incomplete, risky], []);
assert.equal(report.totalAssets, 2);
assert.equal(report.incompleteAssets, 1);
assert.equal(report.actionQueue[0].action, 'HOLD_UNPUBLISHED');

console.log('distribution-engine tests: PASS');
