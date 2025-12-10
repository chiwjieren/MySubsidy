import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import TransactionStatusModal from '@/components/TransactionStatusModal';
import { useSubsidy, Subsidy } from '@/context/SubsidyContext';

type ClaimStatus = 'idle' | 'checking' | 'claiming' | 'success' | 'fail';

export default function SubsidyClaimPage() {
  const router = useRouter();
  const { subsidies, claimSubsidy } = useSubsidy();
  
  const [activeItem, setActiveItem] = useState<Subsidy | null>(null);
  const [claimStatus, setClaimStatus] = useState<ClaimStatus>('idle');
  const [modalVisible, setModalVisible] = useState(false);
  const [txHash, setTxHash] = useState('');

  const handleInitialClick = (item: Subsidy) => {
      setActiveItem(item);
      setClaimStatus('idle');
      setModalVisible(true);
  };

  const handleClaimProcess = () => {
    setModalVisible(false); // Close confirmation modal
    setClaimStatus('checking'); // Start generic modal

    // Simulate Eligibility Check
    setTimeout(() => {
        if (activeItem?.id === 'mykasih') {
            // Mock Ineligible Scenario
            setClaimStatus('fail');
        } else {
            // Mock Eligible Scenario
            setClaimStatus('claiming'); // Still pending in generic modal terms
            
            // Simulate Blockchain Transaction
            setTimeout(() => {
                setTxHash('0x7f9a...3b21');
                setClaimStatus('success');
                
                // Update global state
                if (activeItem) {
                    claimSubsidy(activeItem.id);
                }
            }, 2000);
        }
    }, 2000);
  };

  const handleCloseModal = () => {
      setModalVisible(false);
      setActiveItem(null);
      setClaimStatus('idle');
      setTxHash('');
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="flex-1 px-5 py-6">
         {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
             <View>
                <Text className="text-2xl font-bold text-slate-900">Claim Subsidies</Text>
                <Text className="text-slate-500">Check eligibility and claim now</Text>
            </View>
            <TouchableOpacity onPress={() => router.back()} className="bg-slate-200 p-2 rounded-full">
                 <Ionicons name="close" size={24} color="#0f172a" />
            </TouchableOpacity>
        </View>

        {/* Subsidy Grid */}
        <View className="flex-1 gap-5 pb-8">
            {subsidies.map(item => (
                <View 
                    key={item.id} 
                    className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-200 ${item.status === 'claimed' ? 'opacity-70 bg-slate-50' : ''}`}
                >
                    <View className="flex-row justify-between items-start mb-3">
                        <View className={`rounded-lg px-3 py-1 ${
                            item.id === 'bkk' ? 'bg-blue-50' : item.id === 'mykasih' ? 'bg-emerald-50' : 'bg-orange-50'
                        }`}>
                             <Text className={`text-xs font-bold uppercase tracking-wide ${
                                 item.id === 'bkk' ? 'text-blue-700' : item.id === 'mykasih' ? 'text-emerald-700' : 'text-orange-700'
                             }`}>{item.id}</Text>
                        </View>
                        {item.status === 'claimed' && (
                             <View className="flex-row items-center bg-emerald-100 px-2 py-1 rounded-md">
                                 <Ionicons name="checkmark-done" size={14} color="#059669" />
                                 <Text className="text-emerald-700 text-xs font-bold ml-1">Claimed</Text>
                             </View>
                        )}
                    </View>
                    
                    <Text className="text-xl font-bold text-slate-900 mb-2">{item.name}</Text>
                    <Text className="text-slate-500 text-sm mb-6 leading-6">{item.description}</Text>
                    
                    <View className="flex-row justify-between items-center mt-auto pt-5 border-t border-slate-100">
                        <View>
                             <Text className="text-xs text-slate-400 font-bold uppercase tracking-wider">Amount</Text>
                             <Text className="text-2xl font-bold text-slate-900">RM {item.amount}</Text>
                        </View>
                        
                        {item.status === 'available_to_claim' ? (
                            <TouchableOpacity 
                                className="bg-primary px-8 py-3 rounded-xl shadow-lg active:bg-primary-dark"
                                onPress={() => handleInitialClick(item)}
                            >
                                <Text className="text-white font-bold text-base">Claim Now</Text>
                            </TouchableOpacity>
                        ) : (
                             <TouchableOpacity 
                                className="bg-slate-200 px-8 py-3 rounded-xl"
                                disabled
                            >
                                <Text className="text-slate-500 font-bold text-base">{item.status === 'claimed' ? 'Details' : 'Ineligible'}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            ))}
        </View>
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
           <View className="flex-1 bg-slate-900/60 justify-center items-center px-5">
               <View className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
                  <Text className="text-2xl font-bold text-center mb-4 text-slate-900">Eligibility Check</Text>
                  <Text className="text-slate-500 text-center mb-8 leading-6">
                      We need to verify your eligibility with relevant agencies before granting this subsidy of <Text className="font-bold text-slate-900">RM {activeItem?.amount}</Text>.
                  </Text>
                  <TouchableOpacity 
                      className="bg-primary py-4 rounded-xl w-full mb-4 shadow-lg active:bg-primary-dark"
                      onPress={handleClaimProcess}
                  >
                      <Text className="text-white text-center font-bold text-lg">Check & Claim</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="py-3" onPress={handleCloseModal}>
                       <Text className="text-slate-500 text-center font-bold hover:text-slate-700">Cancel</Text>
                  </TouchableOpacity>
               </View>
           </View>
      </Modal>

      {/* Generic Status Modal */}
      <TransactionStatusModal
        visible={claimStatus !== 'idle'}
        status={claimStatus === 'success' ? 'success' : claimStatus === 'fail' ? 'fail' : 'pending'}
        txHash={txHash}
        message={claimStatus === 'success' 
            ? `You have successfully claimed RM ${activeItem?.amount}. Your balance has been updated.` 
            : claimStatus === 'fail' 
                ? "Based on our records, you do not meet the criteria for this subsidy at this time." 
                : "Interacting with JPN/LHDN and Smart Contracts..."}
        onClose={handleCloseModal}
      />
    </SafeAreaView>
  );
}
