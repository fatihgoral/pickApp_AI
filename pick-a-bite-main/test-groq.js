require('dotenv').config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.error('❌ Hata: .env dosyasında GROQ_API_KEY tanımlanmadı!');
  process.exit(1);
}

async function testGroqAPI() {
  const messages = [
    { role: "system", content: "Sen Pick A Bite uygulamasının akıllı restoran asistanısın. Türkçe cevap ver." },
    { role: "user", content: "200 TL altı sütlü tatlı önerileri" }
  ];

  console.log("🚀 Test: Groq API ile...\n");
  
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0.6,
        max_tokens: 400,
      }),
    });

    console.log("📊 Status:", res.status, res.statusText);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.log("❌ Hata:", errorText);
      return;
    }
    
    const data = await res.json();
    const answer = data.choices?.[0]?.message?.content;
    
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

testGroqAPI();
