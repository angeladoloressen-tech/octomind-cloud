export type LeadInput = {
  name: string;
  email: string;
  business: string;
  niche: string;
  pain: string;
  revenue_goal: string;
};

export function normalizeLead(input: Partial<LeadInput>): LeadInput {
  return {
    name: String(input.name || '').trim(),
    email: String(input.email || '').trim().toLowerCase(),
    business: String(input.business || '').trim(),
    niche: String(input.niche || '').trim(),
    pain: String(input.pain || '').trim(),
    revenue_goal: String(input.revenue_goal || '').trim()
  };
}

export function validateLead(lead: LeadInput) {
  const missing = Object.entries(lead)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    return { ok: false, error: `Missing fields: ${missing.join(', ')}` };
  }

  if (!lead.email.includes('@')) {
    return { ok: false, error: 'Invalid email address' };
  }

  return { ok: true, error: null };
}

export function buildOfferSummary(lead: LeadInput) {
  return {
    offer_name: 'METIS Revenue Brain — 48h AI Sales Automation Setup',
    price_label: '490 EUR fixed setup',
    promise: `Build an AI sales intake, offer, checkout, CRM, and delivery tracker for ${lead.business}.`,
    delivery_window: '48 hours',
    target_outcome: `Turn ${lead.niche} demand into paid Stripe orders with a simple cloud automation flow.`,
    first_actions: [
      'Map the buyer intake flow',
      'Create one focused paid offer',
      'Connect Stripe Checkout',
      'Store leads and orders in Supabase',
      'Create a delivery task after payment',
      'Prepare follow-up messages'
    ]
  };
}
