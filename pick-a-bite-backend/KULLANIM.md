# Pick a Bite API — Kullanım Kılavuzu

Bu belge, backend’i **hiç bilmeyen biri** için yazıldı. Postman ile nasıl istek atacağınızı adım adım anlatır.

> **Geçici durum (şimdilik):** Spring Security, JWT ve kullanıcı uçları (`/auth/...`, `/kullanici/...`) kodda **yorum satırına alındı**; uygulama güvenlik filtresi olmadan çalışır. Şu an **Authorization / Bearer token gerekmez**; sadece restoran ve menü uçlarını kullanın. Güvenliği tekrar açmak için `PickABiteApplication` içindeki `exclude` satırını ve ilgili dosyalardaki `// SONRAYA` yorumlarını geri alın; ayrıntı için [`SecurityConfig.java`](src/main/java/com/aliyilmaz/config/SecurityConfig.java) dosyasındaki üst bilgi notuna bakın.

---

## 1. Bu sistem ne işe yarıyor?

- **Kayıt / giriş (şu an kapalı):** İleride e-posta ve şifre ile hesap ve JWT tekrar etkinleştirilecek.
- **Token (şu an kapalı):** Güvenlik açıldığında girişten sonra sunucu bir **token** verir; korumalı uçlarda kullanılır.
- **Restoran ve menü:** Restoran ekleyebilir, menü (kategori + ürün) ekleyebilir, listeyi veya QR ile menüyü okuyabilirsiniz.

Önemli (güvenlik açıkken): Tarayıcıdaki gibi “kullanıcı adı / şifre kutusu” **yok**. Şifre **JSON gövdesinde** (`/auth/kayit` ve `/auth/giris`) gider; sonra **Bearer Token** kullanılır. Güvenlik kapalıyken bu adımları atlayın.

---

## 2. Başlamadan önce

1. Bilgisayarda **PostgreSQL** çalışıyor olmalı ve `pickabite` adında bir veritabanı olmalı (veya `application.properties` içindeki adres sizin ortamınıza göre düzenlenmiş olmalı).
2. Projeyi çalıştırın:

   ```bash
   cd pick-a-bite
   ./mvnw spring-boot:run
   ```

3. Sunucu adresi varsayılan olarak: **`http://localhost:8080`**

Tüm API yolları **`/pick-a-bite`** ile başlar.  
Yanlış: `http://localhost:8080/restoranlar`  
Doğru: `http://localhost:8080/pick-a-bite/restoranlar`

---

## 3. Postman’i ilk kez kullanıyorsanız

1. **Postman** uygulamasını açın.
2. Sol üstten **New → HTTP Request** (veya **+** ile yeni sekme).
3. Üstte:
   - Soldaki kutu: **GET** veya **POST** (aşağıdaki adımlara göre seçin).
   - Yanındaki uzun kutu: Tam URL (örnek: `http://localhost:8080/pick-a-bite/auth/giris`).

### JSON göndermek (kayıt / giriş için)

1. **Body** sekmesine tıklayın.
2. **raw** seçin.
3. Sağdaki açılır listeden **JSON** seçin.
4. Metin kutusuna örnekteki gibi JSON yazın.

### Token ile istek atmak (giriş yaptıktan sonra)

1. **Authorization** sekmesine tıklayın.
2. **Type** listesinden **Bearer Token** seçin.
3. **Token** kutusuna, giriş cevabında gelen `token` değerini yapıştırın.

**Dikkat:** **Basic Auth** veya **Digest** seçmeyin. Bu API için **Bearer Token** kullanılır.

---

## 4. Her endpoint için örnek istek

Aşağıda **temel adres** olarak `http://localhost:8080` kullanılmıştır. Postman’de **URL** kutusuna aynı adresi yazın; **curl** örneklerini terminalde çalıştırabilirsiniz.

**Şu an güvenlik kapalıysa:** `/auth/*` ve `/kullanici/*` uçları yanıt vermez (404). Aşağıdaki örnekler güvenlik **tekrar açıldığında** geçerlidir; `YOUR_JWT` yerine girişten aldığınız token’ı koyun.

### Kimlik (`/pick-a-bite/auth`)

#### `POST /pick-a-bite/auth/kayit` — Yeni hesap

| Postman | Değer |
|--------|--------|
| Metot | **POST** |
| URL | `http://localhost:8080/pick-a-bite/auth/kayit` |
| Body → raw → JSON | Aşağıdaki gövde |

