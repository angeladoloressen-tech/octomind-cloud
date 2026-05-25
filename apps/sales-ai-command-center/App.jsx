import React, { useMemo, useState } from 'react';

const paymentLinks = {
  firstSignalCheck: 'https://buy.stripe.com/7sYcN5gEA41wetl9b36Na0J',
  signalAudit: 'https://buy.stripe.com/4gM28rbkg41wcld9b36Na0K',
  revenueSprint: 'https://buy.stripe.com/aFafZh740eGaad55YR6Na0L',
  commandCenter: 'https://buy.stripe.com/dRm4gz5ZWapUetlfzr6Na0M',
};

const copy = {
  en: {
    badge: 'Private sales command desk',
    title: 'Turn missed signals into paid next steps.',
    subtitle: 'A demo-first sales desk for small businesses, creators, and solo operators. Start with a free proof sample, build trust, then move into a clear paid diagnostic.',
    primaryCta: 'Request free demo sample',
    secondaryCta: 'See paid offers',
    demoTitle: 'Free Demo First',
    demoText: 'The customer sees a small useful sample before paying: one leak, one missed signal, one practical next step. This lowers resistance and makes the paid offer feel natural.',
    ladderTitle: 'Trust ladder',
    classifierTitle: 'Lead classifier',
    followupTitle: 'Follow-up generator',
    pipelineTitle: 'Pipeline',
    noGuarantee: 'No guaranteed revenue claims. The service gives practical diagnosis, sales-page fixes, and automation maps.',
  },
  tr: {
    badge: 'Özel satış komuta masası',
    title: 'Kaçan sinyalleri ücretli sonraki adıma çevir.',
    subtitle: 'Küçük işletmeler, creatorlar ve solo çalışanlar için demo-öncelikli satış masası. Önce ücretsiz kanıt örneği, sonra güven, sonra net ücretli teşhis.',
    primaryCta: 'Ücretsiz demo örneği iste',
    secondaryCta: 'Ücretli teklifleri gör',
    demoTitle: 'Önce Ücretsiz Demo',
    demoText: 'Müşteri ödeme yapmadan önce küçük ama faydalı bir örnek görür: bir kaçak, bir kaçan sinyal, bir pratik sonraki adım. Direnci düşürür, satışa ayağını alıştırır.',
    ladderTitle: 'Güven merdiveni',
    classifierTitle: 'Lead sınıflandırıcı',
    followupTitle: 'Takip mesajı üretici',
    pipelineTitle: 'Pipeline',
    noGuarantee: 'Gelir garantisi yoktur. Hizmet pratik teşhis, satış sayfası düzeltmesi ve otomasyon haritası sunar.',
  },
  de: {
    badge: 'Private Sales Command Desk',
    title: 'Verpasste Signale in bezahlte nächste Schritte verwandeln.',
    subtitle: 'Ein Demo-first Sales Desk für kleine Unternehmen, Creator und Solo-Operatoren. Erst ein kostenloser Proof-Sample, dann Vertrauen, dann ein klares bezahltes Diagnostic.',
    primaryCta: 'Kostenloses Demo-Sample anfragen',
    secondaryCta: 'Angebote ansehen',
    demoTitle: 'Zuerst kostenlose Demo',
    demoText: 'Der Kunde sieht vor der Zahlung eine kleine nützliche Probe: ein Leck, ein verpasstes Signal, ein praktischer nächster Schritt. Das senkt Widerstand und baut Vertrauen auf.',
    ladderTitle: 'Vertrauensleiter',
    classifierTitle: 'Lead-Klassifizierung',
    followupTitle: 'Follow-up Generator',
    pipelineTitle: 'Pipeline',
    noGuarantee: 'Keine Umsatzgarantie. Der Service liefert praktische Diagnose, Sales-Page-Fixes und Automationskarten.',
  },
};

