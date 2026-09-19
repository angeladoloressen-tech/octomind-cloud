function ownAddressSet(addresses = []) {
  return new Set(addresses.map((x) => String(x).trim().toLowerCase()).filter(Boolean));
}

function extractAddress(value = '') {
  const text = String(value).toLowerCase();
  const match = text.match(/<([^>]+)>/);
  return (match ? match[1] : text).trim();
}

function hasLabel(message, label) {
  return Array.isArray(message.labels) && message.labels.includes(label);
}

export function adaptGmail(messages = [], { ownAddresses = [] } = {}) {
  const own = ownAddressSet(ownAddresses);
  const events = [];
  const diagnostics = [];

  for (const message of messages) {
    const from = extractAddress(message.from_ ?? message.from ?? '');
    const subject = String(message.subject ?? '');
    const outgoing = own.has(from) || hasLabel(message, 'SENT') || hasLabel(message, 'DRAFT');

    if (outgoing) {
      if (/pitch/i.test(subject) && hasLabel(message, 'SENT')) {
        events.push({ source: 'gmail', type: 'outbound_pitch', count: 1, activity: true });
      }
      continue;
    }

    // Any inbound message is a real human-response signal, but the adapter does
    // not guess acceptance, payment, or editorial intent from private email text.
    events.push({ source: 'gmail', type: 'reply', count: 1, needsHumanReview: true });
  }

  diagnostics.push({
    source: 'gmail',
    status: 'ok',
    messagesSeen: messages.length,
    privacy: 'No message body, sender address, or subject is emitted by this adapter.',
  });

  return { events, diagnostics };
}
