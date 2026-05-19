import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── TİP TANIMLARI ───────────────────────────
type Role = "user" | "assistant";
interface Message { id: string; role: Role; text: string; timestamp: Date; }

// ─── YAPILANDIRMA ─────────────────────────────
// API Key .env.local dosyasından gelir — GitHub'a YÜKLENMEz
const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY ?? "";

const BACKEND_URL = "http://10.70.105.75:8080/pick-a-bite";

// ─── YARDIMCI: ZAMAN AŞIMLI FETCH ────────────
const fetchWithTimeout = async (url: string, options: any = {}, timeout = 4000): Promise<Response> => {
  return Promise.race([
    fetch(url, options),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), timeout)
    ),
  ]);
};

const PREF_LABELS: Record<string, string> = {
  vegan: "Vegan", vegetarian: "Vejetaryen", gluten_free: "Glutensiz",
  lactose_intolerant: "Laktoz intoleransı", peanut_allergy: "Fıstık alerjisi",
  halal: "Helal", low_calorie: "Düşük kalori", high_protein: "Yüksek protein",
};

const QUICK_QUERIES = [
  "200 TL altı sütlü tatlı", "100 TL altı hamburger",
  "Kalorisiz salata önerileri", "300 TL altında ne var?",
  "Vegan seçenekler neler?", "Glutensiz yemekler",
];

// ─── YARDIMCI: QR URL'DEN RESTORAN ADI ───────
const extractName = (qr: string): string => {
  try {
    const url = new URL(qr);
    const p = url.pathname.split("/").filter(Boolean);
    const raw = p[p.length - 1] || url.hostname;
    return raw.replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  } catch { return qr.trim(); }
};

// ─── QR URL'DEN MENÜ ÇEK (script.js parse) ───
const fetchMenuFromQrUrl = async (qrUrl: string): Promise<string> => {
  // 1) Önce script.js dene
  try {
    const base = qrUrl.endsWith("/") ? qrUrl : qrUrl + "/";
    const jsUrl = base + "script.js";
    console.log("[QR] script.js deneniyor:", jsUrl);
    const res = await fetchWithTimeout(jsUrl, {}, 8000);
    if (!res.ok) throw new Error(`script.js ${res.status}`);
    const js = await res.text();
    console.log("[QR] script.js alındı, boyut:", js.length);

    // Hem tek satır hem çok satır array'i yakala
    const match = js.match(/(?:const|let|var)\s+categories\s*=\s*(\[[\s\S]*?\]\s*;)/);
    if (!match) throw new Error("categories değişkeni bulunamadı");

    // eslint-disable-next-line no-eval
    const cats: any[] = eval(match[1]);
    console.log("[QR] Kategori sayısı:", cats.length);
    const result = cats.map(cat => {
      const items = (cat.items || [])
        .map((i: any) => `  - ${i.name || i.urunAdi || ""}: ${i.price ?? i.fiyat ?? "?"} TL${i.tag ? " [" + i.tag + "]" : ""} — ${i.desc || i.aciklama || ""}`)
        .join("\n");
      return `${cat.title || cat.kategoriAdi || "Kategori"}:\n${items}`;
    }).join("\n\n");
    console.log("[QR] Menü metni oluşturuldu, karakter:", result.length);
    return result;
  } catch (e: any) {
    console.warn("[QR] script.js başarısız:", e.message, "→ HTML fallback deneniyor");
  }

  // 2) Doğrudan URL'yi HTML olarak çek
  try {
    const res = await fetchWithTimeout(qrUrl, {}, 8000);
    if (!res.ok) throw new Error(`URL ${res.status}`);
    const html = await res.text();
    console.log("[QR] HTML alındı, boyut:", html.length);
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 4000);
    console.log("[QR] HTML metni çıkarıldı, karakter:", text.length);
    return `(Sayfa içeriği):\n${text}`;
  } catch (e2: any) {
    console.error("[QR] HTML fallback da başarısız:", e2.message);
    return "";
  }
};

