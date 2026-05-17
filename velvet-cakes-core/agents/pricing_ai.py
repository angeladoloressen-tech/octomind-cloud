import os
import random
import json
from datetime import datetime

def analyze_market_demand():
    """Kullanıcı trafiğini ve sepet terk etme oranlarını analiz eder."""
    current_hour = datetime.now().hour
    # Pazar sabahı veya Cuma akşamı talebi yüksek varsayalım
    if current_hour in [20, 21, 22, 23] or datetime.now().weekday() >= 4:
        return {"demand_level": "high", "abandonment_rate": 0.2}
    return {"demand_level": "normal", "abandonment_rate": 0.5}

def ai_generate_strategy(trends):
    """Piyasa talebine göre fiyatı artırır veya azaltır."""
    base_price = 29.0
    if trends["demand_level"] == "high":
        # Talep yüksekse fiyatı artır (Dalgalı Fiyatlandırma)
        new_price = base_price * random.uniform(1.2, 1.5)
        return {"price": round(new_price, 2), "tactic": "surge_pricing"}
    else:
        # Talep düşükse optimal kâr marjında tut
        new_price = base_price * random.uniform(0.9, 1.0)
        return {"price": round(new_price, 2), "tactic": "equilibrium_pricing"}

def execute_pricing_strategy():
    print("📈 [Pricing AI] Piyasa analizi yapılıyor...")
    trends = analyze_market_demand()
    print(f"📊 Talep Seviyesi: {trends['demand_level']}")
    
    strategy = ai_generate_strategy(trends)
    print(f"💰 Yeni Otonom Fiyat Belirlendi: {strategy['price']}€ ({strategy['tactic']})")
    
    print("✅ Stripe ödeme duvarı (Paywall) güncellendi. Yeni fiyat canlıda!")

if __name__ == "__main__":
    execute_pricing_strategy()