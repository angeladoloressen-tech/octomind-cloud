from pathlib import Path
from datetime import datetime, timezone
import json

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'money_os' / 'runtime'
OUT.mkdir(parents=True, exist_ok=True)

sample = {
    'business': 'DEMO Unternehmen',
    'profile': 'https://example.com',
    'niche': 'Lokaler Dienstleister',
    'problem': 'Zu wenige qualifizierte Anfragen',
    'email': 'demo@example.com'
}

intake_path = OUT / 'latest_intake.json'
if intake_path.exists():
    data = json.loads(intake_path.read_text(encoding='utf-8'))
else:
    data = sample

business = data.get('business') or 'Unternehmen'
niche = data.get('niche') or 'Lokaler Dienstleister'
profile = data.get('profile') or ''
problem = data.get('problem') or 'Anfragen und Buchungen sind nicht klar messbar.'

report = f'''# Revenue Leak Audit

Erstellt: {datetime.now(timezone.utc).isoformat()}
Unternehmen: {business}
Branche: {niche}
Profil: {profile}

## Ausgangspunkt

Gemeldetes Problem: {problem}

## Drei moegliche Leckstellen

1. **Unklare erste Handlung**  
   Besucher sehen nicht sofort, was sie als naechstes tun sollen.

2. **Zu wenig Anfrage-Struktur**  
   Interessenten koennen Kontakt aufnehmen, aber die Anfrage wird nicht sauber sortiert.

3. **Kein Follow-up-System**  
   Wenn eine Person nicht sofort bucht, geht sie leicht verloren.

## Empfohlener naechster Schritt

Ein einfaches AI Revenue Autopilot Setup kann diese Punkte in eine klare Anfrage- und Follow-up-Struktur bringen.

Setup-Angebot: 499 EUR.  
Monatliche Betreuung optional: 149 EUR pro Monat.

## Status

Dieser Report ist ein Entwurf. Versand oder Angebot an echte Kontakte braucht Freigabe.
'''

out_file = OUT / 'latest_revenue_leak_audit.md'
out_file.write_text(report, encoding='utf-8')
print(json.dumps({'status': 'audit_report_created', 'path': str(out_file)}, ensure_ascii=False))
