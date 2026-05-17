import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─────────────────────────────────────────────
// TİP TANIMLARI
// ─────────────────────────────────────────────
interface DietaryPreference {
  id: string;
  label: string;
  description: string;
  icon: string;
  enabled: boolean;
}

// ─────────────────────────────────────────────
// BAŞLANGIÇ TERCİHLERİ (Şekil 2'ye göre)
// ─────────────────────────────────────────────
const INITIAL_PREFERENCES: DietaryPreference[] = [
  {
    id: "vegan",
    label: "Vegan",
    description: "Hayvansal ürün içermeyen menüler",
    icon: "leaf-outline",
    enabled: false,
  },
  {
    id: "vegetarian",
    label: "Vejetaryen",
    description: "Et içermeyen yemekler",
    icon: "nutrition-outline",
    enabled: false,
  },
  {
    id: "gluten_free",
    label: "Glutensiz",
    description: "Gluten içermeyen ürünler filtrelenir",
    icon: "ban-outline",
    enabled: false,
  },
  {
    id: "lactose_intolerant",
    label: "Laktoz İntoleransı",
    description: "Süt ürünleri içermeyen seçenekler",
    icon: "beaker-outline",
    enabled: false,
  },
  {
    id: "peanut_allergy",
    label: "Fıstık Alerjisi",
    description: "Fıstık içeren ürünler filtrelenir",
    icon: "warning-outline",
    enabled: false,
  },
  {
    id: "halal",
    label: "Helal",
    description: "Helal sertifikalı menüler",
    icon: "checkmark-circle-outline",
    enabled: false,
  },
  {
    id: "low_calorie",
    label: "Düşük Kalori",
    description: "500 kcal altı ürünler öne çıkar",
    icon: "fitness-outline",
    enabled: false,
  },
  {
    id: "high_protein",
    label: "Yüksek Protein",
    description: "Protein ağırlıklı menü önerileri",
    icon: "barbell-outline",
    enabled: false,
  },
];

