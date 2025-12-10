import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TransactionStatusModal from '@/components/TransactionStatusModal';
import { useSubsidy } from '@/context/SubsidyContext';

const MOCK_MERCHANT = {
  name: "NSK Trade City",
  location: "Kuala Lumpur",
  acceptedSubsidies: ['bkk', 'mykasih'], // Doesn't accept student voucher
};

type TransactionStatus = 'idle' | 'pending' | 'success' | 'error';

export default function SpendingPage() {
  const router = useRouter();
  const { subsidies, spendSubsidy } = useSubsidy();
  
  // Only show claimed subsidies
  const availableBalances = subsidies.filter(s => s.status === 'claimed');

  const [isScanning, setIsScanning] = useState(false);
  const [merchant, setMerchant] = useState<typeof MOCK_MERCHANT | null>(null);
  
  // Transaction State
  const [selectedSubsidyId, setSelectedSubsidyId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [txStatus, setTxStatus] = useState<TransactionStatus>('idle');

  const handleScan = () => {
    setIsScanning(true);
    // Simulate scan delay
    setTimeout(() => {
        setIsScanning(false);
        setMerchant(MOCK_MERCHANT); // Found merchant
    }, 1500);
  };

  const handleSelectSubsidy = (id: string) => {
    if (merchant && !merchant.acceptedSubsidies.includes(id)) {
        Alert.alert("Not Accepted", "This merchant does not accept this subsidy.");
        return;
    }
    setSelectedSubsidyId(id);
  };

  const handlePay = () => {
    if (!amount || isNaN(Number(amount))) {
        Alert.alert("Invalid Amount", "Please enter a valid amount.");
        return;
    }
    
    // Find from available balances
    const subsidy = availableBalances.find(b => b.id === selectedSubsidyId);
    // Use remaining amount: Total - Spent
    const currentBalance = (subsidy?.amount || 0) - (subsidy?.spent || 0);

    if (Number(amount) > currentBalance) {
        Alert.alert("Insufficient Balance", "You do not have enough balance for this transaction.");
        return;
    }

    setShowConfirmModal(true);
  };

  const confirmTransaction = () => {
    setShowConfirmModal(false); // Close confirmation modal
    setTxStatus('pending'); // Start status modal

    // Simulate network request
    setTimeout(() => {
        if (selectedSubsidyId) {
             spendSubsidy(selectedSubsidyId, Number(amount));
        }
        
        setTxStatus('success');
        
        // No auto-close here, user will close the modal manually
    }, 2000);
  };

  const selectedSubsidy = availableBalances.find(b => b.id === selectedSubsidyId);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="flex-1 px-5 py-6" contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
            <View>
                <Text className="text-2xl font-bold text-slate-900">My Wallet</Text>
                <Text className="text-slate-500">Manage your subsidies</Text>
            </View>
            <TouchableOpacity onPress={() => router.back()} className="bg-slate-200 p-2 rounded-full">
                 <Ionicons name="close" size={24} color="#0f172a" />
            </TouchableOpacity>
        </View>

        {/* Balances */}
        <Text className="text-lg font-semibold mb-3 text-slate-800 pl-1">Available Balances</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-12">
            {availableBalances.length > 0 ? availableBalances.map(balance => {
                const currentAmount = balance.amount - (balance.spent || 0);
                return (
                <View key={balance.id} className="bg-white w-72 p-6 rounded-3xl mr-4 shadow-sm border border-slate-100 justify-between">
                    <View className="flex-row items-start justify-between mb-4">
                        <View className={`w-12 h-12 rounded-full items-center justify-center ${balance.color.replace('bg-', 'bg-opacity-10 bg-')}`}>
                             <Ionicons 
                                name={balance.id === 'bkk' ? 'people' : balance.id === 'mykasih' ? 'fast-food' : 'book'} 
                                size={24} 
                                color={balance.id === 'bkk' ? '#2563eb' : balance.id === 'mykasih' ? '#16a34a' : '#f97316'} 
                             />
                        </View>
                        <View className="bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                             <Text className="text-emerald-700 text-xs font-bold">Active</Text>
                        </View>
                    </View>
                    
                    <View>
                        <Text className="text-slate-500 font-medium text-sm mb-1 uppercase tracking-wider">Balance</Text>
                        <Text className="text-slate-900 text-3xl font-extrabold mb-2">RM {currentAmount.toFixed(2)}</Text>
                        <Text className="text-slate-600 font-medium text-sm h-10" numberOfLines={2}>{balance.name}</Text>
                    </View>
                </View>
            )}) : (
                <View className="w-full p-6 bg-white rounded-2xl border border-dashed border-gray-300 items-center justify-center">
                    <Text className="text-gray-400">No active subsidies found.</Text>
                    <Text className="text-blue-500 text-sm mt-2" onPress={() => router.push('/claim')}>Go to Claims</Text>
                </View>
            )}
        </ScrollView>

        {/* Action Area */}
        {!merchant ? (
             <View className="bg-white p-8 rounded-2xl items-center shadow-sm border border-slate-200">
                <View className="bg-slate-50 p-6 rounded-full mb-6 border border-slate-100">
                    <Ionicons name="qr-code-outline" size={60} color="#0f172a" />
                </View>
                <Text className="text-xl font-bold text-slate-900 mb-2">Pay at Merchant</Text>
                <Text className="text-slate-500 text-center mb-8 max-w-xs leading-relaxed">
                    Scan the merchant's QR code to pay instantly using your subsidy balance.
                </Text>
                <TouchableOpacity 
                    className="bg-primary w-full py-4 rounded-xl shadow-lg active:bg-opacity-90 flex-row justify-center items-center"
                    onPress={handleScan}
                    disabled={isScanning}
                >
                    {isScanning ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Ionicons name="scan" size={20} color="white" style={{ marginRight: 8 }} />
                            <Text className="text-white font-bold text-lg">Scan QR Code</Text>
                        </>
                    )}
                </TouchableOpacity>
             </View>
        ) : (
            <View className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                {/* Merchant Header */}
                <View className="flex-row items-center mb-6 pb-4 border-b border-slate-100">
                    <View className="bg-orange-50 p-3 rounded-xl mr-4 border border-orange-100">
                        <Ionicons name="storefront" size={24} color="#ea580c" />
                    </View>
                    <View>
                        <Text className="text-lg font-bold text-slate-900">{merchant.name}</Text>
                        <Text className="text-slate-500 text-sm">{merchant.location}</Text>
                    </View>
                     <TouchableOpacity 
                        className="ml-auto"
                        onPress={() => setMerchant(null)}
                     >
                        <Text className="text-red-500 font-medium hover:text-red-600">Cancel</Text>
                    </TouchableOpacity>
                </View>

                {/* Subsidy Selection */}
                <Text className="text-slate-700 font-semibold mb-3">Select Payment Method</Text>
                <View className="mb-6">
                    {availableBalances.map(balance => {
                        const isSupported = merchant.acceptedSubsidies.includes(balance.id);
                        const isSelected = selectedSubsidyId === balance.id;
                        const currentAmount = balance.amount - (balance.spent || 0);
                        return (
                            <TouchableOpacity 
                                key={balance.id}
                                className={`p-4 rounded-xl border mb-3 flex-row justify-between items-center transition-all ${
                                    !isSupported ? 'bg-slate-50 border-slate-200 opacity-60' : 
                                    isSelected ? 'bg-indigo-50 border-primary shadow-sm' : 'bg-white border-slate-200'
                                }`}
                                onPress={() => handleSelectSubsidy(balance.id)}
                                disabled={!isSupported}
                            >
                                <View className="flex-1">
                                    <Text className={`font-semibold ${isSelected ? 'text-primary' : 'text-slate-700'}`}>
                                        {balance.name}
                                    </Text>
                                    {!isSupported && <Text className="text-xs text-red-500 mt-1">Not accepted here</Text>}
                                </View>
                                <Text className="font-bold text-slate-900">RM {currentAmount.toFixed(2)}</Text>
                                {isSelected && <Ionicons name="checkmark-circle" size={20} color="#5b50e6" style={{ marginLeft: 8 }} />}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {selectedSubsidyId && (
                    <>
                        <Text className="text-slate-700 font-semibold mb-2">Enter Amount (RM)</Text>
                        <TextInput 
                            className="bg-white border border-slate-300 rounded-xl p-4 text-2xl font-bold mb-6 text-center text-slate-900 placeholder:text-slate-300"
                            keyboardType="numeric"
                            placeholder="0.00"
                            value={amount}
                            onChangeText={setAmount}
                        />

                        <TouchableOpacity 
                            className="bg-primary w-full py-4 rounded-xl shadow-lg active:bg-primary-dark"
                            onPress={handlePay}
                        >
                            <Text className="text-white text-center font-bold text-lg">Pay Now</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        )}
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal visible={showConfirmModal} transparent animationType="fade">
        <View className="flex-1 bg-slate-900/60 justify-end">
            <View className="bg-white rounded-t-3xl p-8 min-h-[45%]">
                <Text className="text-center text-xl font-bold mb-8 text-slate-900">Confirm Payment</Text>
                
                <View className="bg-slate-50 p-6 rounded-2xl mb-8 space-y-4 border border-slate-100">
                    <View className="flex-row justify-between items-center">
                        <Text className="text-slate-500">Merchant</Text>
                        <Text className="font-bold text-slate-900 text-lg">{merchant?.name}</Text>
                    </View>
                    <View className="flex-row justify-between items-center">
                        <Text className="text-slate-500">From</Text>
                        <Text className="font-semibold text-slate-700 max-w-[200px] text-right" numberOfLines={1}>{selectedSubsidy?.name}</Text>
                    </View>
                    <View className="h-[1px] bg-slate-200 my-2" />
                        <View className="flex-row justify-between items-center">
                        <Text className="text-slate-500 text-lg">Total Amount</Text>
                        <Text className="font-bold text-3xl text-slate-900">RM {amount}</Text>
                    </View>
                </View>

                <TouchableOpacity 
                    className="bg-primary w-full py-4 rounded-xl mb-4 shadow-lg"
                    onPress={confirmTransaction}
                >
                    <Text className="text-white text-center font-bold text-lg">Confirm Payment</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    className="py-4"
                    onPress={() => setShowConfirmModal(false)}
                >
                    <Text className="text-slate-500 text-center font-bold">Cancel Transaction</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

      {/* Reusable Status Modal */}
      <TransactionStatusModal 
        visible={txStatus !== 'idle'}
        status={txStatus === 'pending' ? 'pending' : txStatus === 'success' ? 'success' : 'fail'} 
        txHash="0x123...abc" // Mock hash for spending
        message={`Paid RM${amount} to ${merchant?.name}`}
        onClose={() => {
            setTxStatus('idle');
            setAmount('');
            setSelectedSubsidyId(null);
            setMerchant(null);
        }}
      />
    </SafeAreaView>
  );
}
