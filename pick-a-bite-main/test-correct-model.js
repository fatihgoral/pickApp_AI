require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('❌ Hata: .env dosyasında GEMINI_API_KEY tanımlanmadı!');
  process.exit(1);
}

async function testWithCorrectModel() {
  const system = "Sen Pick A Bite uygulamasının akıllı restoran asistanısın. Türkçe cevap ver.";
  
  const body = JSON.stringify({
    system_instruction: { parts: [{ text: system }] },
    contents: [{ role: "user", parts: [{ text: "200 TL altı sütlü tatlı önerileri" }] }],
    generationConfig: { temperature: 0.6, maxOutputTokens: 300 },
  });

  console.log("🚀 Test: gemini-2.5-flash model ile...\n");
  
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      }
    );

    console.log("📊 Status:", res.status, res.statusText);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.log("❌ Hata:", errorText);
      return;
    }
    
    const data = await res.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (answer) {
      console.log("✅ Başarılı!\n");
      console.log("Cevap:", answer);
    } else {
      console.log("⚠️ Boş cevap");
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (e) {
    console.error("🔌 Hata:", e.message);
  }
}

testWithCorrectModel();
