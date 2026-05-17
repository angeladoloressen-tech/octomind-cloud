#!/bin/bash

echo "👑 Velvet Cakes: Otonom GitHub Ajanı Devrede..."

# 1. Git deposu yoksa oluştur
if [ ! -d ".git" ]; then
  echo "📦 Git altyapısı kuruluyor..."
  git init
  git branch -M main
fi

# 2. Değişiklikleri otomatik algıla ve ekle
echo "🔍 Tüm kodlar ve yapay zeka ajanları sahneye alınıyor..."
git add .

# 3. Otomatik Commit
echo "✍️ Otonom imza atılıyor..."
git commit -m "Genesis: Velvet Cakes AI ve n8n Motoru Devrede 👑" || echo "Zaten güncel."

# 4. GitHub'a Bağlantı ve Push
echo "------------------------------------------------"
read -p "🔗 GitHub'da oluşturduğun BOŞ deponun linkini yapıştır (Örn: https://github.com/...): " REPO_LINK

if [ -n "$REPO_LINK" ]; then
  git remote remove origin 2>/dev/null
  git remote add origin "$REPO_LINK"
  echo "🚀 Kodlar GitHub'a ateşleniyor..."
  git push -u origin main
  echo "✅ Otonom Krallık başarıyla GitHub'a yüklendi!"
else
  echo "⚠️ Link girmedin. Sadece yerel kayıt yapıldı."
fi