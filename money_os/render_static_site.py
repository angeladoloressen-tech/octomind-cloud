from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
source = ROOT / 'money_os' / 'audit_page.html'
out_dir = ROOT / 'money_os' / 'site'
out_dir.mkdir(parents=True, exist_ok=True)
html = source.read_text(encoding='utf-8')
(out_dir / 'index.html').write_text(html, encoding='utf-8')
print('rendered money_os/site/index.html')