const offers = [
  { name: 'Free Demo Sample', price: '0 EUR', text: 'One tiny signal leak and one practical next action. Built to warm up trust before the sale.', link: '#demo' },
  { name: 'First Signal Check', price: '19 EUR', text: 'Small diagnostic for one missed lead, reply path, or payment signal.', link: paymentLinks.firstSignalCheck },
  { name: 'Signal Audit', price: '49 EUR', text: 'Broader review of inquiry, booking, affiliate, or follow-up flow.', link: paymentLinks.signalAudit },
  { name: 'Revenue Sprint', price: '149 EUR', text: 'A focused sprint for simple offer, lead capture, and payment-ready sales flow.', link: paymentLinks.revenueSprint },
  { name: 'Command Diagnostic', price: '490 EUR', text: 'A scoped command-center map for offer route, payment path, automation map, and priorities.', link: paymentLinks.commandCenter },
];

const warmupSteps = [
  ['1', 'Free proof', 'Show one useful insight before asking for money.'],
  ['2', 'Tiny paid step', 'Offer the 19 EUR First Signal Check when the buyer sees value.'],
  ['3', 'Deeper trust', 'Move serious leads to 49 EUR or 149 EUR only after clear interest.'],
  ['4', 'Command work', 'Reserve 490 EUR for serious scoped diagnostics, not vague promises.'],
];

const initialLeads = [
  { id: 1, name: 'PLAUD AI', route: 'Affiliate', stage: 'P0 Warm', score: 12, next: 'Submit Impact application and capture tracking link.' },
  { id: 2, name: 'Demo Distribution', route: 'Trust', stage: 'P0 Build', score: 10, next: 'Share free proof sample before paid offer.' },
];

function classifyLead(text) {
  const value = text.toLowerCase();
  if (value.includes('price') || value.includes('payment') || value.includes('invoice') || value.includes('buy')) {
    return { stage: 'P0 Warm', offer: 'First Signal Check', score: 10 };
  }
  if (value.includes('demo') || value.includes('sample') || value.includes('proof')) {
    return { stage: 'P0 Demo', offer: 'Free Demo Sample', score: 9 };
  }
  if (value.includes('interested') || value.includes('help') || value.includes('partner') || value.includes('audit')) {
    return { stage: 'P1 Watch', offer: 'Signal Audit', score: 6 };
  }
  return { stage: 'P2 Queue', offer: 'Free Demo Sample', score: 2 };
}

function buildFollowUp(lead, offerName) {
  if (!lead.trim()) return 'Add a lead note first.';
  const selected = offers.find((item) => item.name === offerName) || offers[0];
  if (selected.name === 'Free Demo Sample') {
    return 'Hi, I can start with a free mini sample: one missed signal, one leak, and one practical next step. If it is useful, the paid First Signal Check is 19 EUR after that. No pressure and no revenue guarantee.';
  }
  return `Hi, thanks for the context. The safest next step is ${selected.name}. I will review the signal path, identify the first leak, and return a concise next-action note. No guaranteed revenue claims and no broad implementation unless scoped separately. Payment link: ${selected.link}`;
}

