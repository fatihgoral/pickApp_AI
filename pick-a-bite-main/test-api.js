const GEMINI_API_KEY = "AIzaSyBgEQRGAQLkqckg8b6BCJvBOWGTxDGQEdo";

async function test() {
  try {
    const res = await globalThis.fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`
    );
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}
test();
