import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import NfcManager, { NfcTech } from "react-native-nfc-manager";
import { useSubsidy } from "@/context/SubsidyContext";

// Define screen step types
type Step =
  | "idle"
  | "scanning"
  | "details"
  | "verifying"
  | "success"
  | "rescan"
  | "error";

// Mock MyKad Data (simulates JPN reader data)
const MOCK_MYKAD_DATA = {
  cardNumber: "111111-11-1111",
  name: "MUHAMMAD AZHAR BIN ABDUL KADIR",
  sex: "MALE",
  birthDate: "01-01-1995",
  address: "NO 123, JALAN MERDEKA, 50000 KUALA LUMPUR",
  city: "KUALA LUMPUR",
  postcode: "50000",
  state: "WILAYAH PERSEKUTUAN",
  nationality: "WARGANEGARA",
  religion: "ISLAM",
  cardExpiry: "01-01-2035",
  cardStatus: "ACTIVE",
};

// Hardcoded Mock Data (replace with your backend later)
const MOCK_USER = {
  name: "Ian Jie Shan",
  ic: "000101-14-XXXX",
  address: "NO 123, JALAN MERDEKA, 50000 KUALA LUMPUR",
  dob: "01 JAN 1990",
};

// Enable DEBUG mode for testing without NFC card
const DEBUG_MODE = true;

// Icon component to isolate from Nativewind CSS interop issues
const IconComponent = ({ name, size, color }: { name: any; size: number; color: string }) => (
  <Ionicons name={name} size={size} color={color} />
);

