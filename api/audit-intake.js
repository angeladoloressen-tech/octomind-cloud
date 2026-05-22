export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const body = typeof req.body === 'object' && req.body ? req.body : {};
  const required = ['business', 'email', 'profile', 'niche'];
  const missing = required.filter((key) => !String(body[key] || '').trim());

  if (missing.length) {
    return res.status(400).json({ ok: false, error: 'missing_fields', missing });
  }

  const lead = {
    created_at: new Date().toISOString(),
    business: String(body.business).slice(0, 160),
    email: String(body.email).slice(0, 180),
    profile: String(body.profile).slice(0, 500),
    niche: String(body.niche).slice(0, 120),
    problem: String(body.problem || '').slice(0, 1000),
    audit_status: 'received',
    offer_status: 'not_offered',
    payment_status: 'unpaid',
    delivery_status: 'not_started'
  };

  // Storage is intentionally not enabled here yet. Connect a database or Make webhook before public launch.
  return res.status(202).json({
    ok: true,
    status: 'received_demo_mode_storage_not_connected',
    lead
  });
}
