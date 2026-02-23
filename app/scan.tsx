import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from "expo-camera";

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();

  const [lastScannedValue, setLastScannedValue] = useState<string | null>(null);
  const [isScanEnabled, setIsScanEnabled] = useState(true);

  const barcodeTypes = useMemo(
    () => ["upc_a", "upc_e", "ean13", "ean8"] as const,
    []
  );

  const resetScanner = useCallback(() => {
    setIsScanEnabled(true);
  }, []);

  useEffect(() => {
    // Permission object may be null briefly on first render
    if (!permission) return;

    // If not granted, request once (Expo will no-op if already decided)
    if (!permission.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleScan = useCallback(
    (result: BarcodeScanningResult) => {
      if (!isScanEnabled) return;

      setIsScanEnabled(false);

      const value = result.data?.trim() ?? "";
      setLastScannedValue(value);

      Alert.alert("Barcode Scanned", value || "(Empty value)", [
        { text: "Scan Again", onPress: resetScanner },
        { text: "OK", style: "cancel" },
      ]);
    },
    [isScanEnabled, resetScanner]
  );

  // Loading state while permission info is being resolved
  if (!permission) {
    return (
      <View style={styles.center}>
        <Text style={styles.infoText}>Checking camera permission…</Text>
      </View>
    );
  }

  // Permission denied / not granted state
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.infoText}>Camera permission is required.</Text>

        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Main scanner UI
  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        // Attach handler only when enabled to reduce duplicate triggers
        onBarcodeScanned={isScanEnabled ? handleScan : undefined}
        barcodeScannerSettings={{ barcodeTypes: [...barcodeTypes] }}
      />

      <View style={styles.overlay}>
        <Text style={styles.title}>Scan Product Barcode</Text>
        <View style={styles.scanBox} />

        {lastScannedValue ? (
          <Text style={styles.result}>Last: {lastScannedValue}</Text>
        ) : (
          <Text style={styles.hint}>Align the barcode inside the box</Text>
        )}

        {!isScanEnabled && (
          <TouchableOpacity style={styles.secondaryButton} onPress={resetScanner}>
            <Text style={styles.secondaryButtonText}>Scan Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { ...StyleSheet.absoluteFillObject },

  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 40,
    alignItems: "center",
    paddingHorizontal: 16,
  },

  title: { color: "white", fontSize: 18, fontWeight: "600" },
  result: { color: "white", marginTop: 10 },
  hint: { color: "rgba(255,255,255,0.8)", marginTop: 10 },

  scanBox: {
    width: "85%",
    height: 180,
    borderWidth: 2,
    borderColor: "white",
    borderRadius: 12,
    marginTop: 15,
  },

  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },
  infoText: { fontSize: 16, textAlign: "center" },

  button: {
    marginTop: 12,
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  buttonText: { color: "white", fontWeight: "600" },

  secondaryButton: {
    marginTop: 12,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  secondaryButtonText: { color: "white", fontWeight: "600" },
});