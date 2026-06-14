import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../lib/supabase';
import { buildOfferSummary, normalizeLead, validateLead } from '../../../lib/offer';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const lead = normalizeLead(payload);
    const validation = validateLead(lead);

    if (!validation.ok) {
      return NextResponse.json({ ok: false, error: validation.error }, { status: 400 });
    }

    const offer = buildOfferSummary(lead);
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('metis_leads')
      .insert({
        name: lead.name,
        email: lead.email,
        business: lead.business,
        niche: lead.niche,
        pain: lead.pain,
        revenue_goal: lead.revenue_goal,
        offer_snapshot: offer,
        status: 'new'
      })
      .select('id')
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ ok: true, lead_id: data.id, offer });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown intake error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
