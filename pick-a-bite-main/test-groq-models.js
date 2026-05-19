require('dotenv').config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.error('❌ Hata: .env dosyasında GROQ_API_KEY tanımlanmadı!');
  process.exit(1);
}

async function listGroqModels() {
  try {
    console.log("📋 Groq mevcut modellerini yüklüyorum...\n");
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      }
    });
    
    const data = await res.json();
    
    if (data.data) {
      console.log("✅ Mevcut Groq Modelleri:\n");
      data.data.forEach(m => {
        console.log(`• ${m.id}`);
      });
    } else {
      console.log("❌ Model listesi alınamadı:");
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (e) {
    console.error("Hata:", e.message);
  }
}

listGroqModels();
