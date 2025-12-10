import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useSubsidy } from '@/context/SubsidyContext';

export default function Dashboard() {
  const router = useRouter();
  const { totalBalance, subsidies, logout } = useSubsidy();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-5 pt-2" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
            <TouchableOpacity className="w-10 h-10 border border-gray-200 rounded-xl items-center justify-center bg-white">
                <Ionicons name="grid-outline" size={20} color="black" />
            </TouchableOpacity>
            
            <View className="flex-row items-center gap-2">
                 <Ionicons name="wallet" size={24} color="#5b50e6" />
                 <Text className="text-xl font-bold text-[#5b50e6] tracking-tight">MySubsidy</Text>
            </View>

            <TouchableOpacity className="w-10 h-10 border border-gray-200 rounded-xl items-center justify-center bg-white" onPress={() => {
                 if (Platform.OS === 'web') {
                    if (window.confirm("Are you sure you want to logout?")) {
                        logout();
                        // Navigation is handled automatically by RootLayout
                    }
                 } else {
                     Alert.alert("Logout", "Are you sure?", [
                        { text: "Cancel" },
                        { text: "Logout", style: 'destructive', onPress: () => { logout(); } }
                     ]);
                 }
            }}>
                <Ionicons name="log-out-outline" size={22} color="black" />
            </TouchableOpacity>
        </View>

        {/* Greeting & Search */}
        <Text className="text-gray-500 font-medium mb-1">Good Morning,</Text>
        <Text className="text-3xl font-bold text-gray-900 mb-6">Ian Jie Shan</Text>

        <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 mb-8">
            <Ionicons name="search-outline" size={20} color="gray" />
            <Text className="text-gray-400 ml-3 flex-1">Search subsidies...</Text>
            <Ionicons name="mic-outline" size={20} color="gray" />
        </View>

        {/* Hero Card (Lime Green Style) */}
        <View className="bg-[#Dbf26e] rounded-3xl p-6 mb-8 relative overflow-hidden">
            {/* Background Decor */}
             <View className="absolute -right-5 top-10 w-32 h-32 bg-[#cbea4a] rounded-full opacity-50" />

            <Text className="text-gray-800 font-bold text-lg max-w-[70%] mb-2">Total Subsidy Balance</Text>
            <Text className="text-gray-400 text-xs font-medium mb-4 uppercase tracking-wider">Available Funds</Text>
            
            <Text className="text-4xl font-extrabold text-gray-900 mb-4">RM {totalBalance.toFixed(2)}</Text>

            <View className="flex-row items-center">
                <View className="bg-[#5b50e6] px-3 py-1.5 rounded-full mr-3">
                     <Text className="text-white text-xs font-bold">Active</Text>
                </View>
                <Text className="text-gray-800 font-medium text-sm">{subsidies.filter(s => s.status === 'claimed').length} Programs Enrolled</Text>
            </View>
            
            {/* Illustration Placeholder (Books/Coins) */}
            <View className="absolute bottom-4 right-4 opacity-10">
                <Ionicons name="wallet" size={80} color="black" />
            </View>
        </View>

        {/* Quick Actions (Pills) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8 flex-row pb-2">
             <Link href="/spending" asChild>
                <TouchableOpacity className="bg-[#5b50e6] px-6 py-3 rounded-full mr-3 shadow-sm shadow-indigo-200">
                    <Text className="text-white font-bold">Scan & Pay</Text>
                </TouchableOpacity>
             </Link>
             
             <Link href="/claim" asChild>
                <TouchableOpacity className="bg-white border border-gray-200 px-6 py-3 rounded-full mr-3">
                    <Text className="text-gray-600 font-bold">Claims</Text>
                </TouchableOpacity>
             </Link>

             <TouchableOpacity className="bg-white border border-gray-200 px-6 py-3 rounded-full mr-3">
                 <Text className="text-gray-600 font-bold">History</Text>
             </TouchableOpacity>

             <TouchableOpacity className="bg-white border border-gray-200 px-6 py-3 rounded-full mr-3">
                 <Text className="text-gray-600 font-bold">Profile</Text>
             </TouchableOpacity>
        </ScrollView>

        {/* Categories / List (Sociology Card Style) */}
        <View className="flex-row justify-between items-center mb-4">
             <Text className="text-xl font-bold text-gray-900">Your Subsidies</Text>
             <TouchableOpacity>
                 <Ionicons name="options-outline" size={24} color="gray" />
             </TouchableOpacity>
        </View>

        <View className="gap-4 mb-20">
             {subsidies.map((item) => (
                 <View key={item.id} className="bg-[#eff0f6] p-4 rounded-3xl flex-row items-center">
                     <View className={`w-12 h-12 ${item.color.replace('bg-', 'bg-opacity-20 bg-')} rounded-full items-center justify-center mr-4`}>
                         <Ionicons 
                            name={item.id === 'bkk' ? 'people' : item.id === 'mykasih' ? 'fast-food' : 'book'} 
                            size={24} 
                            color="#5b50e6" 
                         />
                     </View>
                     <View className="flex-1">
                         <Text className="font-bold text-gray-900 text-lg">{item.name}</Text>
                         <Text className="text-gray-500 text-sm">{item.description}</Text>
                     </View>
                     <View className="items-end">
                          <View className={`px-2 py-1 rounded-md mb-1 ${item.status === 'claimed' ? 'bg-green-100' : 'bg-gray-200'}`}>
                               <Text className={`text-xs font-bold ${item.status === 'claimed' ? 'text-green-700' : 'text-gray-500'}`}>
                                   {item.status === 'claimed' ? 'Active' : 'Not Claimed'}
                               </Text>
                          </View>
                          <Text className="text-gray-900 font-bold">RM {(item.amount - (item.spent || 0)).toFixed(0)}</Text>
                     </View>
                 </View>
             ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