// ─── TİPLER ──────────────────────────────────
interface MenuItem {
  urunAdi: string;
  fiyat: number;
  kategori: string;
  aciklama?: string;
  etiketler?: string[];
}

interface Restaurant {
  ad: string;
  adres: string;
  menuler: MenuItem[];
}

// ─── BACKEND'DEN TÜM RESTORANLARI ÇEK ────────
const fetchAllRestaurantsFromBackend = async (): Promise<Restaurant[]> => {
  try {
    const res = await fetchWithTimeout(`${BACKEND_URL}/restoranlar`, {}, 4000);
    if (!res.ok) throw new Error("Backend response not ok");
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return [];

    return data.map((r: any) => ({
      ad: r.ad || "Bilinmeyen Restoran",
      adres: r.adres || "",
      menuler: Array.isArray(r.menuKategorileri)
        ? r.menuKategorileri.flatMap((k: any) =>
          Array.isArray(k.urunler)
            ? k.urunler.map((u: any) => ({
              urunAdi: u.urunAdi || "",
              fiyat: typeof u.fiyat === "number" ? u.fiyat : 0,
              kategori: k.kategoriAdi || "",
              aciklama: u.aciklama || "",
              etiketler: u.etiketler || [],
            }))
            : []
        )
        : [],
    }));
  } catch (e) {
    console.warn("Backend'e ulaşılamadı:", e);
    return [];
  }
};

// ─── ARAMA FİLTRELEME ────────────────────────
interface SearchCriteria {
  maxPrice?: number;
  categories?: string[];
  keywords?: string[];
  preferences?: string[];
}

const extractSearchCriteria = (query: string): SearchCriteria => {
  const criteria: SearchCriteria = { keywords: [], categories: [], preferences: [] };

  // Fiyat aralığı çıkar: "200 TL altı", "100-300 TL" vs
  const priceMatch = query.match(/(\d+)\s*(?:tl|₺|tlaltı|altı)/gi);
  if (priceMatch) {
    criteria.maxPrice = parseInt(priceMatch[0]);
  }

  // Kategori anahtar kelimeleri
  const categoryKeywords: Record<string, string[]> = {
    tatlı: ["tatlı", "dessert", "pasta", "kek"],
    hamburger: ["hamburger", "burger"],
    salata: ["salata", "salad"],
    çorba: ["çorba", "soup"],
    pilaş: ["pilaş", "pilav"],
    döner: ["döner", "kebab"],
    pizza: ["pizza"],
    köfte: ["köfte", "meatball"],
  };

  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(k => query.toLowerCase().includes(k))) {
      criteria.categories?.push(cat);
    }
  }

  // Diğer anahtar kelimeleri yakala
  const words = query.toLowerCase().split(/\s+/);
  criteria.keywords = words.filter(w => w.length > 3 && !["altı", "tl", "₺", "veya"].includes(w));

  return criteria;
};

const filterRestaurants = (
  restaurants: Restaurant[],
  criteria: SearchCriteria
): MenuItem[] => {
  const results: MenuItem[] = [];

  for (const restaurant of restaurants) {
    for (const item of restaurant.menuler) {
      let matches = true;

      // Fiyat filtresi
      if (criteria.maxPrice && item.fiyat > criteria.maxPrice) {
        matches = false;
      }

      // Kategori filtresi
      if (criteria.categories && criteria.categories.length > 0) {
        const itemCat = item.kategori.toLowerCase();
        const itemName = item.urunAdi.toLowerCase();
        const matched = criteria.categories.some(cat =>
          itemCat.includes(cat) || itemName.includes(cat)
        );
        if (!matched) matches = false;
      }

      // Anahtar kelime filtresi (tüm kelimeler yer almalı)
      if (criteria.keywords && criteria.keywords.length > 0) {
        const itemText = (item.urunAdi + " " + item.kategori).toLowerCase();
        const allMatched = criteria.keywords.every(kw => itemText.includes(kw));
        if (!allMatched) matches = false;
      }

      if (matches) {
        results.push({ ...item, kategori: restaurant.ad });
      }
    }
  }

  return results.sort((a, b) => a.fiyat - b.fiyat).slice(0, 10);
};