// ─────────────────────────────────────────────
// ANA EKRAN BİLEŞENİ
// ─────────────────────────────────────────────
export default function ProfileScreen() {
  const router = useRouter();
  const [preferences, setPreferences] =
    useState<DietaryPreference[]>(INITIAL_PREFERENCES);
  const [isEditing, setIsEditing] = useState(false);

  // Kullanıcı bilgileri (Gerçek uygulamada auth context'ten gelir)
  const user = {
    name: "Fatih Göral",
    email: "fatih@example.com",
    memberSince: "Mayıs 2026",
  };

  // Uygulama açılınca kayıtlı tercihleri yükle
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const saved = await AsyncStorage.getItem("userPreferences");
        if (saved) {
          const savedIds: string[] = JSON.parse(saved);
          setPreferences((prev) =>
            prev.map((pref) => ({
              ...pref,
              enabled: savedIds.includes(pref.id),
            }))
          );
        }
      } catch (e) {
        console.log("Tercihler yüklenemedi:", e);
      }
    };
    loadPreferences();
  }, []);

  // Tercih toggle fonksiyonu — değişikliği anında AsyncStorage'a kaydet
  const togglePreference = async (id: string) => {
    const updated = preferences.map((pref) =>
      pref.id === id ? { ...pref, enabled: !pref.enabled } : pref
    );
    setPreferences(updated);
    try {
      const activeIds = updated
        .filter((p) => p.enabled)
        .map((p) => p.id);
      await AsyncStorage.setItem("userPreferences", JSON.stringify(activeIds));
    } catch (e) {
      console.log("Tercihler kaydedilemedi:", e);
    }
  };

  // Aktif tercih sayısı
  const activeCount = preferences.filter((p) => p.enabled).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil ve Tercihler</Text>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Ionicons
            name={isEditing ? "checkmark" : "pencil-outline"}
            size={20}
            color="#319795"
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── KULLANICI BİLGİ KARTI ── */}
        <View style={styles.userCard}>
          <View style={styles.avatarBig}>
            <Text style={styles.avatarInitials}>
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.memberBadge}>
              <Ionicons name="star" size={10} color="#ED8936" />
              <Text style={styles.memberText}>
                Üye: {user.memberSince}
              </Text>
            </View>
          </View>
        </View>

        {/* ── AKTİF TERCİH SAYACI ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Beslenme Tercihleri</Text>
          {activeCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{activeCount} aktif</Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionDesc}>
          Bu seçimler yapay zekâ asistanının öneri ve filtreleme işlemlerinde
          kullanılır. Aktifleştirdiğiniz kısıtlamalara göre riskli yemekler
          otomatik olarak taranır.
        </Text>

        {/* ── TERCİH KARTLARI ── */}
        <View style={styles.preferencesContainer}>
          {preferences.map((pref) => (
            <View
              key={pref.id}
              style={[
                styles.preferenceCard,
                pref.enabled && styles.preferenceCardActive,
              ]}
            >
              <View style={styles.prefLeft}>
                <View
                  style={[
                    styles.prefIconCircle,
                    pref.enabled && styles.prefIconCircleActive,
                  ]}
                >
                  <Ionicons
                    name={pref.icon as any}
                    size={18}
                    color={pref.enabled ? "white" : "#319795"}
                  />
                </View>
                <View style={styles.prefTextContainer}>
                  <Text
                    style={[
                      styles.prefLabel,
                      pref.enabled && styles.prefLabelActive,
                    ]}
                  >
                    {pref.label}
                  </Text>
                  <Text style={styles.prefDesc}>{pref.description}</Text>
                </View>
              </View>

              <Switch
                value={pref.enabled}
                onValueChange={() => togglePreference(pref.id)}
                trackColor={{ false: "#e0e0e0", true: "#81c8c8" }}
                thumbColor={pref.enabled ? "#319795" : "#f4f3f4"}
                ios_backgroundColor="#e0e0e0"
              />
            </View>
          ))}
        </View>

        {/* ── BİLGİLENDİRME ── */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={18} color="#319795" />
          <Text style={styles.infoText}>
            Alerji durumlarında ciddi hassasiyetler için sipariş öncesinde
            restoran ile doğrulama yapmanızı öneririz.
          </Text>
        </View>

        {/* ── ÇIKIŞ BUTONU ── */}
        <TouchableOpacity style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={20} color="#e53e3e" />
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────
// STİLLER
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },

  /* Header */
  header: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#efefef",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e8f5f5",
    justifyContent: "center",
    alignItems: "center",
  },

  scroll: {
    flex: 1,
  },

  /* Kullanıcı Kartı */
  userCard: {
    backgroundColor: "white",
    margin: 16,
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarBig: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#319795",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: {
    fontSize: 22,
    fontWeight: "700",
    color: "white",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  userEmail: {
    fontSize: 13,
    color: "#666",
    marginTop: 3,
  },
  memberBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
    backgroundColor: "#fff8f0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  memberText: {
    fontSize: 11,
    color: "#ED8936",
    fontWeight: "600",
  },

  /* Bölüm Başlığı */
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  countBadge: {
    backgroundColor: "#319795",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countBadgeText: {
    fontSize: 11,
    color: "white",
    fontWeight: "700",
  },
  sectionDesc: {
    fontSize: 12,
    color: "#888",
    marginHorizontal: 16,
    marginBottom: 14,
    lineHeight: 18,
  },

  /* Tercih Kartları */
  preferencesContainer: {
    marginHorizontal: 16,
    gap: 10,
  },
  preferenceCard: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  preferenceCardActive: {
    borderColor: "#319795",
    backgroundColor: "#f0fafa",
  },
  prefLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  prefIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#e8f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  prefIconCircleActive: {
    backgroundColor: "#319795",
  },
  prefTextContainer: {
    flex: 1,
  },
  prefLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  prefLabelActive: {
    color: "#319795",
  },
  prefDesc: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
  },

  /* Bilgilendirme */
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#e8f5f5",
    margin: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 14,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#2c7a7b",
    lineHeight: 18,
  },

  /* Çıkış Butonu */
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    backgroundColor: "#fff5f5",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#fed7d7",
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e53e3e",
  },
});
