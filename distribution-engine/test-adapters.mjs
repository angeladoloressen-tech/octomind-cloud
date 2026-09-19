import assert from 'node:assert/strict';
import { ingestSources } from './adapters/index.mjs';
import { auditPortfolio } from './engine.mjs';

const input = {
  gmail: {
    messages: [
      { from_: 'owner@example.com', subject: 'PITCH — Essay', labels: ['SENT'] },
      { from_: 'editor@example.org', subject: 'Re: PITCH — Essay', labels: ['INBOX'] },
    ],
  },
  jotform: {
    forms: [
      { id: 'n', role: 'newsletter', status: 'ENABLED', submission_count: '3' },
      { id: 'r', role: 'research_inquiry', status: 'ENABLED', submission_count: '2' },
    ],
  },
  github: {
    repo: { private: false, stargazers_count: 4, subscribers_count: 1, forks_count: 2 },
    commits: 5,
    mergedPullRequests: 1,
  },
  site: { views: 100, returningVisitors: 12, ctaClicks: 7 },
};

const ingested = ingestSources(input, { ownAddresses: ['owner@example.com'] });
const report = auditPortfolio([], ingested.events);

assert.equal(report.signals.activity, 7); // 1 sent pitch + 5 commits + 1 merged PR
assert.equal(report.signals.attention, 100);
assert.equal(report.signals.retention, 20); // 3 subscribers + 4 stars + 1 watcher + 12 returning
assert.equal(report.signals.intent, 12); // 1 reply + 2 inquiries + 2 forks + 7 CTA clicks
assert.equal(report.verifiedRevenue, 0);
assert.equal(ingested.diagnostics.some((d) => d.source === 'gmail'), true);
assert.equal(ingested.diagnostics.some((d) => d.source === 'jotform'), true);

const unavailable = ingestSources({});
assert.equal(unavailable.diagnostics.some((d) => d.source === 'site' && d.status === 'unavailable'), true);

console.log('distribution-engine adapter tests: PASS');
