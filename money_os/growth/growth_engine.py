from pathlib import Path
from datetime import datetime, timezone
import json

ROOT = Path(__file__).resolve().parents[2]
GROWTH = ROOT / 'money_os' / 'growth'
RUNTIME = ROOT / 'money_os' / 'runtime' / 'growth'
RUNTIME.mkdir(parents=True, exist_ok=True)

backlog_path = GROWTH / 'experiment_backlog.json'
if not backlog_path.exists():
    raise SystemExit('Missing experiment_backlog.json')

backlog = json.loads(backlog_path.read_text(encoding='utf-8'))
experiments = backlog.get('experiments', [])

priority_words = {
    'traffic': 5,
    'lead': 5,
    'trust': 4,
    'conversion': 4,
    'payment': 4,
    'headline': 3,
    'retention': 3,
    'delivery': 3,
}

def score(exp):
    text = ' '.join(str(exp.get(k, '')) for k in ['id', 'bottleneck', 'hypothesis', 'metric', 'target']).lower()
    base = 1
    for word, points in priority_words.items():
        if word in text:
            base += points
    if exp.get('decision') == 'needs_approval':
        base += 2
    if exp.get('decision') == 'needs_data':
        base += 1
    return base

ranked = sorted(experiments, key=score, reverse=True)
selected = ranked[0] if ranked else None

state = {
    'created_at': datetime.now(timezone.utc).isoformat(),
    'mode': 'safe_growth_dry_run',
    'selected_experiment': selected,
    'ranked': [{'id': exp.get('id'), 'score': score(exp), 'decision': exp.get('decision')} for exp in ranked],
    'safety': {
        'public_launch': False,
        'outbound_messages': False,
        'money_movement': False
    }
}

out = RUNTIME / 'growth_state.json'
out.write_text(json.dumps(state, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
print(json.dumps({'status': 'growth_state_created', 'path': str(out), 'selected': selected.get('id') if selected else None}, ensure_ascii=False))
