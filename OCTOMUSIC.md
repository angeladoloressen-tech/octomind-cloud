# 🎵 OctoMusic - Intelligent Music AI Platform

**OctoMusic**, web tarayıcısında çalışan, Türkçe destekli, AI-powered hibrit müzik platformudur. Müzik teorisi öğrenirken, piyano, gitar, davul ve daha fazla enstrümanı çalabilirsiniz.

## ✨ Özellikler

### 🎹 Enstrümanlar
- **Piano**: 2 oktav piyano (C4-C6), gerçek zamanlı ses
- **Gitar**: 6 sıra, 12 fret simülasyonu
- **Davul (Drum Pad)**: 6 davul padu (kick, snare, hihat, tom, clap, cowbell)
- **Sekvenser**: 16-adım grid-tabanlı ritim+melodi editörü

### 🎼 Müzik Teorisi
- **Skalalar**: Major, Minor, Pentatonik, Blues, Dorian, Phrygian, Lydian, Mixolydian
- **Akorlar**: Major, Minor, Diminished, Augmented, 7th akorlar
- **Interaktif Dersler**: Skalalar ve akorları dinle & öğren

### 🎚️ Kontroller
- Tempo kontrolü (60-200 BPM)
- Dinamik grid editor
- Gerçek zamanlı notlar

## 🚀 Başlangıç

### Gereksinimler
- Node.js 18+
- NPM veya Yarn

### Kurulum

```bash
# Depoyu clone et
git clone <repo-url>
cd octomind

# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

Tarayıcınızda açın: `http://localhost:5173/`

## 📁 Proje Yapısı

```
src/
├── components/
│   ├── Piano/           # Piyano komponenti
│   ├── Guitar/          # Gitar komponenti
│   ├── DrumPad/         # Davul padu komponenti
│   ├── Sequencer/       # Ritim sekvenseri
│   └── TheoryLesson/    # Müzik teorisi modülü
├── synth/
│   └── synthEngine.js   # Tone.js sentez motoru
├── theory/
│   └── musicTheory.js   # Müzik teorisi kütüphanesi
└── App.jsx              # Ana uygulama
```

## 🛠️ Teknoloji Stack

- **React 19**: UI framework
- **Vite 8**: Build tool
- **Tone.js 15**: Web Audio API wrapper
- **ES6+**: Modern JavaScript

## 🎯 Gelecek Planlı Özellikler

- [ ] Daha fazla enstrüman (Keman, Trompet, Flüt vb.)
- [ ] MIDI desteği (harici synthesizer bağlantısı)
- [ ] Müzik kayıt & oynatma
- [ ] Eğitim mini-oyunları (nota tanıma, ritim egzersizleri)
- [ ] Efektler (reverb, delay, distortion)
- [ ] Harmonik analiz
- [ ] Loop/düzenleme özellikleri
- [ ] Sesli notalar (transkripsiyon)

## 🎤 Türkçe Destek

OctoMusic tamamen Türkçe arayüze ve dokümantasyona sahiptir.

## 📝 Katkılar

Katkılar hoştur! Lütfen:
1. Fork et
2. Feature branch aç (`git checkout -b feature/AmazingFeature`)
3. Değişiklikleri commit et (`git commit -m 'Add some AmazingFeature'`)
4. Branch'e push et (`git push origin feature/AmazingFeature`)
5. Pull Request aç

## 📄 Lisans

MIT Lisansı altında

## 👨‍💻 Geliştirici

Copilot + Mantzo Aziz

---

**OctoMusic** - Müzik yapımı artık daha akıllı ve eğlenceli! 🎵✨
