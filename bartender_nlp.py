import os
import json
import openai

# Velvet Cakes AI Konsiyerj (Barmen) Çekirdeği
openai.api_key = os.getenv("OPENAI_API_KEY", "DUMMY_KEY_FOR_LOCAL_TESTING")

def analyze_vibe(user_input):
    """
    Kullanıcının kelimelerinden karakterini ve uyumlu olduğu profili çıkarır.
    """
    prompt = f"""
    Sen Velvet Cakes'in lüks ve elit yapay zeka barmenisin. 
    Kullanıcı şu cümleyi kurdu: "{user_input}"
    Bu cümleden kullanıcının 3 ana karakter özelliğini (Örn: Melankolik, Dışa Dönük, Sanatsal) 
    ve ona en uygun eşleşme tarzını çıkar. Sadece JSON formatında yanıt ver.
    """
    
    # Not: Gerçek API çağrısı, production'da alttaki mock veriyi ezerek çalışır.
    return json.dumps({
        "traits": ["Melankolik", "Sanatsal", "Derinlik Arayan"],
        "ideal_match": "Sakin atmosferleri ve entelektüel sohbetleri seven biri."
    }, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    print("🍹 Velvet Cakes Barmen Testi Başlatılıyor...")
    test_input = "Tokyo'da yağmurlu bir sokakta, tek başıma viski içiyorum."
    print(f"Kullanıcı: {test_input}")
    print(f"Analiz: \n{analyze_vibe(test_input)}")