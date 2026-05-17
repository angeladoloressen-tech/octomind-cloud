import os
import json
import subprocess
from datetime import datetime

print("🐍 THE OUROBOROS: Otonom Merkezi Zeka Uyanıyor...")
print("🧠 Durum Analizi Yapılıyor. Sadece gereken ajanlar tetiklenecek.\n")

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
AGENTS_DIR = os.path.join(BASE_DIR, "agents")

# Finansal kanun dosyasının yerini bul
CANON_PATH = os.path.join(BASE_DIR, "financial_canon.json")
if not os.path.exists(CANON_PATH):
    CANON_PATH = os.path.join(AGENTS_DIR, "financial_canon.json")

def run_agent(script_name):
    print(f"   ▶️ [ÇALIŞTIRILIYOR] {script_name}")
    subprocess.run(["python3", os.path.join(AGENTS_DIR, script_name)])

def check_time_and_market():
    current_hour = datetime.now().hour
    
    # 1. Fiyatlandırma her zaman kontrol edilir (Piyasa Dalgalanması)
    print("\n[Aşama 1] 💸 Piyasa ve Fiyatlandırma Kontrolü")
    run_agent("pricing_ai.py")
    
    # 2. Yeni finansal stratejiye ihtiyaç var mı?
    print("\n[Aşama 2] 📊 Finansal Kanun ve Büyüme Analizi")
    needs_new_strategy = True
    if os.path.exists(CANON_PATH):
        with open(CANON_PATH, "r") as f:
            try:
                canon = json.load(f)
                if canon and canon[-1].get("proven_roi", 0) > 0.1:
                    needs_new_strategy = False # ROI %10'dan büyükse yenisini arama!
            except:
                pass
    
    if needs_new_strategy:
        print("   ⚠️ Kârlı bir strateji bulunamadı veya ROI çok düşük. Yeni açılar test ediliyor!")
        run_agent("growth_hunter.py") # Sadece gerekliyse para yakarak test yapar
    else:
        print("   ✅ Mevcut finansal kanun kârlı. Yeni teste gerek yok. Hazine bütçesi korunuyor.")
        print("\n[Aşama 3] 📣 Sosyal Medya ve Ön Yüz Mutasyonu")
        run_agent("social_media_ai.py")
        run_agent("frontend_mutator_ai.py")

    # 3. Eşleşme Vakti mi? (Saat 20:00 kontrolü)
    if current_hour == 19 or current_hour == 20:
        print("\n[Aşama 4] 🍷 Eşleşme Saati Geldi! AI Barmen ve Eşleşme Motoru Devrede.")
        run_agent("auto_matcher.py")
    else:
        print(f"\n[Aşama 4] 💤 Şu an saat {current_hour}:00. Match Drop (20:00) ritüeline daha var. Sunucu kaynakları korunuyor.")

    print("\n[Aşama 5] 🤖 Öğrenme ve Bulut Yedekleme (Git)")
    run_agent("self_learning_git.py")

if __name__ == "__main__":
    check_time_and_market()
    print("\n🐍 THE OUROBOROS: Döngü Tamamlandı. Sistem Güvenli Bir Şekilde Uykuya Dönüyor.")