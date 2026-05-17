import math
import time

import pandas as pd
import requests


def haversine_km(lat1, lon1, lat2, lon2):
    """İki koordinat arasındaki yüzey mesafesini km cinsinden döndürür."""
    R = 6371.0  # Dünya yarıçapı (km)
    try:
        lat1_f = float(lat1)
        lon1_f = float(lon1)
        lat2_f = float(lat2)
        lon2_f = float(lon2)
    except (TypeError, ValueError):
        return None

    phi1 = math.radians(lat1_f)
    phi2 = math.radians(lat2_f)
    dphi = math.radians(lat2_f - lat1_f)
    dlambda = math.radians(lon2_f - lon1_f)

    a = math.sin(dphi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2.0) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def restoran_verilerini_cek(api_key, sorgu_listesi, enlem, boylam, yaricap_km):
    url = "https://places.googleapis.com/v1/places:searchText"

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.websiteUri,places.location",
    }

    # Google Places API yarıçap üst sınırı 50.000 metredir.
    if yaricap_km > 50:
        print(f"Uyarı: yarıçap {yaricap_km} km istendi, API üst sınırı 50 km. 50 km'ye sabitlendi.")
        yaricap_km = 50
    if yaricap_km <= 0:
        raise ValueError("yaricap_km pozitif bir sayı olmalıdır.")

    yaricap_metre = float(yaricap_km) * 1000.0

    tum_restoranlar = []
    gorulen_idler = set()

    for sorgu in sorgu_listesi:
        print(f"'{sorgu}' için veriler çekiliyor...")
        # Not: places:searchText endpoint'i locationRestriction altinda yalnizca
        # rectangle kabul eder; circle sadece locationBias ile destekleniyor.
        # Bu yuzden bias ile yonlendirip yariçap dısı sonuçları kod tarafında eliyoruz.
        payload = {
            "textQuery": sorgu,
            "languageCode": "tr",
            "maxResultCount": 20,
            "locationBias": {
                "circle": {
                    "center": {"latitude": float(enlem), "longitude": float(boylam)},
                    "radius": yaricap_metre,
                }
            },
        }

        response = requests.post(url, headers=headers, json=payload)

        if response.status_code == 200:
            veri = response.json()
            mekanlar = veri.get("places", [])

            for mekan in mekanlar:
                place_id = mekan.get("id")
                if place_id and place_id in gorulen_idler:
                    continue
                if place_id:
                    gorulen_idler.add(place_id)

                ad = mekan.get("displayName", {}).get("text", "Bilinmiyor")
                adres = mekan.get("formattedAddress", "Adres Bulunamadı")
                web_sitesi = mekan.get("websiteUri", "Web Sitesi Yok")
                m_enlem = mekan.get("location", {}).get("latitude", "")
                m_boylam = mekan.get("location", {}).get("longitude", "")

                mesafe_km = haversine_km(enlem, boylam, m_enlem, m_boylam)

                # locationBias kati bir sinir koymadigi icin yariçap disindakileri burada eliyoruz.
                if mesafe_km is not None and mesafe_km > yaricap_km:
                    continue

                mesafe_yuvarlak = round(mesafe_km, 3) if mesafe_km is not None else None

                tum_restoranlar.append(
                    {
                        "Sorgu": sorgu,
                        "Restoran Adı": ad,
                        "Adres": adres,
                        "Enlem": m_enlem,
                        "Boylam": m_boylam,
                        "Mesafe (km)": mesafe_yuvarlak,
                        "Web Sitesi": web_sitesi,
                    }
                )
        else:
            print(f"'{sorgu}' için hata oluştu: {response.status_code}")
            print(response.text)

        # API sınırlarına takılmamak için her istekten sonra 1 saniye bekle
        time.sleep(1)

    return tum_restoranlar


# --- KULLANIM ---

# 1. API Anahtarını buraya gir
API_KEY = "AIzaSyCvKMIwordFQ90Fznv3Tohh3QdGceoVSns"

# 2. Konum ve yarıçap (km) — istediğin gibi değiştir
ENLEM = 40.2367      # örnek: Bursa merkez
BOYLAM = 28.9978
YARICAP_KM = 5       # maksimum 50

# 3. Aramak istediğin sorguları belirle (kategori + mahalle/sokak isimleri ile zenginleştirilebilir)
SORGU_LISTESI = [
    "restoran",
    "lokanta",
    "kebap",
    "döner",
    "köfte",
    "pizza",
    "cafe",
    "fast food",
]

# 4. Fonksiyonu çalıştır ve verileri çek
veriler = restoran_verilerini_cek(API_KEY, SORGU_LISTESI, ENLEM, BOYLAM, YARICAP_KM)

# 5. Verileri DataFrame'e dönüştür
df = pd.DataFrame(veriler)

# Yakından uzağa sırala (Mesafe sütunu varsa)
if not df.empty and "Mesafe (km)" in df.columns:
    df = df.sort_values("Mesafe (km)", na_position="last").reset_index(drop=True)

# --- SONUÇLARI GÖRÜNTÜLEME VE KAYDETME ---

print(
    f"\nİşlem Tamamlandı! Merkez: ({ENLEM}, {BOYLAM}) | Yarıçap: {YARICAP_KM} km | "
    f"Toplam tekrarsız restoran: {len(df)}\n"
)

print(df.to_string())

df.to_csv("bursa_restoranlar.csv", index=False, encoding="utf-8-sig")
print("\nVeriler başarıyla 'bursa_restoranlar.csv' dosyasına kaydedildi!")
