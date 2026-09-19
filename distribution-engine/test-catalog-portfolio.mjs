import assert from 'node:assert/strict';
import { catalogCompliance, decideCatalogAction, rankCatalogConcepts } from './catalog-portfolio-engine.mjs';

assert.equal(catalogCompliance({
  accountEligible: true,
  guardianRequired: false,
  aiGenerated: false,
  qualityReviewed: true,
}).pass, true);

assert.equal(catalogCompliance({
  accountEligible: true,
  guardianRequired: true,
  guardianInvolved: false,
  aiGenerated: false,
  qualityReviewed: true,
}).pass, false);

const pilot = decideCatalogAction({
  conceptId: 'c1',
  accountEligible: true,
  guardianRequired: false,
  aiGenerated: false,
  qualityReviewed: true,
  searchEvidence: 8,
  audienceQuestions: 7,
  buyerPainEvidence: 8,
  competitionGap: 7,
  differentiation: 8,
}, []);
assert.equal(pilot.action, 'PILOT_ONE_PRODUCT');

const expanded = rankCatalogConcepts([{
  conceptId: 'c2', title: 'Useful guide', accountEligible: true, guardianRequired: false,
  aiGenerated: false, qualityReviewed: true, searchEvidence: 8, audienceQuestions: 8,
  buyerPainEvidence: 8, competitionGap: 7, differentiation: 9, sales: 5,
}], [
  { conceptId: 'c2', outcomeKnown: true, sales: 2, views: 200 },
  { conceptId: 'c2', outcomeKnown: true, sales: 2, views: 300 },
  { conceptId: 'c2', outcomeKnown: true, sales: 1, views: 150 },
]);
assert.equal(expanded[0].action, 'EXPAND_CAREFULLY');

console.log('catalog portfolio engine tests: PASS');
