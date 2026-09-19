#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { auditPortfolio } from './engine.mjs';
import { ingestSources } from './adapters/index.mjs';
import { routePortfolio } from './router.mjs';

const input = process.argv[2] ?? './distribution-engine/sample-assets.json';
const resolved = path.resolve(process.cwd(), input);
const payload = JSON.parse(fs.readFileSync(resolved, 'utf8'));
const platformsPath = path.resolve(path.dirname(new URL(import.meta.url).pathname), 'platforms.json');
const { platforms } = JSON.parse(fs.readFileSync(platformsPath, 'utf8'));

const ingested = ingestSources(payload.sources ?? {}, payload.adapterOptions ?? {});
const events = [
  ...(payload.events ?? payload.revenueEvents ?? []),
  ...ingested.events,
];
const report = auditPortfolio(payload.assets ?? [], events);
report.sourceDiagnostics = ingested.diagnostics;
report.platformRoutes = routePortfolio(report.assets, platforms);

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
}

console.log('\nDISTRIBUTION & MONETIZATION ENGINE');
console.log('----------------------------------');
console.log(`Mode: ${report.creationPolicy.mode}`);
console.log(`New major project allowed: ${report.creationPolicy.allowNewMajorProject ? 'YES' : 'NO'}`);
console.log(`Assets: ${report.totalAssets}`);
console.log(`Complete: ${report.completeAssets}`);
console.log(`Incomplete: ${report.incompleteAssets}`);
console.log(`Verified revenue: ${report.verifiedRevenue}`);
console.log(`Signals: ${JSON.stringify(report.signals)}`);
console.log('\nNEXT ACTIONS');
for (const asset of report.actionQueue) {
  console.log(`- [${asset.priority}] ${asset.title}`);
  console.log(`  action=${asset.action} missing=${asset.missing.join(',') || 'none'}`);
  if (asset.rightsRisk) console.log('  RIGHTS RISK: full manuscript is public while first-publication rights are active');
}

console.log('\nPLATFORM ROUTES');
for (const routed of report.platformRoutes) {
  const top = routed.routes[0];
  if (!top) continue;
  console.log(`- ${routed.title}`);
  console.log(`  next=${top.platform} score=${top.score} status=${top.status ?? 'n/a'}`);
}

console.log('\nSOURCE HEALTH');
for (const d of report.sourceDiagnostics) {
  const detail = d.status ?? (d.enabled === false ? 'disabled' : 'ok');
  console.log(`- ${d.source}: ${detail}`);
}

if (!report.creationPolicy.allowNewMajorProject) {
  console.log('\nCREATION GATE');
  console.log(report.creationPolicy.rule);
  console.log(`Blockers: ${report.creationPolicy.blockerIds.join(', ')}`);
}
