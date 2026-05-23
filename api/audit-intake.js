export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const body = typeof req.body === 'object' && req.body ? req.body : {};
  const required = ['business', 'email', 'profile', 'niche'];
  const missing = required.filter((key) => !String(body[key] || '').trim());

  if (missing.length) {
    return res.status(400).json({ ok: false, error: 'missing_required_fields', missing });
  }

  const lead = {
    created_at: new Date().toISOString(),
    mode: 'demo_storage_only',
    business: String(body.business).slice(0, 160),
    email: String(body.email).slice(0, 180),
    profile: String(body.profile).slice(0, 500),
    niche: String(body.niche).slice(0, 120),
    country: String(body.country || '').slice(0, 80),
    problem: String(body.problem || '').slice(0, 1000),
    audit_status: 'received_demo_mode',
    offer_status: 'not_offered',
    payment_status: 'unpaid',
    delivery_status: 'not_started'
  };

  return res.status(202).json({
    ok: true,
    status: 'received_demo_mode_storage_not_connected',
    message: 'Audit request received in demo mode. No permanent lead storage is active yet.',
    next_step: 'Connect approved storage backend before public lead collection.',
    lead
  });
}
