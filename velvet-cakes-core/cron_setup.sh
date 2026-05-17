#!/bin/bash

echo "🤖 Otonom Git Ajanı için zamanlayıcı (Cron) kuruluyor..."

# Mevcut cron görevlerini al ve yenisini ekle (Her gece 00:00)
(crontab -l 2>/dev/null | grep -v "self_learning_git.py"; echo "0 0 * * * /usr/bin/env python3 $(pwd)/agents/self_learning_git.py >> $(pwd)/git_agent.log 2>&1") | crontab -

chmod +x agents/self_learning_git.py
echo "✅ Ajan her gece yarısı 00:00'da kodları kontrol edip kendi kendine GitHub'a yükleyecek!"