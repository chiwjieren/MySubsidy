import React from 'react';
import { View, Text, Modal, ActivityIndicator, TouchableOpacity, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Status = 'idle' | 'pending' | 'success' | 'fail';

interface TransactionStatusModalProps {
  visible: boolean;
  status: Status;
  txHash?: string;
  message?: string; // Custom success/fail message
  onClose: () => void;
  onRetry?: () => void;
}

export default function TransactionStatusModal({
  visible,
  status,
  txHash,
  message,
  onClose,
  onRetry,
}: TransactionStatusModalProps) {

  const handleCopyHash = async () => {
    if (txHash) {
       Alert.alert("Copied", "Transaction hash copied to clipboard!");
    }
  };

  const handleViewExplorer = () => {
      if (txHash) {
          Alert.alert("Opening Explorer", `Viewing transaction: ${txHash}`);
      }
  };

  const renderContent = () => {
    switch (status) {
      case 'idle':
        return null; 
      case 'pending':
        return (
          <View className="items-center py-8">
            <ActivityIndicator size="large" color="#059669" />
            <Text className="mt-6 text-lg font-semibold text-slate-900">Processing...</Text>
            <Text className="text-slate-500 text-sm mt-2 text-center leading-5 px-4">
              Please wait while we confirm your transaction.
            </Text>
          </View>
        );
      case 'success':
        return (
          <View className="items-center py-4">
            <View className="bg-emerald-50 p-4 rounded-full mb-4">
                 <Ionicons name="checkmark-circle" size={50} color="#059669" />
            </View>
            <Text className="text-2xl font-bold text-center mb-2 text-slate-900">Successful!</Text>
            <Text className="text-slate-500 text-center mb-8 px-2">
              {message || "Your transaction has been successfully processed."}
            </Text>

            {txHash && (
              <View className="bg-slate-50 p-4 rounded-xl w-full mb-6 flex-row justify-between items-center border border-slate-100">
                <View className="flex-1 mr-2">
                    <Text className="text-xs text-slate-400 uppercase font-bold mb-1 tracking-wider">Transaction Hash</Text>
                    <Text className="text-xs text-emerald-600 font-mono" numberOfLines={1}>{txHash}</Text>
                </View>
                <TouchableOpacity onPress={handleCopyHash} className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                    <Ionicons name="copy-outline" size={16} color="#64748b" />
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              className="bg-primary py-4 rounded-xl w-full mb-3 shadow-lg active:bg-primary-dark"
              onPress={handleViewExplorer}
            >
              <Text className="text-white text-center font-bold text-lg">View on Explorer</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                className="py-3 w-full" 
                onPress={onClose}
            >
              <Text className="text-slate-500 text-center font-bold hover:text-slate-700">Close</Text>
            </TouchableOpacity>
          </View>
        );
      case 'fail':
        return (
          <View className="items-center py-4">
            <View className="bg-red-50 p-4 rounded-full mb-4">
                <Ionicons name="alert-circle" size={50} color="#dc2626" />
            </View>
            <Text className="text-xl font-bold text-center mb-2 text-slate-900">Transaction Failed</Text>
            <Text className="text-slate-500 text-center mb-6 px-4">
              {message || "Something went wrong. Please try again."}
            </Text>
            
            {onRetry && (
                 <TouchableOpacity
                  className="bg-slate-900 py-4 rounded-xl w-full mb-3 shadow-lg active:bg-slate-800"
                  onPress={onRetry}
                >
                  <Text className="text-white text-center font-bold text-lg">Retry</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity
              className="bg-slate-100 py-4 rounded-xl w-full"
              onPress={onClose}
            >
              <Text className="text-slate-700 text-center font-bold text-lg">Close</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <Modal visible={visible && status !== 'idle'} transparent animationType="fade">
      <View className="flex-1 bg-slate-900/60 justify-center items-center px-5">
        <View className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
          {renderContent()}
        </View>
      </View>
    </Modal>
  );
}