```bash
curl -s -X POST "http://localhost:8080/pick-a-bite/auth/kayit" \
  -H "Content-Type: application/json" \
  -d '{"email":"benim@mail.com","sifre":"GuvenliSifre123","ad":"Ali","soyad":"Yilmaz"}'
```

```json
{
  "email": "benim@mail.com",
  "sifre": "GuvenliSifre123",
  "ad": "Ali",
  "soyad": "Yilmaz"
}
```

---

#### `POST /pick-a-bite/auth/giris` — Giriş (JWT alır)

| Postman | Değer |
|--------|--------|
| Metot | **POST** |
| URL | `http://localhost:8080/pick-a-bite/auth/giris` |
| Body → raw → JSON | Aşağıdaki gövde |

```bash
curl -s -X POST "http://localhost:8080/pick-a-bite/auth/giris" \
  -H "Content-Type: application/json" \
  -d '{"email":"benim@mail.com","sifre":"GuvenliSifre123"}'
```

```json
{
  "email": "benim@mail.com",
  "sifre": "GuvenliSifre123"
}
```

---

#### `GET /pick-a-bite/auth/ben` — Oturumdaki kullanıcı (JWT gerekir)

| Postman | Değer |
|--------|--------|
| Metot | **GET** |
| URL | `http://localhost:8080/pick-a-bite/auth/ben` |
| Authorization | **Bearer Token** = giriş cevabındaki `token` |

```bash
curl -s "http://localhost:8080/pick-a-bite/auth/ben" \
  -H "Authorization: Bearer YOUR_JWT"
```

---

### Kullanıcı tercihleri (`/pick-a-bite/kullanici`)

#### `GET /pick-a-bite/kullanici/tercihler` — Tercihleri oku (JWT gerekir)

| Postman | Değer |
|--------|--------|
| Metot | **GET** |
| URL | `http://localhost:8080/pick-a-bite/kullanici/tercihler` |
| Authorization | **Bearer Token** |

```bash
curl -s "http://localhost:8080/pick-a-bite/kullanici/tercihler" \
  -H "Authorization: Bearer YOUR_JWT"
```

---

#### `PUT /pick-a-bite/kullanici/tercihler` — Tercihleri güncelle (JWT gerekir)

| Postman | Değer |
|--------|--------|
| Metot | **PUT** |
| URL | `http://localhost:8080/pick-a-bite/kullanici/tercihler` |
| Authorization | **Bearer Token** |
| Body → raw → JSON | Aşağıdaki gövde |

```bash
curl -s -X PUT "http://localhost:8080/pick-a-bite/kullanici/tercihler" \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"butce":250,"vegan":false,"vejetaryen":false,"glutensiz":true,"helal":false,"laktozsuz":false,"alerjenler":["fistik","sut"]}'
```

```json
{
  "butce": 250,
  "vegan": false,
  "vejetaryen": false,
  "glutensiz": true,
  "helal": false,
  "laktozsuz": false,
  "alerjenler": ["fıstık", "süt"]
}
```

---

### Restoranlar (`/pick-a-bite/restoranlar`)

#### `GET /pick-a-bite/restoranlar` — Tüm restoranlar

| Postman | Değer |
|--------|--------|
| Metot | **GET** |
| URL | `http://localhost:8080/pick-a-bite/restoranlar` |

```bash
curl -s "http://localhost:8080/pick-a-bite/restoranlar"
```

---

#### `GET /pick-a-bite/restoranlar/{id}` — Tek restoran

`1` yerine gerçek `id` yazın.

| Postman | Değer |
|--------|--------|
| Metot | **GET** |
| URL | `http://localhost:8080/pick-a-bite/restoranlar/1` |

```bash
curl -s "http://localhost:8080/pick-a-bite/restoranlar/1"
```

---

#### `POST /pick-a-bite/restoranlar` — Restoran oluştur

| Postman | Değer |
|--------|--------|
| Metot | **POST** |
| URL | `http://localhost:8080/pick-a-bite/restoranlar` |
| Body → raw → JSON | Aşağıdaki gövde |

```bash
curl -s -X POST "http://localhost:8080/pick-a-bite/restoranlar" \
  -H "Content-Type: application/json" \
  -d '{"restoranAdi":"Ornek Lokanta","enlem":41.015137,"boylam":28.97953,"adres":"Istanbul","aciklama":"Deneme"}'
```

```json
{
  "restoranAdi": "Örnek Lokanta",
  "enlem": 41.015137,
  "boylam": 28.97953,
  "adres": "İstanbul",
  "aciklama": "Deneme restoranı"
}
```

