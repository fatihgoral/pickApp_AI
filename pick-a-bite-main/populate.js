const data = [
  {
    restoranAdi: "Tatlıcı Safa",
    enlem: 40.1856,
    boylam: 29.0670,
    adres: "Bursa Merkez",
    aciklama: "Meşhur sütlü ve şerbetli tatlılar",
    kategoriler: [
      {
        kategoriAdi: "Sütlü Tatlılar",
        siraNo: 1,
        urunler: [
          { urunAdi: "Fırın Sütlaç", aciklama: "Fırınlanmış geleneksel sütlaç", fiyat: 80.00, tahminiKalori: 250 },
          { urunAdi: "Kazandibi", aciklama: "Karamelize edilmiş muhallebi", fiyat: 90.00, tahminiKalori: 280 },
          { urunAdi: "Supangle", aciklama: "Çikolatalı ve kek parçacıklı", fiyat: 95.00, tahminiKalori: 310 },
          { urunAdi: "Trileçe", aciklama: "Karamelli trileçe", fiyat: 110.00, tahminiKalori: 350 }
        ]
      },
      {
        kategoriAdi: "Şerbetli Tatlılar",
        siraNo: 2,
        urunler: [
          { urunAdi: "Baklava", aciklama: "Antep fıstıklı klasik baklava", fiyat: 150.00, tahminiKalori: 450 },
          { urunAdi: "Künefe", aciklama: "Sıcak ve peynirli şerbetli tatlı", fiyat: 120.00, tahminiKalori: 500 }
        ]
      }
    ]
  },
  {
    restoranAdi: "Lezzet Durağı",
    enlem: 40.1920,
    boylam: 29.0730,
    adres: "Fatih Mahallesi",
    aciklama: "Ev yemekleri ve leziz ızgaralar",
    kategoriler: [
      {
        kategoriAdi: "Ana Yemekler",
        siraNo: 1,
        urunler: [
          { urunAdi: "Izgara Tavuk", aciklama: "Tavuk göğsü, pilav ve salata eşliğinde", fiyat: 140.00, tahminiKalori: 380 },
          { urunAdi: "Vegan Kase", aciklama: "Kinoa, avokado, nohut ve taze yeşillikler", fiyat: 130.00, tahminiKalori: 290 }
        ]
      },
      {
        kategoriAdi: "Tatlılar",
        siraNo: 2,
        urunler: [
          { urunAdi: "Dondurma", aciklama: "3 top karışık Maraş dondurması", fiyat: 75.00, tahminiKalori: 180 },
          { urunAdi: "Meyve Tabağı", aciklama: "Mevsim meyveleri", fiyat: 60.00, tahminiKalori: 120 }
        ]
      }
    ]
  },
  {
    restoranAdi: "Yeşil Ev",
    enlem: 40.1810,
    boylam: 29.0590,
    adres: "Nilüfer",
    aciklama: "Sağlıklı ve organik seçenekler",
    kategoriler: [
      {
        kategoriAdi: "Sütlü Tatlılar",
        siraNo: 1,
        urunler: [
          { urunAdi: "Sakızlı Muhallebi", aciklama: "Damla sakızlı geleneksel muhallebi", fiyat: 75.00, tahminiKalori: 210 },
          { urunAdi: "Keşkül", aciklama: "Bademli sütlü tatlı", fiyat: 85.00, tahminiKalori: 240 }
        ]
      },
      {
        kategoriAdi: "Sağlıklı Seçenekler",
        siraNo: 2,
        urunler: [
          { urunAdi: "Glutensiz Brownie", aciklama: "Glutensiz un ve bitter çikolata ile", fiyat: 95.00, tahminiKalori: 260 },
          { urunAdi: "Vegan Puding", aciklama: "Hindistan cevizi sütü ve chia tohumlu", fiyat: 80.00, tahminiKalori: 190 }
        ]
      }
    ]
  },
  {
    restoranAdi: "Lezzet Kebapçısı",
    enlem: 40.1870,
    boylam: 29.0640,
    adres: "Altıparmak",
    aciklama: "Otantik Türk kebapları ve mezeleri",
    kategoriler: [
      {
        kategoriAdi: "Kebaplar",
        siraNo: 1,
        urunler: [
          { urunAdi: "Adana Kebap", aciklama: "Zırh kıyması, lavaş ve közlenmiş biber ile", fiyat: 240.00, tahminiKalori: 550 },
          { urunAdi: "Urfa Kebap", aciklama: "Acısız zırh kıyması, lavaş ve mezeler ile", fiyat: 230.00, tahminiKalori: 520 },
          { urunAdi: "İskender Kebap", aciklama: "Bursa döneri, pide, tereyağı ve yoğurt ile", fiyat: 290.00, tahminiKalori: 720 },
          { urunAdi: "Tavuk Şiş", aciklama: "Marine edilmiş tavuk but, pilav eşliğinde", fiyat: 200.00, tahminiKalori: 450 }
        ]
      },
      {
        kategoriAdi: "İçecekler",
        siraNo: 2,
        urunler: [
          { urunAdi: "Ayran", aciklama: "Bol köpüklü yayık ayranı", fiyat: 30.00, tahminiKalori: 80 },
          { urunAdi: "Şalgam Suyu", aciklama: "Acılı veya acısız organik şalgam", fiyat: 35.00, tahminiKalori: 15 }
        ]
      }
    ]
  }
];

async function run() {
  for (const rest of data) {
    console.log(`Ekleme başlıyor: ${rest.restoranAdi}...`);
    // Create restaurant
    const restRes = await fetch("http://localhost:8080/pick-a-bite/restoranlar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        restoranAdi: rest.restoranAdi,
        enlem: rest.enlem,
        boylam: rest.boylam,
        adres: rest.adres,
        aciklama: rest.aciklama
      })
    });
    if (!restRes.ok) {
      console.error(`Restoran eklenemedi: ${rest.restoranAdi}`, await restRes.text());
      continue;
    }
    const createdRest = await restRes.json();
    console.log(`Restoran eklendi (ID: ${createdRest.id})`);

    // Create categories
    for (const cat of rest.kategoriler) {
      const catRes = await fetch(`http://localhost:8080/pick-a-bite/restoranlar/${createdRest.id}/kategoriler`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kategoriAdi: cat.kategoriAdi,
          siraNo: cat.siraNo
        })
      });
      if (!catRes.ok) {
        console.error(`Kategori eklenemedi: ${cat.kategoriAdi}`, await catRes.text());
        continue;
      }
      const createdCat = await catRes.json();
      console.log(`  Kategori eklendi: ${createdCat.kategoriAdi} (ID: ${createdCat.id})`);

      // Create products
      for (const urun of cat.urunler) {
        const urunRes = await fetch(`http://localhost:8080/pick-a-bite/kategoriler/${createdCat.id}/urunler`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            urunAdi: urun.urunAdi,
            aciklama: urun.aciklama,
            fiyat: urun.fiyat,
            tahminiKalori: urun.tahminiKalori,
            alerjenler: [],
            mevcut: true
          })
        });
        if (!urunRes.ok) {
          console.error(`    Ürün eklenemedi: ${urun.urunAdi}`, await urunRes.text());
          continue;
        }
        const createdUrun = await urunRes.json();
        console.log(`    Ürün eklendi: ${createdUrun.urunAdi} (ID: ${createdUrun.id})`);
      }
    }
  }
  console.log("Tüm veriler başarıyla veritabanına aktarıldı!");
}

run();
