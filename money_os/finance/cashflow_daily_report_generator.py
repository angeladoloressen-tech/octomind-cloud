from pathlib import Path
from datetime import datetime, timezone
import json

root = Path(__file__).resolve().parents[2]
out_dir = root / 'money_os' / 'runtime' / 'finance'
out_dir.mkdir(parents=True, exist_ok=True)

state = {
    'created_at': datetime.now(timezone.utc).isoformat(),
    'confirmed_revenue_eur': 0,
    'pending_revenue_eur': 0,
    'active_subscriptions_known': 0,
    'setup_offer_eur': 499,
    'monthly_support_eur': 149,
    'payment_links_ready': True,
    'public_lead_capture_ready': False,
    'storage_ready': False,
    'traffic_ready': False,
    'main_bottleneck': 'no approved public lead capture and no active traffic channel',
    'next_best_action': 'connect storage and approve public audit page launch gate'
}

report = f'''# Daily Cashflow Cockpit

Created: {state['created_at']}

## Revenue

Confirmed revenue: {state['confirmed_revenue_eur']} EUR
Pending revenue: {state['pending_revenue_eur']} EUR
Known active subscriptions: {state['active_subscriptions_known']}

## Offers

Setup offer: {state['setup_offer_eur']} EUR
Monthly support: {state['monthly_support_eur']} EUR

## Readiness

Payment links ready: {state['payment_links_ready']}
Public lead capture ready: {state['public_lead_capture_ready']}
Storage ready: {state['storage_ready']}
Traffic ready: {state['traffic_ready']}

## Bottleneck

{state['main_bottleneck']}

## Next best action

{state['next_best_action']}
'''

(out_dir / 'cashflow_state.json').write_text(json.dumps(state, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
(out_dir / 'daily_cashflow_report.md').write_text(report, encoding='utf-8')
print(json.dumps({'status': 'cashflow_report_created', 'path': str(out_dir)}, ensure_ascii=False))