---

#### `PUT /pick-a-bite/restoranlar/{id}` — Restoran güncelle

| Postman | Değer |
|--------|--------|
| Metot | **PUT** |
| URL | `http://localhost:8080/pick-a-bite/restoranlar/1` |
| Body → raw → JSON | Aşağıdaki gövde |

```bash
curl -s -X PUT "http://localhost:8080/pick-a-bite/restoranlar/1" \
  -H "Content-Type: application/json" \
  -d '{"restoranAdi":"Guncel Isim","enlem":41.02,"boylam":28.98,"adres":"Kadikoy","aciklama":"Guncellendi"}'
```

```json
{
  "restoranAdi": "Güncel İsim",
  "enlem": 41.02,
  "boylam": 28.98,
  "adres": "Kadıköy",
  "aciklama": "Güncellendi"
}
```

---

#### `DELETE /pick-a-bite/restoranlar/{id}` — Restoran sil

| Postman | Değer |
|--------|--------|
| Metot | **DELETE** |
| URL | `http://localhost:8080/pick-a-bite/restoranlar/1` |

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X DELETE "http://localhost:8080/pick-a-bite/restoranlar/1"
```

Cevap gövdesi boş olabilir; HTTP durumu **204** beklenir.

---

#### `GET /pick-a-bite/restoranlar/yakin` — Konuma göre yakın restoranlar

Sorgu parametreleri: `enlem`, `boylam`, isteğe bağlı `yaricapKm` (yoksa varsayılan 5 km).

| Postman | Değer |
|--------|--------|
| Metot | **GET** |
| URL | `http://localhost:8080/pick-a-bite/restoranlar/yakin?enlem=41.015&boylam=28.98&yaricapKm=5` |

```bash
curl -s "http://localhost:8080/pick-a-bite/restoranlar/yakin?enlem=41.015&boylam=28.98&yaricapKm=5"
```

---

#### `GET /pick-a-bite/restoranlar/qr/{qrKod}` — QR kod ile menü

`QR_KOD` yerine restoran oluştururken dönen `qrKod` değerini yazın.

| Postman | Değer |
|--------|--------|
| Metot | **GET** |
| URL | `http://localhost:8080/pick-a-bite/restoranlar/qr/QR_KOD` |

```bash
curl -s "http://localhost:8080/pick-a-bite/restoranlar/qr/a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

---

### Menü (`/pick-a-bite/restoranlar/...`, `/kategoriler`, `/urunler`)

#### `GET /pick-a-bite/restoranlar/{restoranId}/menu` — Restoran menüsü (kategoriler + ürünler)

| Postman | Değer |
|--------|--------|
| Metot | **GET** |
| URL | `http://localhost:8080/pick-a-bite/restoranlar/1/menu` |

```bash
curl -s "http://localhost:8080/pick-a-bite/restoranlar/1/menu"
```

---

#### `POST /pick-a-bite/restoranlar/{restoranId}/kategoriler` — Kategori ekle

| Postman | Değer |
|--------|--------|
| Metot | **POST** |
| URL | `http://localhost:8080/pick-a-bite/restoranlar/1/kategoriler` |
| Body → raw → JSON | Aşağıdaki gövde |

```bash
curl -s -X POST "http://localhost:8080/pick-a-bite/restoranlar/1/kategoriler" \
  -H "Content-Type: application/json" \
  -d '{"kategoriAdi":"Ana Yemekler","siraNo":1}'
```

```json
{
  "kategoriAdi": "Ana Yemekler",
  "siraNo": 1
}
```

---

#### `PUT /pick-a-bite/kategoriler/{kategoriId}` — Kategori güncelle

| Postman | Değer |
|--------|--------|
| Metot | **PUT** |
| URL | `http://localhost:8080/pick-a-bite/kategoriler/10` |
| Body → raw → JSON | Aşağıdaki gövde |

```bash
curl -s -X PUT "http://localhost:8080/pick-a-bite/kategoriler/10" \
  -H "Content-Type: application/json" \
  -d '{"kategoriAdi":"Izgaralar","siraNo":2}'
```

```json
{
  "kategoriAdi": "Izgaralar",
  "siraNo": 2
}
```

---

#### `DELETE /pick-a-bite/kategoriler/{kategoriId}` — Kategori sil

