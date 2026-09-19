import assert from 'node:assert/strict';
import { evaluatePassiveAsset, passivePortfolioPolicy } from './passive-asset-engine.mjs';

const blocked=evaluatePassiveAsset({id:'kit',deliverableReady:true,complianceReady:true,payoutEligible:false,guardianRequired:true,guardianReady:false});
assert.equal(blocked.action,'READY_BUT_NOT_SELLABLE');
assert.ok(blocked.blockers.includes('GUARDIAN_PAYOUT_SETUP_REQUIRED'));

const ready=evaluatePassiveAsset({id:'kit',deliverableReady:true,complianceReady:true,payoutEligible:true,evergreen:true,searchFit:4,demandEvidence:3,differentiation:4,qualityScore:5,marginalCost:0,views:0,verifiedSales:0});
assert.equal(ready.action,'LIST_ONE_PRODUCT_AND_MEASURE');

const proven=evaluatePassiveAsset({id:'kit',deliverableReady:true,complianceReady:true,payoutEligible:true,evergreen:true,searchFit:4,demandEvidence:4,differentiation:4,qualityScore:5,marginalCost:0,views:100,verifiedSales:2,conversionRate:0.02});
assert.equal(proven.action,'ITERATE_AND_KEEP_LISTED');

const policy=passivePortfolioPolicy([proven]);
assert.equal(policy.allowNewPassiveAsset,true);
console.log('passive asset engine tests: PASS');
