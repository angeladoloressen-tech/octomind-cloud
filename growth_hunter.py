import json
import random
import time

print("👑 VELVET CAKES: Otonom Pazarlama (Growth AI) Motoru Başlatıldı...")
print("📍 Hedef Bölge: Kuzey Ren-Vestfalya (Münster/Köln) ve Berlin Hattı\n")

hypotheses = [
    {"id": "A", "hook": "Sonsuz kaydırmalara veda et. Şehrin en gizli dijital kulübüne davetlisin.", "angle": "Gizem ve FOMO"},
    {"id": "B", "hook": "Zamanın değerli. Sadece senin frekansındaki 3 kişiyle tanış.", "angle": "Zaman ve Kalite"},
    {"id": "C", "hook": "Algoritmaların seni tüketmesine izin verme. Kaliteyi seç.", "angle": "Anti-Tüketim İsyanı"}
]

budget_per_test = 15.0 
ticket_price = 29.0 
financial_canon = [] 

def simulate_market_response(hypothesis):
    print(f"🧪 Test Ediliyor [Hipotez {hypothesis['id']} - {hypothesis['angle']}]")
    time.sleep(1)
    clicks = random.randint(10, 50)
    conversions = random.randint(0, 3) 
    revenue = conversions * ticket_price
    roi = (revenue - budget_per_test) / budget_per_test
    return {"clicks": clicks, "conversions": conversions, "revenue": revenue, "roi": roi}

best_strategy = None
max_roi = -1.0

for h in hypotheses:
    result = simulate_market_response(h)
    print(f"   📊 Sonuç: {result['conversions']} Satış | Gelir: {result['revenue']}€ | ROI: %{round(result['roi']*100)}")
    if result['roi'] > max_roi:
        max_roi = result['roi']
        best_strategy = h

print("\n⚖️ FİNANSAL YARGILAMA BİTTİ.")

if max_roi > 0:
    print(f"🏆 KAZANAN STRATEJİ: Hipotez {best_strategy['id']} ({best_strategy['angle']})")
    print("🧠 Sistem bu stratejiyi 'Finansal Kanun' olarak belleğine kazıyor ve tüm bütçeyi buraya kaydırıyor.")
    financial_canon.append({
        "winning_angle": best_strategy['angle'],
        "proven_roi": max_roi,
        "action": "SCALE_BUDGET_10X"
    })
    with open("financial_canon.json", "w") as f:
        json.dump(financial_canon, f, indent=4)
else:
    print("💀 Tüm stratejiler para kaybettirdi. Bütçe donduruldu. AI yeni açılar üretmek için uykuya geçiyor.")
