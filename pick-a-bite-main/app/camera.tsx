import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function CameraScreen() {
  const router = useRouter();

  // Kamera izin durumunu tutar
  const [permission, requestPermission] = useCameraPermissions();
  // QR kodun taranıp taranmadığını kontrol eden durum
  const [scanned, setScanned] = useState(false);

  // İzin kontrolü
  if (!permission) {
    return <View />;
  }

  // İzin kontrolü: Kullanıcı kamera izni vermediyse izin isteme ekranı göster
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={{ marginBottom: 10 }}>Kamera izni gerekli</Text>

        <TouchableOpacity onPress={requestPermission}>
          <Text style={{ color: "#319795", fontWeight: "bold" }}>İzin Ver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // QR okuma mantığı
  const handleBarcodeScanned = ({ data }: any) => {
    // Eğer daha önce tarama yapıldıysa işlemi durdur
    if (scanned) return;

    setScanned(true);
    console.log("QR DATA:", data);

    // QR'dan gelen veriyi chatbot ekranına parametre olarak gönder
    // Chatbot bu veriyi kullanarak restoranın menüsünü analiz edecek
    router.replace({
      pathname: "/chatbot",
      params: { qrData: data },
    });
  };

  return (
    <View style={styles.container}>
      {/* Kamera Görüntüsü*/}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      {/* Kapatma Butonu*/}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={30} color="white" />
        </TouchableOpacity>
      </View>

      {/* Bilgi Çubuğu*/}
      <View style={styles.bottomInfo}>
        <Text style={styles.text}>QR kodu çerçeve içine getir</Text>

        {/* Tarama başarılıysa tekrar taramak için buton göster */}
        {scanned && (
          <TouchableOpacity
            onPress={() => setScanned(false)}
            style={styles.resetBtn}
          >
            <Text style={{ color: "white" }}>Tekrar Tara</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  topBar: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },

  bottomInfo: {
    position: "absolute",
    bottom: 60,
    width: "100%",
    alignItems: "center",
  },

  text: {
    color: "white",
    fontSize: 16,
    marginBottom: 10,
  },

  resetBtn: {
    marginTop: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#ED8936",
    borderRadius: 20,
  },
});
