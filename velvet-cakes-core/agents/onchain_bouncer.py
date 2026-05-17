from web3 import Web3
import json

print("🛡️ VELVET CAKES: On-Chain Kapı Koruması (Bouncer) Aktif...\n")

# 1. Blokzincir Ağına Bağlantı (Örn: Ethereum, Polygon veya Arbitrum)
# (Buraya Alchemy veya Infura RPC URL'si gelecek)
RPC_URL = "https://polygon-rpc.com" 
w3 = Web3(Web3.HTTPProvider(RPC_URL))

# 2. Senin Yarattığın Kurucu Üye NFT'sinin Akıllı Kontrat Adresi
NFT_CONTRACT_ADDRESS = "0xSeninNFTKontratAdresinBuraya"

# Minimal ERC-721 ABI (Sadece cüzdanda kaç tane olduğunu sormak için)
ERC721_ABI = json.loads('[{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"type":"function"}]')

def check_velvet_rope(wallet_address):
    """Kullanıcının cüzdanında giriş bileti (NFT) var mı diye kontrol eder."""
    
    # Cüzdan adresinin geçerli olup olmadığını doğrula
    if not w3.is_address(wallet_address):
        return {"status": "REJECTED", "reason": "Geçersiz Cüzdan Adresi"}
        
    checksum_address = w3.to_checksum_address(wallet_address)
    nft_contract = w3.eth.contract(address=w3.to_checksum_address(NFT_CONTRACT_ADDRESS), abi=ERC721_ABI)
    
    try:
        # Blokzincire sor: Bu cüzdanda bizim NFT'mizden var mı?
        balance = nft_contract.functions.balanceOf(checksum_address).call()
        
        if balance > 0:
            print(f"✅ GİRİŞ ONAYLANDI: Cüzdan ({wallet_address[:6]}...{wallet_address[-4:]}) Kurucu Üye NFT'sine sahip.")
            return {"status": "GRANTED", "ptn_balance": check_ptn_balance(checksum_address)}
        else:
            print(f"❌ GİRİŞ REDDEDİLDİ: Cüzdan ({wallet_address[:6]}...{wallet_address[-4:]}) NFT'ye sahip değil.")
            return {"status": "REJECTED", "reason": "Bilet (NFT) Bulunamadı"}
            
    except Exception as e:
        return {"status": "ERROR", "reason": str(e)}

def check_ptn_balance(wallet_address):
    """İçerideki ekstra hizmetler için PTN Token bakiyesini kontrol eder."""
    # PTN Token kontrat sorgusu buraya eklenecek
    return "1500 PTN" # Simülasyon

# --- SİMÜLASYON ---
if __name__ == "__main__":
    if w3.is_connected():
        print("🔗 Ağ Bağlantısı: BAŞARILI")
        
        # Test: Dışarıdan gelen rastgele bir cüzdan
        test_wallet = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
        print(f"\n🚪 Kapıya Birisi Geldi: {test_wallet}")
        
        result = check_velvet_rope(test_wallet)
        
        if result["status"] == "GRANTED":
            print("🍸 AI Barmen devreye giriyor. Lobiye yönlendirildi.")
        else:
            print("🔒 Sistem kilitli. Bekleme listesi ekranı (Framer) gösteriliyor.")
    else:
        print("Ağ bağlantısı koptu.")