// ─── GROQ API (ÇOK TURLU KONUŞMA) ────────────
const askGroq = async (
  history: Message[],
  restaurantName?: string,
  menuContext?: string,
  userPrefs?: string[],
  filteredResults?: MenuItem[]
): Promise<string> => {
  const prefText = userPrefs?.length
    ? userPrefs.map(id => PREF_LABELS[id] || id).join(", ")
    : "Herhangi bir kısıtlama yok";

  // QR menüsü varsa sistem mesajına ekle, yoksa genel mod
  const menuSection = menuContext
    ? `\n\nMENÜ BİLGİSİ (SADECE BU MENÜYE GÖRE CEVAP VER):\n${menuContext}\n\nKESİNLİKLE UYDURMA! Menüde olmayan ürünü önerme.`
    : "";

  const systemPrompt = `Sen Pick A Bite uygulamasının akıllı restoran asistanısın.
Kullanıcı tercihleri: ${prefText}${menuSection}

KURALLAR:
1. Sorguyu analiz et ve kesin önerileri ver
2. Fiyat belirtilmişse o fiyat sınırını aşma
3. Sadece menüde olan ürünleri göster, asla uydurma
4. Ürün varsa adı + fiyatı göster
5. Türkçe, kısa, net cevap ver
6. Ürün yoksa dürüstçe söyle
7. Menü bilgisi verildiyse YALNIZCA o menüdeki ürünleri öner`;

  // Groq API için messages formatı
  let messages: any[] = [{ role: "system", content: systemPrompt }];

  // Konuşma geçmişini ekle
  for (const msg of history) {
    if (msg.id === "welcome") continue;
    messages.push({ role: msg.role === "user" ? "user" : "assistant", content: msg.text });
  }

  // Son kullanıcı mesajına menü bilgisini ekle
  if (messages.length > 1 && messages[messages.length - 1].role === "user") {
    let menuInfo = "";
    if (filteredResults && filteredResults.length > 0) {
      // Backend'den gelen filtrelenmiş sonuçlar
      menuInfo = `\n\n[SİSTEM: ${filteredResults.length} eşleşen ürün bulundu]\n`;
      const grouped: Record<string, MenuItem[]> = {};
      for (const item of filteredResults) {
        if (!grouped[item.kategori]) grouped[item.kategori] = [];
        grouped[item.kategori].push(item);
      }
      for (const [rest, items] of Object.entries(grouped)) {
        menuInfo += `${rest}:\n`;
        menuInfo += items.map(i => `• ${i.urunAdi}: ₺${i.fiyat}`).join("\n") + "\n";
      }
    } else if (menuContext && menuContext.length > 0) {
      // QR modunda: menü zaten system prompt'ta var, sadece hatırlatma ekle
      menuInfo = `\n\n[Lütfen yalnızca yukarıdaki menüdeki ürünleri kullanarak cevap ver.]`;
    }
    messages[messages.length - 1].content += menuInfo;
  }

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

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Groq hata:", res.status, errorText);

      if (res.status === 429) {
        return "⏳ Çok hızlı istek. Biraz bekleyip tekrar deneyin.";
      }
      if (res.status === 401 || res.status === 403) {
        return "🔑 API anahtarı geçersiz. Lütfen .env.local kontrol edin.";
      }
      return `⚠️ API Hata ${res.status}. Biraz sonra tekrar deneyin.`;
    }

    const data = await res.json();
    const answer = data.choices?.[0]?.message?.content;

    if (!answer) {
      console.warn("Groq boş cevap:", JSON.stringify(data));
      return "AI yanıt veremedi. Lütfen tekrar deneyin.";
    }
    return answer;
  } catch (e: any) {
    console.error("Fetch hatası:", e.message);
    return "🔌 Bağlantı hatası. İnternet kontrol edin.";
  }
};

