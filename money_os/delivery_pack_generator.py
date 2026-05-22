from pathlib import Path
from datetime import datetime, timezone
import json

root = Path(__file__).resolve().parents[1]
runtime = root / 'money_os' / 'runtime'
out_dir = runtime / 'delivery_packs'
out_dir.mkdir(parents=True, exist_ok=True)

lead_path = runtime / 'latest_intake.json'
lead = json.loads(lead_path.read_text(encoding='utf-8')) if lead_path.exists() else {
    'business': 'DEMO Unternehmen',
    'profile': 'https://example.com',
    'niche': 'Lokaler Dienstleister'
}

business = lead.get('business', 'Unternehmen')
created_at = datetime.now(timezone.utc).isoformat()

pack = f'''# AI Revenue Autopilot Delivery Pack

Status: draft
Created: {created_at}
Client: {business}

## Form fields

- Name
- Email
- Service request
- Preferred date
- Message

## Client reply templates

First reply:
Thank you for your request. We will review the details and reply with the next step.

Follow up:
We wanted to check whether your request is still current.

## CRM columns

- created_at
- name
- email
- service
- status
- next_follow_up
- notes

## 7 day test plan

Day 1: test form
Day 2: test first reply
Day 3: test follow up
Day 4: mark missed inquiries
Day 5: add FAQ
Day 6: improve CTA
Day 7: review support option
'''

safe_name = ''.join(c for c in business if c.isalnum() or c in '-_ ').strip().replace(' ', '_') or 'client'
out_file = out_dir / f'{safe_name}_delivery_pack.md'
out_file.write_text(pack, encoding='utf-8')
print(json.dumps({'status': 'created', 'path': str(out_file)}, ensure_ascii=False))
