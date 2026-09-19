function count(v) {
  const n = Number(v ?? 0);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function adaptSiteAnalytics(metrics = null) {
  if (!metrics) {
    return {
      events: [],
      diagnostics: [{
        source: 'site',
        status: 'unavailable',
        reason: 'No site analytics snapshot was supplied. Missing data is not treated as zero traffic.',
      }],
    };
  }

  const events = [];
  const views = count(metrics.views);
  const returning = count(metrics.returningVisitors ?? metrics.returning_visitors);
  const ctaClicks = count(metrics.ctaClicks ?? metrics.cta_clicks);

  if (views) events.push({ source: 'site', type: 'view', count: views, snapshot: true });
  if (returning) events.push({ source: 'site', type: 'returning_visit', count: returning, snapshot: true });
  if (ctaClicks) events.push({ source: 'site', type: 'cta_click', count: ctaClicks, snapshot: true });

  return {
    events,
    diagnostics: [{ source: 'site', status: 'ok', views, returningVisitors: returning, ctaClicks }],
  };
}
