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
  const event = {
    created_at: new Date().toISOString(),
    mode: 'demo_event_log_only',
    type: String(body.type || 'unknown').slice(0, 80),
    path: String(body.path || '').slice(0, 80),
    state: String(body.state || 'observed').slice(0, 80),
    source: String(body.source || 'moneygate').slice(0, 80)
  };

  return res.status(202).json({
    ok: true,
    status: 'event_received_demo_mode_not_persisted',
    message: 'MoneyGate event captured in demo mode. Persistent event storage is not connected yet.',
    event
  });
}
