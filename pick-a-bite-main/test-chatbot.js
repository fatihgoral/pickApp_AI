require('dotenv').config();

// Chatbot backend bağlantısını test et
const BACKEND_URL = process.env.BACKEND_URL || "http://10.70.105.75:8080/pick-a-bite";

async function testBackend() {
  try {
    console.log("Backend'e bağlanılıyor:", BACKEND_URL + "/restoranlar");
    const res = await fetch(BACKEND_URL + "/restoranlar", { timeout: 5000 });
    
    if (!res.ok) {
      console.error("Backend hatası:", res.status, res.statusText);
      return;
    }
    
    const data = await res.json();
    console.log("✅ Backend başarıyla cevap verdi!");
    console.log("Restoran sayısı:", Array.isArray(data) ? data.length : "Bilinmiyor");
    
    if (Array.isArray(data) && data.length > 0) {
      const first = data[0];
      console.log("\nİlk restoran:");
      console.log("  Ad:", first.ad);
      console.log("  Adres:", first.adres);
      console.log("  Menu kategorileri:", first.menuKategorileri?.length || 0);
      
      if (first.menuKategorileri && first.menuKategorileri.length > 0) {
        const firstCat = first.menuKategorileri[0];
        console.log("\n  İlk kategori:", firstCat.kategoriAdi);
        console.log("  Ürünler:", firstCat.urunler?.length || 0);
        
        if (firstCat.urunler && firstCat.urunler.length > 0) {
          const firstItem = firstCat.urunler[0];
          console.log("    İlk ürün:", firstItem.urunAdi);
          console.log("    Fiyat:", firstItem.fiyat);
        }
      }
    }
  } catch (error) {
    console.error("❌ Bağlantı hatası:", error.message);
  }
}

testBackend();
