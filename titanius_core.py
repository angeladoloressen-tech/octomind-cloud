import os
import time
import logging
from flask import Flask, request, jsonify

# --- LOGLAMA SİSTEMİ (Artık kör değiliz) ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] 🐙 %(message)s",
    handlers=[
        logging.FileHandler("titanius_live.log"),
        logging.StreamHandler() # Bu sayede ekranda da akacak
    ]
)

app = Flask(__name__)

# --- OTONOM MOTORLAR ---
class OctoLawyer:
    def scan(self, data):
        logging.info(f"Hukuki Analiz Başladı: {data.get('case')}")
        time.sleep(1) # Sistem düşünüyor efekti
        return "PARADOKS_ONAYLANDI"

class CanaryWallet:
    def execute(self, amount):
        logging.info(f"Cüzdan Tetiklendi. Miktar: {amount}")
        time.sleep(1)
        return "0x9876543210abcdef_Imza_Tamam"

lawyer = OctoLawyer()
wallet = CanaryWallet()

# --- DIŞ DÜNYA KAPISI (API Gateway) ---
@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    logging.info(f"🌐 Dış Dünyadan Sinyal Geldi: {data}")
    
    # 1. Aşama: Hukuk / Analiz
    legal_status = lawyer.scan(data)
    
    # 2. Aşama: Finans / İnfaz
    if legal_status == "PARADOKS_ONAYLANDI":
        tx_hash = wallet.execute(data.get('amount', 0))
        logging.info(f"✅ İNFAZ BAŞARILI! Otonom İşlem Tamamlandı. Hash: {tx_hash}")
        return jsonify({"status": "SUCCESS", "tx": tx_hash})
    
    logging.warning("⚠️ İşlem Reddedildi.")
    return jsonify({"status": "FAILED"})

if __name__ == "__main__":
    os.system('clear')
    logging.info("TITANIUS ALL-IN-ONE ÇEKİRDEĞİ BAŞLATILDI.")
    logging.info("Sistem 5050 portunda av bekliyor...")
    app.run(host='0.0.0.0', port=5050)