function NFCLoginContent() {
  const router = useRouter();
  const { login } = useSubsidy();

  const [step, setStep] = useState<Step>("idle");
  const [scanError, setScanError] = useState("");
  const [tagMetadata, setTagMetadata] = useState<any>(null); // Store scanned tag data
  const [routerReady, setRouterReady] = useState(false);

  // Ensure router is ready before using it
  useEffect(() => {
    if (router) {
      setRouterReady(true);
    }
  }, [router]);

  // Simulate NFC card detection (for testing without physical card)
  const simulateNfcDetection = () => {
    const simulatedTag = {
      ...MOCK_MYKAD_DATA,
      uuid: "0" + Math.random().toString(36).substring(7).toUpperCase(),
      detectedAt: new Date().toISOString(),
    };
    
    setTagMetadata(simulatedTag);
    Alert.alert("✓ MyKad Simulated", `Card: ${simulatedTag.cardNumber}`, [
      { text: "OK" }
    ]);
    setStep("details");
  };

  // Initialize NFC
  useEffect(() => {
    const initNfc = async () => {
      try {
        await NfcManager.start();
      } catch (e) {
        console.warn("NFC Init Error:", e);
      }
    };
    initNfc();

    return () => {
      NfcManager.cancelTechnologyRequest().catch(() => {});
    };
  }, []);

  const startNfc = async () => {
    try {
      setStep("scanning");
      setScanError("");

      // Request IsoDep only (MyKad uses ISO 14443-4)
      await NfcManager.requestTechnology(NfcTech.IsoDep);

      const tag = await NfcManager.getTag();
      console.log("MYKAD FOUND:", tag);

      if (!tag) {
        throw new Error("No MyKad detected");
      }

      // MOCK: Simulate JPN reader extracting MyKad metadata
      // In production, you'd parse APDU commands to extract real data
      const mockCardData = {
        ...MOCK_MYKAD_DATA,
        uuid: tag.id, // Real card UID from NFC reader
        detectedAt: new Date().toISOString(),
      };

      setTagMetadata(mockCardData);
      Alert.alert("✓ MyKad Detected", `Card: ${mockCardData.cardNumber}`, [
        { text: "OK" }
      ]);
      setStep("details"); // Move to details/metadata view
    } catch (ex: any) {
      console.warn("NFC Error:", ex);
      
      // Provide specific error messages
      let errorMessage = "Failed to detect card. Please try again.";
      if (ex.message?.includes("cancelled")) {
        errorMessage = "Scan cancelled.";
      } else if (ex.message?.includes("not found")) {
        errorMessage = "No NFC card detected. Try again.";
      } else if (ex.message?.includes("timeout")) {
        errorMessage = "Scan timeout. Please tap your card again.";
      }
      
      setScanError(errorMessage);
      setStep("rescan");
    } finally {
      NfcManager.cancelTechnologyRequest().catch(() => {});
    }
  };

  const cancelNfc = async () => {
    await NfcManager.cancelTechnologyRequest().catch(() => {});
    setStep("idle");
  };

  const handleProceed = () => {
      setStep('success');
      setTimeout(() => {
          login();
          if (router && routerReady) router.replace('/(tabs)');
      }, 1000);
  };

  const renderStep = () => {
    switch (step) {
      case "idle":
      case "rescan":
        return (
          <View style={styles.outerPadding}>
            {/* Header Logo */}
            <View style={styles.headerContainer}>
               <View style={styles.logoRow}>
                   <IconComponent name="wallet" size={28} color="#5b50e6" />
                   <Text style={styles.logoText}>MySubsidy</Text>
               </View>
            </View>

            {/* Main Content */}
            <View style={styles.mainContent}>
                <Text style={styles.title}>MyKad Login</Text>
                <Text style={styles.subtitle}>
                    Please tap your MyKad against the back of your phone to proceed securely.
                </Text>

                {/* Visual / Card Animation */}
                {/* Custom Card Icon (Indigo Theme) */}
                <View style={styles.cardContainer}>
                    <View style={styles.wifiIcon}>
                        <IconComponent name="wifi" size={20} color="white" />
                    </View>
                    <View style={styles.chipRight} />
                    <View style={styles.chipLeft} />
                    <View style={styles.decorCircle} />
                </View>

                {/* Actions (Moved Up) */}
                <TouchableOpacity 
                    style={styles.scanButton} 
                    onPress={startNfc}
                >
                    <Text style={styles.scanButtonText}>Tap to Scan</Text>
                </TouchableOpacity>

                {step === "rescan" && (
                    <View style={styles.errorBanner}>
                        <IconComponent name="alert-circle" size={20} color="#dc2626" />
                        <Text style={styles.errorText}>{scanError || "Scan failed"}</Text>
                    </View>
                )}

                {DEBUG_MODE && (
                    <TouchableOpacity 
                        style={styles.debugButton}
                        onPress={simulateNfcDetection}
                    >
                        <IconComponent name="bug" size={16} color="#ca8a04" />
                        <Text style={styles.debugButtonText}>Simulate NFC Card</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity onPress={() => { login(); if (router && routerReady) router.replace("/(tabs)"); }}>
                    <Text style={styles.skipLink}>Skip to Dashboard (Debug)</Text>
                </TouchableOpacity>
            </View>
          </View>
        );

      case "scanning":
        return (
          <View style={styles.scanningContainer}>
             <View style={styles.spinnerContainer}>
                <ActivityIndicator size="large" color="#5b50e6" />
             </View>
            <Text style={styles.scanningTitle}>Scanning...</Text>
            <Text style={styles.scanningSubtitle}>Hold your MyKad steady against the NFC reader.</Text>
            
            <TouchableOpacity style={styles.cancelButton} onPress={cancelNfc}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        );

      case "details":
        return (
          <View style={styles.detailsContainer}>
            <ScrollView contentContainerStyle={{paddingBottom: 100}} showsVerticalScrollIndicator={false}>
             <View style={styles.headerContainer}>
                <View style={styles.successIconContainer}>
                     <IconComponent name="checkmark" size={32} color="#059669" />
                </View>
                <Text style={styles.detailsTitle}>MyKad Detected</Text>
                <Text style={styles.detailsSubtitle}>Review the scanned details below.</Text>
             </View>

            {/* Card Preview */}
            <View style={styles.cardPreview}>
                <View style={{marginBottom: 16}}>
                    <Text style={styles.cardNumber}>MYKAD NUMBER</Text>
                    <Text style={styles.cardNumberValue}>{tagMetadata?.cardNumber || "XXXX-XX-XXXX"}</Text>
                </View>
                <View style={styles.cardDivider} />
                <View>
                    <Text style={styles.cardName}>{tagMetadata?.name || "NAME"}</Text>
                    <View style={styles.cardDetailsRow}>
                        <View style={styles.cardDetailItem}>
                            <Text style={styles.cardDetailLabel}>Sex</Text>
                            <Text style={styles.cardDetailValue}>{tagMetadata?.sex || "M/F"}</Text>
                        </View>
                        <View style={styles.cardDetailItem}>
                            <Text style={styles.cardDetailLabel}>Date of Birth</Text>
                            <Text style={styles.cardDetailValue}>{tagMetadata?.birthDate || "DD-MM-YYYY"}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Details Grid */}
            <View style={styles.detailsGrid}>
                <View style={styles.detailField}>
                    <Text style={styles.detailLabel}>Address</Text>
                    <Text style={styles.detailValue}>{tagMetadata?.address || "No address"}</Text>
                </View>

                <View style={styles.detailRow}>
                    <View style={styles.detailFieldHalf}>
                        <Text style={styles.detailLabel}>City</Text>
                        <Text style={styles.detailValue}>{tagMetadata?.city || "N/A"}</Text>
                    </View>
                    <View style={styles.detailFieldHalf}>
                        <Text style={styles.detailLabel}>Postcode</Text>
                        <Text style={styles.detailValue}>{tagMetadata?.postcode || "N/A"}</Text>
                    </View>
                </View>

                <View style={styles.detailRow}>
                    <View style={styles.detailFieldHalf}>
                        <Text style={styles.detailLabel}>State</Text>
                        <Text style={styles.detailValue}>{tagMetadata?.state || "N/A"}</Text>
                    </View>
                    <View style={styles.detailFieldHalf}>
                        <Text style={styles.detailLabel}>Religion</Text>
                        <Text style={styles.detailValue}>{tagMetadata?.religion || "N/A"}</Text>
                    </View>
                </View>

                <View style={styles.detailRow}>
                    <View style={styles.detailFieldHalf}>
                        <Text style={styles.detailLabel}>Card Expiry</Text>
                        <Text style={styles.detailValue}>{tagMetadata?.cardExpiry || "N/A"}</Text>
                    </View>
                    <View style={styles.detailFieldHalf}>
                        <Text style={styles.detailLabel}>Status</Text>
                        <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                            <View style={{width: 8, height: 8, backgroundColor: '#10b981', borderRadius: 4}} />
                            <Text style={styles.detailValue}>{tagMetadata?.cardStatus || "ACTIVE"}</Text>
                        </View>
                    </View>
                </View>
            </View>
            </ScrollView>

            <View style={{position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingVertical: 16, backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#f3f4f6'}}>
              <TouchableOpacity 
                  style={styles.verifyButton} 
                  onPress={handleProceed}
              >
                <Text style={styles.verifyButtonText}>Verify & Continue</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.rescanLink} onPress={() => { setTagMetadata(null); setStep("idle"); }}>
                <Text style={styles.rescanLinkText}>Scan Another Card</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case "success":
        return (
          <View style={styles.successContainer}>
            <View style={styles.successCheckContainer}>
                <IconComponent name="checkmark" size={48} color="#5b50e6" />
            </View>
            <Text style={styles.successTitle}>Verified!</Text>
            <Text style={styles.successSubtitle}>Redirecting you ...</Text>
          </View>
        );

      case "error":
      case "verifying":
         return null; 
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderStep()}
    </SafeAreaView>
  );
}

export default function NFCLoginPage() {
  return <NFCLoginContent />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  outerPadding: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#5b50e6',
    letterSpacing: 0.5,
  },
  mainContent: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 40,
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  cardContainer: {
    width: 256,
    height: 160,
    backgroundColor: '#5b50e6',
    borderRadius: 16,
    padding: 16,
    marginBottom: 48,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: 'rgba(193, 200, 248, 0.5)',
  },
  wifiIcon: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    backgroundColor: '#818cf8',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  chipRight: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 48,
    height: 36,
    backgroundColor: '#e0e7ff',
    borderRadius: 6,
    opacity: 0.8,
  },
  chipLeft: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: 64,
    height: 8,
    backgroundColor: '#818cf8',
    borderRadius: 4,
  },
  decorCircle: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 96,
    height: 96,
    backgroundColor: '#ffffff',
    borderRadius: 48,
    opacity: 0.1,
    marginRight: -40,
    marginTop: -40,
  },
  scanButton: {
    backgroundColor: '#5b50e6',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    shadowOpacity: 0.15,
    marginBottom: 24,
  },
  scanButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
  errorBanner: {
    backgroundColor: '#fef2f2',
    paddingVertical: 12,
    paddingHorizontal: 12,
    width: '120%',
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#fee2e2',
  },
  errorText: {
    color: '#dc2626',
    fontWeight: '500',
    fontSize: 14,
    marginLeft: 8,
  },
  debugButton: {
    backgroundColor: '#fef3c7',
    borderWidth: 2,
    borderColor: '#fbbf24',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  debugButtonText: {
    color: '#b45309',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
  },
  skipLink: {
    color: '#5b50e6',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 14,
  },
  scanningContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: 32,
  },
  spinnerContainer: {
    width: 96,
    height: 96,
    backgroundColor: '#eef2ff',
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  scanningTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  scanningSubtitle: {
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  cancelButton: {
    marginTop: 48,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 20,
  },
  cancelButtonText: {
    color: '#4b5563',
    fontWeight: 'bold',
  },
  detailsContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    backgroundColor: '#ffffff',
  },
  successIconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#dcfce7',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  detailsSubtitle: {
    color: '#6b7280',
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 32,
  },
  cardPreview: {
    backgroundColor: 'linear-gradient(to bottom right, #5b50e6, #4338ca)',
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderRadius: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(110, 90, 254, 0.2)',
  },
  cardNumber: {
    color: '#e0e7ff',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 3,
    marginBottom: 4,
  },
  cardNumberValue: {
    color: '#ffffff',
    fontSize: 20,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(129, 140, 248, 0.3)',
    marginBottom: 16,
  },
  cardName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cardDetailItem: {
    flex: 1,
  },
  cardDetailLabel: {
    color: '#c7d2fe',
    fontSize: 12,
  },
  cardDetailValue: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
    marginTop: 2,
  },
  detailsGrid: {
    marginBottom: 32,
  },
  detailField: {
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  detailValue: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '500',
  },
  detailRow: {
    flexDirection: 'row',
    gap: 16,
  },
  detailFieldHalf: {
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    flex: 1,
  },
  verifyButton: {
    backgroundColor: '#5b50e6',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    shadowOpacity: 0.15,
    marginBottom: 16,
  },
  verifyButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
  rescanLink: {
    paddingVertical: 12,
  },
  rescanLinkText: {
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: '#5b50e6',
  },
  successCheckContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderRadius: 12,
    shadowOpacity: 0.3,
    marginBottom: 24,
  },
  successTitle: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    color: '#c7d2fe',
    textAlign: 'center',
  },
});