export default function App() {
  const [lang, setLang] = useState('en');
  const [leadText, setLeadText] = useState('A small business wants to see proof before paying for a sales audit.');
  const [selectedOffer, setSelectedOffer] = useState('Free Demo Sample');
  const t = copy[lang];
  const result = useMemo(() => classifyLead(leadText), [leadText]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <section className="max-w-7xl mx-auto space-y-8">
        <header className="rounded-3xl bg-slate-900 border border-slate-800 p-8 md:p-10 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-widest text-cyan-300">{t.badge}</p>
              <h1 className="text-4xl md:text-7xl font-black mt-4 tracking-tight">{t.title}</h1>
              <p className="text-slate-300 mt-5 max-w-3xl text-lg leading-8">{t.subtitle}</p>
              <div className="flex flex-wrap gap-3 mt-7">
                <a href="#demo" className="rounded-2xl bg-cyan-300 text-slate-950 px-5 py-3 font-bold">{t.primaryCta}</a>
                <a href="#offers" className="rounded-2xl border border-slate-700 px-5 py-3 font-bold">{t.secondaryCta}</a>
              </div>
            </div>
            <div className="flex gap-2 rounded-2xl bg-slate-950 border border-slate-800 p-2">
              {['en', 'de', 'tr'].map((item) => (
                <button key={item} onClick={() => setLang(item)} className={`rounded-xl px-4 py-2 text-sm font-bold ${lang === item ? 'bg-cyan-300 text-slate-950' : 'text-slate-300'}`}>{item.toUpperCase()}</button>
              ))}
            </div>
          </div>
        </header>

        <section id="demo" className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-1 rounded-3xl bg-slate-900 border border-slate-800 p-6">
            <h2 className="text-3xl font-bold">{t.demoTitle}</h2>
            <p className="text-slate-300 mt-4 leading-7">{t.demoText}</p>
            <p className="text-slate-500 text-sm mt-5">{t.noGuarantee}</p>
          </div>
          <div className="lg:col-span-2 grid md:grid-cols-4 gap-4">
            {warmupSteps.map(([num, title, text]) => (
              <article key={num} className="rounded-3xl bg-slate-900 border border-slate-800 p-5">
                <p className="h-10 w-10 rounded-2xl bg-cyan-300 text-slate-950 grid place-items-center font-black">{num}</p>
                <h3 className="text-xl font-bold mt-4">{title}</h3>
                <p className="text-slate-400 mt-3 text-sm leading-6">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="offers" className="grid md:grid-cols-5 gap-4">
          {offers.map((offer) => (
            <article key={offer.name} className="rounded-3xl bg-slate-900 border border-slate-800 p-5">
              <p className="text-cyan-300 font-black text-2xl">{offer.price}</p>
              <h3 className="text-lg font-bold mt-3">{offer.name}</h3>
              <p className="text-slate-300 mt-3 text-sm leading-6">{offer.text}</p>
              <a className="inline-block mt-5 rounded-xl bg-cyan-300 text-slate-950 px-4 py-2 font-bold" href={offer.link} target={offer.link === '#demo' ? '_self' : '_blank'} rel="noreferrer">{offer.price === '0 EUR' ? 'Start demo' : 'Pay / Start'}</a>
            </article>
          ))}
        </section>

        <section className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-3xl bg-slate-900 border border-slate-800 p-6">
            <h2 className="text-2xl font-semibold">{t.classifierTitle}</h2>
            <textarea className="mt-4 w-full h-36 rounded-2xl bg-slate-950 border border-slate-700 p-4 text-slate-100" value={leadText} onChange={(e) => setLeadText(e.target.value)} />
            <div className="grid md:grid-cols-3 gap-3 mt-4">
              <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800"><p className="text-slate-400 text-sm">Stage</p><p className="font-semibold mt-1">{result.stage}</p></div>
              <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800"><p className="text-slate-400 text-sm">Score</p><p className="font-semibold mt-1">{result.score}</p></div>
              <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800"><p className="text-slate-400 text-sm">Route</p><p className="font-semibold mt-1">{result.offer}</p></div>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6">
            <h2 className="text-2xl font-semibold">{t.followupTitle}</h2>
            <select className="mt-4 w-full rounded-xl bg-slate-950 border border-slate-700 p-3" value={selectedOffer} onChange={(e) => setSelectedOffer(e.target.value)}>
              {offers.map((offer) => <option key={offer.name}>{offer.name}</option>)}
            </select>
            <p className="mt-4 text-sm text-slate-300 leading-6">{buildFollowUp(leadText, selectedOffer)}</p>
          </div>
        </section>

        <section className="rounded-3xl bg-slate-900 border border-slate-800 p-6">
          <h2 className="text-2xl font-semibold">{t.pipelineTitle}</h2>
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            {initialLeads.map((lead) => (
              <div key={lead.id} className="rounded-2xl bg-slate-950 border border-slate-800 p-5">
                <div className="flex items-center justify-between gap-3"><h3 className="text-lg font-bold">{lead.name}</h3><span className="text-xs rounded-full bg-cyan-300 text-slate-950 px-3 py-1">{lead.stage}</span></div>
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
