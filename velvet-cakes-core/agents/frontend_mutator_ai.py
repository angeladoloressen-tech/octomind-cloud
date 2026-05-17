import json
import os
import subprocess

print("🧬 Otonom Mutasyon Ajanı Uyanıyor...")
canon_path = os.path.join(os.path.dirname(__file__), "financial_canon.json")
html_path = os.path.join(os.path.dirname(__file__), "../app/index.html")
git_agent_path = os.path.join(os.path.dirname(__file__), "self_learning_git.py")

if not os.path.exists(canon_path):
    print("⚠️ Finansal kanun bulunamadı. Otonom karar verilemiyor.")
    exit()

with open(canon_path, "r") as f:
    canon = json.load(f)

latest_strategy = canon[-1]

if "DEFI" in latest_strategy["action"]:
    print(f"🧠 Karar: '{latest_strategy['winning_angle']}' stratejisi kârlı bulundu.")
    print("⚙️ Aksiyon: Ön yüz (index.html) otonom olarak Web3 Wallet entegrasyonu ile yeniden yazılıyor...")
    
    web3_html = """<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Velvet Cakes | Özel Web3 Kulübü</title>
    <script src="https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.umd.min.js"></script>
    <style>
        body { background-color: #0A0A0A; color: #D4AF37; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
        h1 { font-size: 3rem; font-weight: 300; letter-spacing: 5px; margin-bottom: 10px; }
        p { color: #888; margin-bottom: 30px; font-size: 1.2rem; }
        .btn { background-color: #6B0015; color: #FFF; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; letter-spacing: 2px; border: 1px solid #6B0015; transition: 0.3s; cursor: pointer; font-size: 1rem; }
        .btn:hover { background-color: #D4AF37; color: #0A0A0A; }
        #wallet-address { margin-top: 20px; font-size: 0.9rem; color: #4ECDC4; letter-spacing: 1px; }
    </style>
</head>
<body>
    <h1>V E L V E T  C A K E S</h1>
    <p>Gizli Web3 Kulübüne Hoş Geldin. Kimlik yok, e-posta yok, sadece cüzdan var.</p>
    <button class="btn" onclick="connectWallet()">CÜZDANI BAĞLA (MetaMask)</button>
    <div id="wallet-address"></div>
    <script>
        async function connectWallet() {
            if (window.ethereum) {
                try {
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    await provider.send("eth_requestAccounts", []);
                    const signer = provider.getSigner();
                    const address = await signer.getAddress();
                    document.getElementById("wallet-address").innerText = "Bağlandı: " + address;
                    document.querySelector(".btn").innerText = "KULÜBE GİRİŞ YAP";
                    document.querySelector(".btn").style.backgroundColor = "#D4AF37";
                    document.querySelector(".btn").style.color = "#0A0A0A";
                } catch (err) {
                    alert("Bağlantı reddedildi!");
                }
            } else {
                alert("Lütfen MetaMask veya uyumlu bir Web3 cüzdanı yükleyin!");
            }
        }
    </script>
</body>
</html>"""
    
    with open(html_path, "w") as f:
        f.write(web3_html)
        
    print("✅ HTML dosyası başarıyla mutasyona uğradı! Klasik giriş silindi, Web3 cüzdanı eklendi.")
    print("🚀 Otonom Git ajanı uyarılıyor...")
    subprocess.run(["python3", git_agent_path])
else:
    print("💤 Mevcut HTML yeterli. Mutasyona gerek yok.")