import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ─── TİP TANIMLARI ───────────────────────────
type Role = "user" | "assistant";
interface Message { id: string; role: Role; text: string; timestamp: Date; }

// ─── YAPILANDIRMA ─────────────────────────────
const GEMINI_API_KEY = "";

const BACKEND_URL = "http://10.67.16.188:8080/pick-a-bite";

const PREF_LABELS: Record<string, string> = {
  vegan: "Vegan", vegetarian: "Vejetaryen", gluten_free: "Glutensiz",
  lactose_intolerant: "Laktoz intoleransı", peanut_allergy: "Fıstık alerjisi",
  halal: "Helal", low_calorie: "Düşük kalori", high_protein: "Yüksek protein",
};

const QUICK_QUERIES = [
  "100 TL altı sağlıklı öğle yemeği", "Vegan seçenekler neler?",
  "Düşük kalorili akşam yemeği", "Glutensiz öneriler",
  "En popüler yemekler hangileri?", "300 TL altında öner",
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
  try {
    const base = qrUrl.endsWith("/") ? qrUrl : qrUrl + "/";
    const jsUrl = base + "script.js";
    const res = await fetch(jsUrl);
    if (!res.ok) throw new Error("script.js bulunamadı");
    const js = await res.text();

    // "const categories = [...]" bloğunu regex ile çıkar
    const match = js.match(/const\s+categories\s*=\s*(\[[\s\S]*?\]);/);
    if (!match) throw new Error("categories bulunamadı");

    // eslint-disable-next-line no-eval
    const cats: any[] = eval(match[1]);
    return cats.map(cat => {
      const items = cat.items
        .map((i: any) => `  - ${i.name}: ${i.price} TL${i.tag ? " [" + i.tag + "]" : ""} — ${i.desc}`)
        .join("\n");
      return `${cat.title}:\n${items}`;
    }).join("\n\n");
  } catch (e: any) {
    // script.js çalışmazsa düz HTML'den metin çek
    try {
      const res = await fetch(qrUrl);
      const html = await res.text();
      const text = html
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 3000);
      return `(Ham HTML'den çıkarılan metin):\n${text}`;
    } catch {
      return "";
    }
  }
};

// ─── BACKEND'DEN TÜM RESTORANLARI ÇEK ────────
const fetchAllRestaurantsFromBackend = async (): Promise<string> => {
  try {
    const res = await fetch(`${BACKEND_URL}/restoranlar`);
    if (!res.ok) return "";
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return "";
    return data.map((r: any) => {
      const menu = Array.isArray(r.menuKategorileri)
        ? r.menuKategorileri.map((k: any) => {
          const urunler = Array.isArray(k.urunler)
            ? k.urunler.map((u: any) => `    - ${u.urunAdi}: ₺${u.fiyat}`).join("\n")
            : "";
          return `  ${k.kategoriAdi}:\n${urunler}`;
        }).join("\n")
        : "";
      return `Restoran: ${r.ad} (${r.adres || ""})\n${menu}`;
    }).join("\n\n---\n\n");
  } catch { return ""; }
};

