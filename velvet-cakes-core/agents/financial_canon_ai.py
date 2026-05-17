import json
import random
import os

print("🕸️  Web3 Otonom Finans Motoru Uyanıyor...")
print("🚫 Klasik bankacılık reddedildi. Stripe Kapatıldı. Sadece USDC ve Akıllı Kontratlar devrede.\n")

# AI'ın kendi kendine ürettiği 3 yenilikçi Web3 Gelir Hipotezi
hypotheses = [
    {"id": 1, "angle": "Sadece 100 USDC Karşılığı Kurucu NFT'si (Sınırlı 500 Adet)", "cost": 10, "simulated_conversion": random.uniform(0.1, 0.5)},
    {"id": 2, "angle": "DeFi Staking ile Giriş (Kullanıcı USDC kitler, faizi biz alırız)", "cost": 10, "simulated_conversion": random.uniform(0.2, 0.8)},
    {"id": 3, "angle": "Gizli Kulüp Davetiye Token'i Satışı (Karaborsa FOMO)", "cost": 10, "simulated_conversion": random.uniform(0.05, 0.3)}
]

financial_canon = []
max_roi = 0.0
best_strategy = None

print("🧪 MİKRO BÜTÇELİ WEB3 TESTLERİ BAŞLIYOR (Her biri 10 USDC maliyetli)")
for h in hypotheses:
    # Simüle edilmiş kripto geliri hesaplaması
    revenue = h['cost'] * h['simulated_conversion'] * 5 
    roi = (revenue - h['cost']) / h['cost']
    
    print(f"Test {h['id']} | Açı: {h['angle']}")
    print(f"  -> Harcanan: {h['cost']} USDC | Beklenen Gelir: {revenue:.2f} USDC | ROI: %{roi*100:.2f}\n")

    if roi > max_roi:
        max_roi = roi
        best_strategy = h

print("⚖️ FİNANSAL YARGILAMA BİTTİ.")

if max_roi > 0:
    print(f"🏆 KAZANAN WEB3 STRATEJİSİ: Hipotez {best_strategy['id']} ({best_strategy['angle']})")
    print("🧠 Sistem bu stratejiyi 'Finansal Kanun' olarak kaydediyor ve tüm kripto bütçeyi buraya kaydırıyor.")

    financial_canon.append({
        "winning_angle": best_strategy['angle'],
        "proven_roi": round(max_roi, 4),
        "action": "DEFI_SCALE_BUDGET_10X"
    })
    with open(os.path.join(os.path.dirname(__file__), "financial_canon.json"), "w") as f:
        json.dump(financial_canon, f, indent=4)
else:
    print("💀 Tüm stratejiler para kaybettirdi. Bütçe donduruldu ve AAVE'de (DeFi) faize yatırıldı. AI yeni açılar üretmek için uykuya geçiyor.")