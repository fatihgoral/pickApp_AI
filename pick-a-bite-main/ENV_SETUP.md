# 🔐 Environment Variables Setup

## Sorun Çözüldü! ✅

API keyleri artık güvende! Kodun GitHub'a yüklenebilir:

- `.env` dosyası `.gitignore`'a eklendi (secret file olarak)
- `.env.example` oluşturuldu (template olarak, push edilecek)
- Tüm key'ler environment variables kullanılacak

## Kurulum Adımları

### 1. Bağımlılıkları Kur
```bash
npm install
```

### 2. `.env` Dosyasını Doldur
`.env` dosyasını aç ve API keylerinizi ekle:

```bash
# .env dosyası içeriği
GEMINI_API_KEY=your_gemini_key_here
GROQ_API_KEY=your_groq_key_here
BACKEND_URL=http://10.70.105.75:8080/pick-a-bite
```

### 3. Keyleri Nereden Alacaksın?

#### Gemini API Key:
1. https://console.cloud.google.com adresine git
2. Yeni bir proje oluştur
3. Generative Language API'yi aktifleştir
4. API anahtarı oluştur (API Keys > Create Credential > API Key)
5. Keyi kopyala ve `.env`'ye yapıştır

#### Groq API Key:
1. https://console.groq.com adresine git
2. Giriş yap / Kaydol
3. API Keys kısmına git
4. Yeni key oluştur
5. Keyi kopyala ve `.env`'ye yapıştır

## Test Et

```bash
# Groq API test et
node test-groq.js

# Gemini API test et
node test-gemini-api.js

# Backend test et
node test-chatbot.js
```

## Güvenlik Kontrol Listesi ✓

- ✅ `.env` dosyası `.gitignore`'a eklendi
- ✅ Tüm API keyleri environment variables kullanıyor
- ✅ `.env.example` template dosyası oluşturuldu
- ✅ `dotenv` paketi kuruldu
- ✅ Tüm test dosyaları güncellendi

## İleri Bilgi

### `.env` vs `.env.example`

**`.env`** (GIT'E PUSH ETME ❌)
- Gerçek keyleri içerir
- Sadece local'de
- `.gitignore`'a eklendi

**`.env.example`** (GIT'E PUSH ET ✅)
- Keyin ne olması gerektiğini gösterir
- Yapı şablonu (empty values)
- Diğer geliştiriciler clone alınca bunu kopyalayıp `.env` yaparlar

### Silinmesi Gereken Eski Keyleri

Bu keyleri hemen silindir / iptal et (GitHub'a push ettim uyarısı için):
- `AIzaSyBgEQRGAQLkqckg8b6BCJvBOWGTxDGQEdo` (test-api.js'de bulundu)
- `AIzaSyB0Fr0ebP8BghQFvlWzreCQlq18kGs9DAg` (test-list-models.js ve test-correct-model.js'de)

Bu keyleri Google Cloud Console'dan sil ya da regenerate et!

---

Sorular varsa sor! 🎯
