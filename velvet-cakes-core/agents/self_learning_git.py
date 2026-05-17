import subprocess

def auto_commit_and_push():
    """Sistem kendi kodunu veya tasarımını değiştirdiğinde otomatik olarak GitHub'a gönderir."""
    print("🤖 Otonom Git Ajanı uyanıyor...")
    
    # Değişiklikleri kontrol et
    status = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True)
    
    if status.stdout.strip():
        print("🔍 Sistemde kendi kendine yapılan kod değişiklikleri algılandı.")
        print("Otonom olarak kaydediliyor...")
        subprocess.run(["git", "add", "."])
        subprocess.run(["git", "commit", "-m", "🤖 AI Ajanı: Sistem kendi kendini güncelledi ve iyileştirdi."])
        subprocess.run(["git", "push", "origin", "main"])
        print("✅ Kendi kendime öğrendim ve kodlarımı buluta kopyaladım!")
    else:
        print("💤 Her şey güncel. Yeni bir mutasyon yok, beklemedeyim.")

if __name__ == "__main__":
    auto_commit_and_push()