// ─── GEMINI API (ÇOK TURLU KONUŞMA) ──────────
const askGemini = async (
  history: Message[],
  restaurantName?: string,
  menuContext?: string,
  userPrefs?: string[]
): Promise<string> => {
  const restName = restaurantName || "seçili restoran";
  const prefText = userPrefs?.length
    ? userPrefs.map(id => PREF_LABELS[id] || id).join(", ")
    : "Herhangi bir kısıtlama yok";

  const menuSection = menuContext
    ? `\n\nRESTORAN MENÜSÜ:\n${menuContext}`
    : "\n\n(Menü bilgisi alınamadı — genel öneri yapabilirsin.)";

  const system = `Sen Pick A Bite uygulamasının akıllı restoran asistanısın.
Kullanıcı şu an "${restName}" restoranını inceliyor.

KULLANICI PROFİLİ:
- Beslenme tercihleri/alerjiler: ${prefText}${menuSection}

KURALLAR:
1. Kullanıcının alerjen/tercihlerine uymayan ürünleri ASLA önerme.
2. Fiyat bilgisi varsa gerçek fiyatları kullan.
3. Kısa, net, emoji destekli ve Markdown formatlı cevap ver.
4. Uygun ürün yoksa dürüstçe söyle, kriteri esnetmeyi öner.
5. Her zaman Türkçe yanıt ver.
6. Alerjen söz konusuysa "restoran ile doğrulama yapın" uyarısı ekle.
7. Önceki konuşmayı hatırla, bağlamı koru.`;

  // Tüm konuşma geçmişini Gemini formatına çevir (karşılama hariç)
  const contents = history
    .filter(m => m.id !== "welcome")
    .map(m => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.text }] }));

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: system }] },
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
        }),
      }
    );
    if (!res.ok) {
      console.error("Gemini hata:", await res.text());
      return "Yapay zeka şu an yanıt veremiyor, lütfen tekrar deneyin. 😔";
    }
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "Yanıt alınamadı.";
  } catch (e) {
    console.error("Fetch hatası:", e);
    return "Bağlantı hatası. İnternet bağlantınızı kontrol edin. 🔌";
  }
};

// ─── ANA BİLEŞEN ─────────────────────────────
export default function ChatbotScreen() {
  const router = useRouter();
  const { qrData, restaurantId } = useLocalSearchParams<{ qrData?: string; restaurantId?: string }>();
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  const restaurantName = qrData ? extractName(qrData as string) : undefined;

  const [userPrefs, setUserPrefs] = useState<string[]>([]);
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

      let menu = "";

      // 2) QR URL varsa → o sitenin menüsünü çek
      if (qrData) {
        setStatusText("Menü çekiliyor...");
        menu = await fetchMenuFromQrUrl(qrData as string);
        if (menu) {
          setMenuContext(menu);
          setStatusText("Menü yüklendi ✓");
        } else {
          setStatusText("Menü alınamadı");
        }
      } else {
        // 3) QR yok → Java backend'den tüm restoranları çek
        setStatusText("Restoranlar yükleniyor...");
        menu = await fetchAllRestaurantsFromBackend();
        if (menu) {
          setMenuContext(menu);
          setStatusText("Çevrimiçi ✓");
        } else {
          setStatusText("Çevrimiçi");
        }
      }

      setIsInitializing(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Mesaj gönder ──
  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setShowQuick(false);
    setInputText("");

    const userMsg: Message = {
      id: `u-${Date.now()}`, role: "user", text: trimmed, timestamp: new Date(),
    };

    setMessages(prev => {
      const next = [...prev, userMsg];
      setIsLoading(true);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

      askGemini(next, restaurantName, menuContext, userPrefs)
        .then(aiText => {
          setMessages(m => [...m, { id: `a-${Date.now()}`, role: "assistant", text: aiText, timestamp: new Date() }]);
        })
        .finally(() => {
          setIsLoading(false);
          setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
        });

      return next;
    });
  }, [isLoading, restaurantName, menuContext, userPrefs]);

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

  return (
    <SafeAreaView style={styles.safe}>
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

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
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

        {/* INPUT */}
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
            editable={!isLoading}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!inputText.trim() || isLoading) && styles.sendDisabled]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── STİLLER ─────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f5f7fa" },
  flex: { flex: 1 },

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

  inputWrap: { flexDirection: "row", alignItems: "flex-end", backgroundColor: "white", paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: "#efefef", gap: 10 },
  input: { flex: 1, backgroundColor: "#f5f7fa", borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, maxHeight: 120, minHeight: 44, color: "#1a1a1a" },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#319795", justifyContent: "center", alignItems: "center" },
  sendDisabled: { backgroundColor: "#c0d8d8" },
});
