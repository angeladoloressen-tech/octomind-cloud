export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const body = typeof req.body === 'object' && req.body ? req.body : {};
  const paymentStatus = String(body.payment_status || 'unverified');
  const pilotStatus = String(body.free_pilot_status || 'not_approved');

  const allowed = paymentStatus === 'paid_verified' || pilotStatus === 'approved';

  if (!allowed) {
    return res.status(202).json({
      ok: true,
      delivery_allowed: false,
      moneygate_state: 'delivery_blocked',
      reason: 'payment_not_verified_or_free_pilot_not_approved',
      next_step: 'verify payment or approve free pilot before delivery starts'
    });
  }

  return res.status(200).json({
    ok: true,
    delivery_allowed: true,
    moneygate_state: 'delivery_started',
    delivery_pack: 'ai_revenue_autopilot_setup',
    next_step: 'prepare client delivery pack'
  });
}
