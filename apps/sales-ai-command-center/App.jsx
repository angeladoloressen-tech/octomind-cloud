import React, { useMemo, useState } from 'react';

const initialLeads = [
  {
    id: 1,
    name: 'PLAUD AI',
    route: 'Affiliate',
    stage: 'P0 Warm',
    score: 12,
    next: 'Submit Impact application and capture tracking link.',
  },
  {
    id: 2,
    name: 'Cash Zero Sprint',
    route: 'Recovery',
    stage: 'P0 Warm',
    score: 9,
    next: 'Move every action toward first revenue.',
  },
];

const offers = [
  {
    name: 'First Signal Check',
    price: '19 EUR',
    text: 'Small diagnostic for one missed lead, reply path, or payment signal.',
  },
  {
    name: 'Signal Audit',
    price: '49 EUR',
    text: 'Broader review of inquiry, booking, affiliate, or follow-up flow.',
  },
  {
    name: 'Command Center Diagnostic',
    price: '490 EUR',
    text: 'Scoped map of workflow, revenue leaks, next actions, and risk notes.',
  },
];

function classifyLead(text) {
  const value = text.toLowerCase();
  if (value.includes('price') || value.includes('payment') || value.includes('affiliate') || value.includes('buy') || value.includes('invoice')) {
    return { stage: 'P0 Warm', offer: 'First Signal Check or affiliate route', score: 10 };
  }
  if (value.includes('interested') || value.includes('help') || value.includes('demo') || value.includes('partner')) {
    return { stage: 'P1 Watch', offer: 'Signal Audit', score: 6 };
  }
  return { stage: 'P2 Queue', offer: 'Wait or ask one clarifying business question', score: 2 };
}

function buildFollowUp(lead, offer) {
  if (!lead.trim()) return 'Add a lead note first.';
  return `Hi, thanks for the context. Based on what you shared, the safest next step is a small scoped check: ${offer}. I can review the signal path, identify the first leak, and return a concise next-action note. No broad implementation is included unless scoped separately.`;
}

export default function App() {
  const [leadText, setLeadText] = useState('A company replied about an affiliate route and asked for next steps.');
  const [selectedOffer, setSelectedOffer] = useState('First Signal Check');
  const result = useMemo(() => classifyLead(leadText), [leadText]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <section className="max-w-6xl mx-auto space-y-6">
        <header className="rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-xl">
          <p className="text-sm uppercase tracking-widest text-cyan-300">Octomind</p>
          <h1 className="text-4xl md:text-6xl font-bold mt-3">Sales AI Command Center</h1>
          <p className="text-slate-300 mt-4 max-w-3xl">
            Lead yakala, fırsatı sınıflandır, doğru teklifi seç, takip mesajı üret ve sonucu öğren.
          </p>
        </header>

        <div className="grid md:grid-cols-4 gap-4">
          {[
            ['Cash', '0 EUR'],
            ['P0 fırsat', '2'],
            ['Aktif ürün', 'PLAUD Note Pro'],
            ['Sonraki adım', 'Impact application'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
              <p className="text-slate-400 text-sm">{label}</p>
              <p className="text-2xl font-semibold mt-2">{value}</p>
            </div>
          ))}
        </div>

        <section className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-3xl bg-slate-900 border border-slate-800 p-6">
            <h2 className="text-2xl font-semibold">Lead Classifier</h2>
            <textarea
              className="mt-4 w-full h-36 rounded-2xl bg-slate-950 border border-slate-700 p-4 text-slate-100"
              value={leadText}
              onChange={(e) => setLeadText(e.target.value)}
            />
            <div className="grid md:grid-cols-3 gap-3 mt-4">
              <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800">
                <p className="text-slate-400 text-sm">Stage</p>
                <p className="font-semibold mt-1">{result.stage}</p>
              </div>
              <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800">
                <p className="text-slate-400 text-sm">Score</p>
                <p className="font-semibold mt-1">{result.score}</p>
              </div>
              <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800">
                <p className="text-slate-400 text-sm">Route</p>
                <p className="font-semibold mt-1">{result.offer}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6">
            <h2 className="text-2xl font-semibold">Follow-up Generator</h2>
            <select
              className="mt-4 w-full rounded-xl bg-slate-950 border border-slate-700 p-3"
              value={selectedOffer}
              onChange={(e) => setSelectedOffer(e.target.value)}
            >
              {offers.map((offer) => <option key={offer.name}>{offer.name}</option>)}
            </select>
            <p className="mt-4 text-sm text-slate-300 leading-6">
              {buildFollowUp(leadText, selectedOffer)}
            </p>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-4">
          {offers.map((offer) => (
            <article key={offer.name} className="rounded-3xl bg-slate-900 border border-slate-800 p-6">
              <p className="text-cyan-300 font-semibold">{offer.price}</p>
              <h3 className="text-xl font-bold mt-2">{offer.name}</h3>
              <p className="text-slate-300 mt-3">{offer.text}</p>
              <button className="mt-5 rounded-xl bg-cyan-300 text-slate-950 px-4 py-2 font-semibold">Payment CTA</button>
            </article>
          ))}
        </section>

        <section className="rounded-3xl bg-slate-900 border border-slate-800 p-6">
          <h2 className="text-2xl font-semibold">CRM Pipeline</h2>
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            {initialLeads.map((lead) => (
              <div key={lead.id} className="rounded-2xl bg-slate-950 border border-slate-800 p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-bold">{lead.name}</h3>
                  <span className="text-xs rounded-full bg-cyan-300 text-slate-950 px-3 py-1">{lead.stage}</span>
                </div>
                <p className="text-slate-400 mt-2">{lead.route} · Score {lead.score}</p>
                <p className="text-slate-300 mt-3">{lead.next}</p>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