| Postman | Değer |
|--------|--------|
| Metot | **DELETE** |
| URL | `http://localhost:8080/pick-a-bite/kategoriler/10` |

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X DELETE "http://localhost:8080/pick-a-bite/kategoriler/10"
```

---

#### `POST /pick-a-bite/kategoriler/{kategoriId}/urunler` — Ürün ekle

| Postman | Değer |
|--------|--------|
| Metot | **POST** |
| URL | `http://localhost:8080/pick-a-bite/kategoriler/10/urunler` |
| Body → raw → JSON | Aşağıdaki gövde |

```bash
curl -s -X POST "http://localhost:8080/pick-a-bite/kategoriler/10/urunler" \
  -H "Content-Type: application/json" \
  -d '{"urunAdi":"Izgara Tavuk","aciklama":"Pilav ile","fiyat":180.00,"tahminiKalori":420,"alerjenler":[],"mevcut":true}'
```

```json
{
  "urunAdi": "Izgara Tavuk",
  "aciklama": "Pilav ile",
  "fiyat": 180.00,
  "tahminiKalori": 420,
  "alerjenler": [],
  "mevcut": true
}
```

---

#### `PUT /pick-a-bite/urunler/{urunId}` — Ürün güncelle

| Postman | Değer |
|--------|--------|
| Metot | **PUT** |
| URL | `http://localhost:8080/pick-a-bite/urunler/50` |
| Body → raw → JSON | Aşağıdaki gövde |

```bash
curl -s -X PUT "http://localhost:8080/pick-a-bite/urunler/50" \
  -H "Content-Type: application/json" \
  -d '{"urunAdi":"Izgara Tavuk Buyuk","aciklama":"Cifte pilav","fiyat":220.00,"tahminiKalori":550,"alerjenler":[],"mevcut":true}'
```

```json
{
  "urunAdi": "Izgara Tavuk Büyük",
  "aciklama": "Çifte pilav",
  "fiyat": 220.00,
  "tahminiKalori": 550,
  "alerjenler": [],
  "mevcut": true
}
```

---

#### `DELETE /pick-a-bite/urunler/{urunId}` — Ürün sil

| Postman | Değer |
|--------|--------|
| Metot | **DELETE** |
| URL | `http://localhost:8080/pick-a-bite/urunler/50` |

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X DELETE "http://localhost:8080/pick-a-bite/urunler/50"
```

---

## 5. İlk kullanım sırası (önerilen)

Aşağıdaki sırayı takip edin. Her adımda URL ve metot tam yazılı.

### Adım A — Kayıt (hesap oluştur)

| Alan | Değer |
|------|--------|
| Metot | **POST** |
| URL | `http://localhost:8080/pick-a-bite/auth/kayit` |
| Body → raw → JSON | Aşağıdaki gibi |

```json
{
  "email": "benim@mail.com",
  "sifre": "GuvenliSifre123",
  "ad": "Ali",
  "soyad": "Yılmaz"
}
```

**Send**’e basın. Cevapta `token` ve `kullanici` bilgileri gelir. `token` değerini kopyalayın.

---

### Adım B — Giriş (zaten hesabınız varsa)

| Alan | Değer |
|------|--------|
| Metot | **POST** |
| URL | `http://localhost:8080/pick-a-bite/auth/giris` |
| Body → raw → JSON | |

```json
{
  "email": "benim@mail.com",
  "sifre": "GuvenliSifre123"
}
```

Cevaptaki **`token`** alanını kopyalayın.

---

### Adım C — “Ben kimim?” (token doğru mu test)

| Alan | Değer |
|------|--------|
| Metot | **GET** |
| URL | `http://localhost:8080/pick-a-bite/auth/ben` |
| Authorization | **Bearer Token** → token’ı yapıştır |

**Send**. Cevapta kendi e-posta ve profil bilgileriniz gelmeli.

Token yoksa veya yanlışsa **401** ve JSON hata mesajı alırsınız (bu normaldir).

---

### Adım D — Beslenme tercihleri (bütçe, vegan, alerjen vb.)

**Önce token’ı Bearer olarak ekleyin** (Authorization sekmesi).

**Tercihleri oku**

| Metot | **GET** |
| URL | `http://localhost:8080/pick-a-bite/kullanici/tercihler` |

**Tercihleri güncelle**

| Metot | **PUT** |
| URL | `http://localhost:8080/pick-a-bite/kullanici/tercihler` |
| Body → raw → JSON | |

```json
{
  "butce": 250,
  "vegan": false,
  "vejetaryen": false,
  "glutensiz": true,
  "helal": false,
  "laktozsuz": false,
  "alerjenler": ["fıstık", "süt"]
}
```

