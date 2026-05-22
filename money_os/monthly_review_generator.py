from pathlib import Path
from datetime import datetime, timezone
import json

root = Path(__file__).resolve().parents[1]
out_dir = root / 'money_os' / 'runtime' / 'retention'
out_dir.mkdir(parents=True, exist_ok=True)

review = {
    'status': 'draft',
    'created_at': datetime.now(timezone.utc).isoformat(),
    'metrics': [
        'new inquiries',
        'answered inquiries',
        'missed inquiries',
        'follow ups prepared',
        'setup improvements'
    ],
    'next_actions': [
        'review CTA',
        'review form fields',
        'review first response',
        'review follow up timing'
    ],
    'note': 'No revenue guarantee. Operational review only.'
}

out_file = out_dir / 'monthly_review.json'
out_file.write_text(json.dumps(review, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
print(json.dumps({'status': 'created', 'path': str(out_file)}, ensure_ascii=False))
