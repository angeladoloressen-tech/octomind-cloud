#!/bin/bash

echo "💸 Dinamik Fiyatlandırma Ajanı (Pricing AI) için zamanlayıcı kuruluyor..."

# Her saat başı fiyatlandırmayı optimize et
(crontab -l 2>/dev/null | grep -v "pricing_ai.py"; echo "0 * * * * /usr/bin/env python3 $(pwd)/agents/pricing_ai.py >> $(pwd)/pricing_agent.log 2>&1") | crontab -

chmod +x agents/pricing_ai.py
echo "✅ Pricing AI her saat başı piyasayı analiz edip fiyatları otonom güncelleyecek!"