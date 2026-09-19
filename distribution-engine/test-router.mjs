import assert from 'node:assert/strict';
import fs from 'node:fs';
import { routeAsset } from './router.mjs';

const { platforms } = JSON.parse(fs.readFileSync(new URL('./platforms.json', import.meta.url), 'utf8'));

const research = {
  id: 'r1', title: 'Research', kind: 'research',
  canonicalHome: true, discoveryPath: false,
  audienceCapture: false, valueRole: 'credibility'
};
const researchRoutes = routeAsset(research, platforms);
assert.equal(researchRoutes[0].platform, 'zenodo');

const pitching = {
  id: 'e1', title: 'Pitching Essay', kind: 'editorial', status: 'pitching',
  canonicalHome: true, discoveryPath: true, audienceCapture: true, valuePath: true,
  firstPublicationRightsActive: true, fullManuscriptPublic: false
};
assert.equal(routeAsset(pitching, platforms)[0].platform, 'hold-unpublished');

console.log('distribution-engine router tests: PASS');
