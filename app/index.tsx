import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
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

// Hardcoded Mock Data (replace with your backend later)
const MOCK_USER = {
  name: "Ian Jie Shan",
  ic: "000101-14-XXXX",
  address: "NO 123, JALAN MERDEKA, 50000 KUALA LUMPUR",
  dob: "01 JAN 1990",
};

export default function NFCLoginPage() {
  const router = useRouter();
  const { login } = useSubsidy();

  const [step, setStep] = useState<Step>("idle");
  const [scanError, setScanError] = useState("");
  const [tagMetadata, setTagMetadata] = useState<any>(null); // Store scanned tag data

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

      setTagMetadata(tag);
      Alert.alert("MyKad Connected", `UID: ${tag.id}`);
      setStep("details"); // Move to details/metadata view
      
      // Verification logic could go here, but for now we just show metadata
    } catch (ex) {
      console.warn("NFC Error:", ex);
      setScanError("Failed to detect card. Please try again.");
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
          router.replace('/(tabs)');
      }, 1000);
  };

  const renderStep = () => {
    switch (step) {
      case "idle":
      case "rescan":
        return (
          <View className="flex-1 px-8 pt-10">
            {/* Header Logo */}
            <View className="items-center mb-12">
               <View className="flex-row items-center gap-2">
                   <Ionicons name="wallet" size={28} color="#5b50e6" />
                   <Text className="text-2xl font-bold text-[#5b50e6] tracking-tight">MySubsidy</Text>
               </View>
            </View>

            {/* Main Content */}
            <View className="items-center w-full">
                <Text className="text-2xl font-bold text-gray-900 mb-3 text-center">MyKad Login</Text>
                <Text className="text-gray-500 text-center mb-10 text-base px-4 leading-6">
                    Please tap your MyKad against the back of your phone to proceed securely.
                </Text>

                {/* Visual / Card Animation */}
                {/* Custom Card Icon (Indigo Theme) */}
                <View className="w-64 h-40 bg-[#5b50e6] rounded-2xl p-4 shadow-lg mb-12 relative overflow-hidden border border-indigo-200/50 shadow-indigo-200">
                    <View className="absolute top-5 left-5 bg-[#818cf8] w-10 h-10 rounded-full items-center justify-center shadow-sm">
                        <Ionicons name="wifi" size={20} color="white" style={{ transform: [{ rotate: "90deg" }] }} />
                    </View>
                    <View className="absolute bottom-5 right-5 w-12 h-9 bg-[#e0e7ff] rounded-md opacity-80" />
                    <View className="absolute bottom-5 left-5 w-16 h-2 bg-[#818cf8] rounded-full" />
                    <View className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-10 -mt-10" />
                </View>

                {/* Actions (Moved Up) */}
                <TouchableOpacity 
                    className="bg-[#5b50e6] w-full py-4 rounded-2xl shadow-lg shadow-indigo-200 active:bg-indigo-700 mb-6" 
                    onPress={startNfc}
                >
                    <Text className="text-white text-center font-bold text-lg">Tap to Scan</Text>
                </TouchableOpacity>

                {step === "rescan" && (
                    <View className="bg-red-50 p-3 w-screen mb-6 flex-row items-center justify-center border-y border-red-100">
                        <Ionicons name="alert-circle" size={20} color="#dc2626" style={{ marginRight: 6 }} />
                        <Text className="text-red-600 font-medium text-sm">{scanError || "Scan failed"}</Text>
                    </View>
                )}

                <TouchableOpacity onPress={() => { login(); router.replace("/(tabs)"); }}>
                    <Text className="text-[#5b50e6] font-semibold text-center text-sm">Skip to Dashboard (Debug)</Text>
                </TouchableOpacity>
            </View>
          </View>
        );

      case "scanning":
        return (
          <View className="items-center justify-center flex-1 px-8">
             <View className="w-24 h-24 bg-indigo-50 rounded-full items-center justify-center mb-6">
                <ActivityIndicator size="large" color="#5b50e6" />
             </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">Scanning...</Text>
            <Text className="text-gray-500 text-center px-4">Hold your MyKad steady against the NFC reader.</Text>
            
            <TouchableOpacity className="mt-12 bg-gray-100 px-8 py-3 rounded-full" onPress={cancelNfc}>
              <Text className="text-gray-600 font-bold">Cancel</Text>
            </TouchableOpacity>
          </View>
        );

      case "details":
        return (
          <View className="flex-1 px-6 pt-10">
             <View className="items-center mb-8">
                <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4">
                     <Ionicons name="checkmark" size={32} color="#059669" />
                </View>
                <Text className="text-2xl font-bold text-gray-900 mb-2">MyKad Detected</Text>
                <Text className="text-gray-500 text-center text-sm">Review the scanned details below.</Text>
             </View>

            <View className="bg-gray-50 p-6 rounded-3xl border border-gray-100 mb-8 w-full">
                 <View className="mb-6">
                    <Text className="text-xs text-gray-400 font-bold uppercase mb-1 tracking-wider">Card UID</Text>
                    <Text className="text-xl font-mono text-gray-800 font-medium">{tagMetadata?.id || "Unknown"}</Text>
                 </View>
                 <View className="mb-6">
                    <Text className="text-xs text-gray-400 font-bold uppercase mb-1 tracking-wider">Type</Text>
                    <View className="flex-row items-center">
                        <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                        <Text className="text-base text-gray-800 font-medium">MyKad (IsoDep)</Text>
                    </View>
                 </View>
            </View>

            <TouchableOpacity 
                className="bg-[#5b50e6] w-full py-4 rounded-2xl shadow-lg shadow-indigo-200 mb-4" 
                onPress={handleProceed}
            >
              <Text className="text-white text-center font-bold text-lg">Verify Identity</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="py-3" onPress={() => { setTagMetadata(null); setStep("idle"); }}>
              <Text className="text-gray-500 text-center font-medium">Scan Again</Text>
            </TouchableOpacity>
          </View>
        );

      case "success":
        return (
          <View className="items-center justify-center flex-1 px-6 bg-[#5b50e6]">
            <View className="bg-white p-6 rounded-full shadow-2xl mb-6">
                <Ionicons name="checkmark" size={48} color="#5b50e6" />
            </View>
            <Text className="text-white text-3xl font-bold text-center mb-2">Verified!</Text>
            <Text className="text-indigo-200 text-center mb-8">Redirecting you ...</Text>
          </View>
        );

      case "error":
      case "verifying":
         return null; 
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {renderStep()}
    </SafeAreaView>
  );
}
