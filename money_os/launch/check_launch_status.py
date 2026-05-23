from pathlib import Path
import json

root = Path(__file__).resolve().parents[2]
flags_path = root / 'money_os' / 'launch' / 'approval_flags.json'
flags = json.loads(flags_path.read_text(encoding='utf-8'))

required = [
    'APPROVED_IMPRESSUM',
    'APPROVED_PRIVACY',
    'APPROVED_CONTACT_EMAIL',
    'APPROVED_STORAGE_BACKEND',
    'APPROVED_DEPLOY_TARGET',
    'APPROVED_TRAFFIC_CHANNEL'
]

missing = [key for key in required if not flags.get(key)]
status = {
    'launch_allowed': len(missing) == 0,
    'missing': missing,
    'public_launch_allowed': flags.get('PUBLIC_LAUNCH_ALLOWED', False),
    'real_lead_collection_allowed': flags.get('REAL_LEAD_COLLECTION_ALLOWED', False),
    'outbound_messages_allowed': flags.get('OUTBOUND_MESSAGES_ALLOWED', False),
    'money_movement_allowed': flags.get('MONEY_MOVEMENT_ALLOWED', False)
}

out = root / 'money_os' / 'runtime' / 'launch_status.json'
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(status, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')

if missing:
    print('launch blocked:', ', '.join(missing))
else:
    print('launch ready')
