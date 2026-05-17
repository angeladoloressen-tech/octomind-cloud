import g4f
import json

def analyze_vibe(user_input):
    """Kullanıcının sıfır-arayüz girişini NLP ile karakter vektörüne çevirir."""
    print(f"[Barmen Dinliyor]: '{user_input}'")
    
    try:
        # Barmen gerçekten g4f üzerinden düşünür ve analiz eder
        prompt = f"Sen lüks bir AI barmensin. Kullanıcı: '{user_input}'. Onun 3 karakter özelliğini ve ona uygun ideal eşleşmeyi JSON formatında ver. Sadece JSON döndür. Örnek format: {{\"user_vector\": [\"A\", \"B\", \"C\"], \"match_archetype\": \"...\", \"red_flags\": [\"X\"]}}"
        response = g4f.ChatCompletion.create(
            model=g4f.models.gpt_4,
            messages=[{"role": "user", "content": prompt}]
        )
        # Markdown JSON bloklarını temizle
        clean_response = str(response).replace("```json", "").replace("```", "").strip()
        return clean_response
    except Exception as e:
        # Ağ hatası olursa acil durum yedek (fallback) profili
        return json.dumps({
            "user_vector": ["Sistemik", "Analitik", "Gizemli"],
            "match_archetype": "Teknoloji Vizyoneri",
            "red_flags": ["Zaman Kaybı", "Odaksızlık"]
        }, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    print("--- Velvet Cakes Konsiyerj Motoru Aktif ---")
    result = analyze_vibe("Tokyo'da yağmurlu bir sokakta tek başıma viski içiyorum.")
    print("Analiz Sonucu:\n", result)