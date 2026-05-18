const GEMINI_API_KEY = "AIzaSyB0Fr0ebP8BghQFvlWzreCQlq18kGs9DAg";

async function listAvailableModels() {
  try {
    console.log("📋 Kullanılabilir modelleri yüklüyorum...\n");
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`
    );
    
    const data = await res.json();
    
    if (data.models) {
      console.log("✅ Mevcut Modeller:\n");
      data.models.forEach(m => {
        const methods = m.supportedGenerationMethods?.join(", ") || "bilinmiyor";
        console.log(`• ${m.name}`);
        console.log(`  Desteklenen yöntemler: ${methods}\n`);
      });
    } else {
      console.log("❌ Model listesi alınamadı:");
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (e) {
    console.error("Hata:", e.message);
  }
}

listAvailableModels();