// ─── ANA BİLEŞEN ─────────────────────────────
export default function ChatbotScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { qrData, restaurantId } = useLocalSearchParams<{ qrData?: string; restaurantId?: string }>();
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  const restaurantName = qrData ? extractName(qrData as string) : undefined;

  const [userPrefs, setUserPrefs] = useState<string[]>([]);
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
  const [menuContext, setMenuContext] = useState<string | undefined>(undefined);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showQuick, setShowQuick] = useState(true);
  const [statusText, setStatusText] = useState("Bağlanıyor...");

  const welcomeText = restaurantName
    ? `📱 **${restaurantName}** restoranının menüsü yükleniyor...\n\nMenüyü analiz ediyorum, biraz bekleyin! 🔍`
    : "Merhaba! 👋 Ben Pick a Bite yapay zekâ asistanınım.\n\nEtraftaki restoranları ve menülerini analiz ederek size en uygun önerileri sunabilirim.\n\nNasıl yardımcı olabilirim?";

  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "assistant", text: welcomeText, timestamp: new Date() },
  ]);

  // ── Başlangıçta veri yükleme ──
  useEffect(() => {
    const load = async () => {
      // 1) Profil tercihlerini yükle
      try {
        const saved = await AsyncStorage.getItem("userPreferences");
        if (saved) setUserPrefs(JSON.parse(saved));
      } catch { /* ignore */ }

      // 2) QR Code varsa O menüyü çek, yoksa tüm restoranları çek
      if (qrData) {
        // ✅ QR code'dan restoran menüsü çek
        setStatusText("Menü yükleniyor...");
        const menu = await fetchMenuFromQrUrl(qrData as string);
        setMenuContext(menu);
        setStatusText("✓");
      } else {
        // Tüm restoranları çek
        setStatusText("Restoranlar yükleniyor...");
        const restaurants = await fetchAllRestaurantsFromBackend();

        if (restaurants.length > 0) {
          setAllRestaurants(restaurants);

          // Menü yapısını görüntü için oluştur
          let menuText = "";
          for (const rest of restaurants.slice(0, 5)) {
            menuText += `\n${rest.ad}:\n`;
            const grouped: Record<string, MenuItem[]> = {};
            for (const item of rest.menuler.slice(0, 20)) {
              if (!grouped[item.kategori]) grouped[item.kategori] = [];
              grouped[item.kategori].push(item);
            }
            for (const [cat, items] of Object.entries(grouped)) {
              menuText += `  ${cat}:\n`;
              menuText += items.map(i => `    • ${i.urunAdi}: ₺${i.fiyat}`).join("\n") + "\n";
            }
          }

          setMenuContext(menuText);
          setStatusText("Çevrimiçi ✓");
        } else {
          setStatusText("Veri bulunamadı");
        }
      }

      setIsInitializing(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrData]);

  // ── Mesaj gönder ──
  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading || isInitializing) return;

    setShowQuick(false);
    setInputText("");

    const userMsg: Message = {
      id: `u-${Date.now()}`, role: "user", text: trimmed, timestamp: new Date(),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setIsLoading(true);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    // Sorguyu analiz et ve filtrele
    const criteria = extractSearchCriteria(trimmed);
    const filteredResults = allRestaurants.length > 0
      ? filterRestaurants(allRestaurants, criteria)
      : [];

    askGroq(nextMessages, restaurantName, menuContext, userPrefs, filteredResults)
      .then(aiText => {
        setMessages(m => [...m, { id: `a-${Date.now()}`, role: "assistant", text: aiText, timestamp: new Date() }]);
      })
      .finally(() => {
        setIsLoading(false);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
      });
  }, [messages, isLoading, isInitializing, restaurantName, menuContext, userPrefs, allRestaurants]);

  const renderMsg = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";
    return (
      <View style={[styles.row, isUser ? styles.rowUser : styles.rowAI]}>
        {!isUser && <View style={styles.avatar}><Ionicons name="sparkles" size={14} color="white" /></View>}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
          <Text style={[styles.msgText, isUser ? styles.textUser : styles.textAI]}>{item.text}</Text>
          <Text style={[styles.timeText, isUser && { color: "rgba(255,255,255,0.6)" }]}>
            {item.timestamp.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
          </Text>
        </View>
      </View>
    );
  };

  // Android'de status bar yüksekliği
  const topPad = Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) : insets.top;

  return (
    <View style={[styles.safe, { paddingTop: topPad }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#1a1a1a" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerIcon}><Ionicons name="sparkles" size={16} color="white" /></View>
          <View>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {restaurantName ?? "Yapay Zekâ Asistanı"}
            </Text>
            <View style={styles.statusRow}>
              <View style={[styles.dot, isInitializing && { backgroundColor: "#f6ad55" }]} />
              <Text style={[styles.statusText, isInitializing && { color: "#f6ad55" }]}>{statusText}</Text>
            </View>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* MESAJ + INPUT */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        keyboardVerticalOffset={topPad + 56}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={i => i.id}
          renderItem={renderMsg}
          contentContainerStyle={styles.msgList}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListFooterComponent={<>
            {isLoading && (
              <View style={[styles.row, styles.rowAI]}>
                <View style={styles.avatar}><Ionicons name="sparkles" size={14} color="white" /></View>
                <View style={[styles.bubble, styles.bubbleAI, styles.loadingBubble]}>
                  <ActivityIndicator size="small" color="#319795" />
                  <Text style={styles.loadingText}>Analiz ediliyor...</Text>
                </View>
              </View>
            )}
            {showQuick && !isLoading && (
              <View style={styles.quickWrap}>
                <Text style={styles.quickTitle}>Hızlı sorgular:</Text>
                <View style={styles.quickGrid}>
                  {QUICK_QUERIES.map(q => (
                    <TouchableOpacity key={q} style={styles.quickBtn} onPress={() => sendMessage(q)}>
                      <Text style={styles.quickText}>{q}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </>}
        />

        {/* INPUT — her zaman en altta, navigasyon çubuğunun üstünde */}
        <View style={styles.inputWrap}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Mesajınızı yazın..."
            placeholderTextColor="#aaa"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!isLoading && !isInitializing}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!inputText.trim() || isLoading || isInitializing) && styles.sendDisabled]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isLoading || isInitializing}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── STİLLER ─────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f5f7fa" },
  flex: { flex: 1, overflow: "hidden" },

  header: { backgroundColor: "white", flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#efefef", elevation: 3, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#f5f5f5", justifyContent: "center", alignItems: "center" },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1, marginHorizontal: 8 },
  headerIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#319795", justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 15, fontWeight: "700", color: "#1a1a1a" },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 1 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#38a169" },
  statusText: { fontSize: 11, color: "#38a169", fontWeight: "500" },

  msgList: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  row: { flexDirection: "row", marginBottom: 14, alignItems: "flex-end" },
  rowUser: { justifyContent: "flex-end" },
  rowAI: { justifyContent: "flex-start" },
  avatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#319795", justifyContent: "center", alignItems: "center", marginRight: 8, marginBottom: 2 },
  bubble: { maxWidth: "78%", borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleUser: { backgroundColor: "#319795", borderBottomRightRadius: 4 },
  bubbleAI: { backgroundColor: "white", borderBottomLeftRadius: 4, elevation: 2, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4 },
  msgText: { fontSize: 14, lineHeight: 21 },
  textUser: { color: "white" },
  textAI: { color: "#1a1a1a" },
  timeText: { fontSize: 10, color: "#aaa", marginTop: 4, alignSelf: "flex-end" },

  loadingBubble: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 12 },
  loadingText: { fontSize: 13, color: "#666", fontStyle: "italic" },

  quickWrap: { marginTop: 8, marginBottom: 4 },
  quickTitle: { fontSize: 12, color: "#888", fontWeight: "600", marginBottom: 8, marginLeft: 2 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  quickBtn: { backgroundColor: "white", borderWidth: 1.5, borderColor: "#319795", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  quickText: { fontSize: 12, color: "#319795", fontWeight: "600" },

  inputWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: "#efefef",
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#f5f7fa",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 120,
    minHeight: 44,
    color: "#1a1a1a",
  },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#319795", justifyContent: "center", alignItems: "center" },
  sendDisabled: { backgroundColor: "#c0d8d8" },
});