---

### Adım E — Restoran ekle (token gerekmez — MVP’de açık)

| Metot | **POST** |
| URL | `http://localhost:8080/pick-a-bite/restoranlar` |
| Body → raw → JSON | |

```json
{
  "restoranAdi": "Örnek Lokanta",
  "enlem": 41.015137,
  "boylam": 28.97953,
  "adres": "İstanbul",
  "aciklama": "Deneme restoranı"
}
```

Cevapta **`id`** ve **`qrKod`** not edin. `qrKod` masadaki QR ile aynı mantıkta kullanılır.

---

### Adım F — Menüye kategori ekle

`RESTORAN_ID` yerine bir önceki adımda gelen `id` yazın.

| Metot | **POST** |
| URL | `http://localhost:8080/pick-a-bite/restoranlar/RESTORAN_ID/kategoriler` |
| Body → raw → JSON | |

```json
{
  "kategoriAdi": "Ana Yemekler",
  "siraNo": 1
}
```

Cevaptaki **`id`** = kategori id’si.

---

### Adım G — Kategoriye ürün ekle

`KATEGORI_ID` yerine kategori `id` yazın.

| Metot | **POST** |
| URL | `http://localhost:8080/pick-a-bite/kategoriler/KATEGORI_ID/urunler` |
| Body → raw → JSON | |

```json
{
  "urunAdi": "Izgara Tavuk",
  "aciklama": "Pilav ile",
  "fiyat": 180.00,
  "tahminiKalori": 420,
  "alerjenler": [],
  "mevcut": true
}
```

---

### Adım H — Menüyü listele (token gerekmez)

`RESTORAN_ID` ile:

| Metot | **GET** |
| URL | `http://localhost:8080/pick-a-bite/restoranlar/RESTORAN_ID/menu` |

---

### Adım I — QR ile menü (token gerekmez)

`QR_KOD` yerine restoran oluştururken gelen `qrKod` değerini yazın.

| Metot | **GET** |
| URL | `http://localhost:8080/pick-a-bite/restoranlar/qr/QR_KOD` |

---

### Adım J — Yakındaki restoranlar (token gerekmez)

| Metot | **GET** |
| URL | `http://localhost:8080/pick-a-bite/restoranlar/yakin?enlem=41.015&boylam=28.98&yaricapKm=5` |

`yaricapKm` yazmazsanız sunucu varsayılan olarak 5 km kullanır.

---

## 6. Kimlik doğrulama özeti

| İstek türü | Authorization (Postman) |
|------------|---------------------------|
| `/auth/kayit`, `/auth/giris` | Gerekmez |
| `/restoranlar...` GET, menü GET, QR GET, yakın GET | Gerekmez |
| Restoran/kategori/ürün ekleme-silme (POST/PUT/DELETE) | MVP’de gerekmez |
| `/auth/ben`, `/kullanici/...` | **Bearer Token** şart |

---

## 7. Hata cevabı nasıl okunur?

Sunucu hata verdiğinde genelde JSON gelir:

```json
{
  "hataKodu": 404,
  "mesaj": "Açıklayıcı Türkçe mesaj",
  "yol": "/pick-a-bite/...",
  "zaman": "...",
  "alanHatalari": null
}
```

Doğrulama hatalarında `alanHatalari` dolu olabilir.

---

## 8. Sık sorunlar

**“401 alıyorum”**  
- `/auth/ben` veya `/kullanici/...` için **Bearer Token** eklediniz mi?  
- Token süresi dolduysa tekrar **giriş** yapıp yeni token alın.

**“Kullanıcı adı / şifre penceresi açılıyor”**  
- Postman’de **Basic Auth kullanmayın**. Sadece **Bearer Token** veya (kayıt/giriş için) Body’de JSON şifre.

**“Hiçbir şey çalışmıyor”**  
- URL’de **`/pick-a-bite`** ön eki var mı kontrol edin.  
- Uygulama çalışıyor mu (`spring-boot:run`)?  
- PostgreSQL ayarları `application.properties` ile uyumlu mu?

---

## 9. İngilizce teknik özet

Daha fazla teknik detay ve `curl` örnekleri için projedeki [README.md](README.md) dosyasına bakabilirsiniz.

---

Sorularınız olursa hangi **URL**, hangi **metot (GET/POST)** ve **Authorization** sekmesinde ne seçtiğinizi yazmanız yeterli; buna göre net yönlendirme yapılabilir.
