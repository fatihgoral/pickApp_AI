import { Ionicons } from "@expo/vector-icons";
import { Camera } from "expo-camera";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

// Örnek restoran konumları
const SAMPLE_RESTAURANTS = [
  { id: "1", title: "Bursa Kebap Evi", latitude: 40.195, longitude: 29.06 },
  { id: "2", title: "Yeşil Cafe", latitude: 40.198, longitude: 29.063 },
  { id: "3", title: "Osmanlı Mutfağı", latitude: 40.192, longitude: 29.057 },
];

export default function HomeScreen() {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Kamera izinlerini kontrol eden fonksiyon
  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    const granted = status === "granted";
    setHasPermission(granted);

    if (!granted) {
      Alert.alert(
        "İzin Gerekli",
        "QR kod okutmak için kamera izni vermelisin."
      );
    }
    return granted;
  };

  // Kamera ekranına yönlendiren fonksiyon
  const handleOpenCamera = async () => {
    const granted = await requestCameraPermission();
    if (granted) {
      router.push("/camera");
    }
  };

  // Chatbot ekranına yönlendiren fonksiyon
  const handleOpenChatbot = () => {
    router.push("/chatbot");
  };

  // Profil ekranına yönlendiren fonksiyon
  const handleOpenProfile = () => {
    router.push("/profile");
  };

  return (
    <View style={styles.container}>
      {/* Harita */}
      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: 40.195,
          longitude: 29.06,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {SAMPLE_RESTAURANTS.map((restaurant) => (
          <Marker
            key={restaurant.id}
            coordinate={{
              latitude: restaurant.latitude,
              longitude: restaurant.longitude,
            }}
            title={restaurant.title}
            pinColor="#319795"
          />
        ))}
      </MapView>

      {/* Arama Çubuğu ve Profil Butonu */}
      <View style={styles.searchOverlay}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color="#666" />
          <TextInput
            placeholder="Restoran ara..."
            placeholderTextColor="#999"
            style={styles.input}
          />
        </View>

        <TouchableOpacity style={styles.profileBtn} onPress={handleOpenProfile}>
          <Ionicons name="person-outline" size={22} color="#319795" />
        </TouchableOpacity>
      </View>

      {/* "Bugün canınız ne çekiyor?" Chatbot Paneli */}
      <TouchableOpacity
        style={styles.chatbotPanel}
        onPress={handleOpenChatbot}
        activeOpacity={0.85}
      >
        <View style={styles.chatbotPanelLeft}>
          <View style={styles.chatbotIconCircle}>
            <Ionicons name="sparkles" size={18} color="white" />
          </View>
          <View>
            <Text style={styles.chatbotPanelTitle}>Bugün canınız ne çekiyor?</Text>
            <Text style={styles.chatbotPanelSub}>Yapay zekâ asistanına sor →</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#319795" />
      </TouchableOpacity>

      {/* QR Okutma Butonu */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.qrButton} onPress={handleOpenCamera}>
          <Ionicons name="qr-code-outline" size={28} color="white" />
          <Text style={styles.qrText}>SCAN</Text>
        </TouchableOpacity>

        {/* Chatbot FAB Butonu */}
        <TouchableOpacity style={styles.chatFab} onPress={handleOpenChatbot}>
          <Ionicons name="chatbubble-ellipses" size={26} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  /* Arama Çubuğu */
  searchOverlay: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },

  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },

  profileBtn: {
    marginLeft: 10,
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },

  /* Chatbot Paneli */
  chatbotPanel: {
    position: "absolute",
    bottom: 130,
    left: 16,
    right: 16,
    backgroundColor: "white",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#319795",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },

  chatbotPanelLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  chatbotIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#319795",
    justifyContent: "center",
    alignItems: "center",
  },

  chatbotPanelTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a1a",
  },

  chatbotPanelSub: {
    fontSize: 12,
    color: "#319795",
    marginTop: 2,
  },

  /* Alt Butonlar */
  bottomButtons: {
    position: "absolute",
    bottom: 35,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },

  qrButton: {
    backgroundColor: "#ED8936",
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },

  qrText: {
    marginTop: 2,
    fontSize: 9,
    color: "white",
    fontWeight: "800",
  },

  chatFab: {
    backgroundColor: "#319795",
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#319795",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
});
