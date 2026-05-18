const GEMINI_API_KEY = "AIzaSyB0Fr0ebP8BghQFvlWzreCQlq18kGs9DAg";

async function testGeminiAPI() {
  const system = "Sen yardımcı bir AI asistanısın.";
  
  const body = JSON.stringify({
    system_instruction: { parts: [{ text: system }] },
    contents: [{ role: "user", parts: [{ text: "Merhaba" }] }],
    generationConfig: { temperature: 0.6, maxOutputTokens: 100 },
  });

  console.log("📤 İstek gönderiliyor...");
  console.log("API Key:", GEMINI_API_KEY.slice(0, 20) + "...");
  
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      }
    );

    console.log("📊 Status:", res.status, res.statusText);
    const text = await res.text();
    console.log("📄 Response:", text.slice(0, 500));
    
    if (res.ok) {
      const data = JSON.parse(text);
      console.log("✅ Başarılı!");
      console.log("Cevap:", data.candidates?.[0]?.content?.parts?.[0]?.text);
    } else {
      console.log("❌ Hata:", text);
    }
  } catch (e) {
    console.error("🔌 Fetch hatası:", e.message);
  }
}

testGeminiAPI();
