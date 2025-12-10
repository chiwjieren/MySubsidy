import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';
import '../global.css';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SubsidyProvider, useSubsidy } from '@/context/SubsidyContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isAuthenticated } = useSubsidy();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(tabs)';
    
    // If not authenticated and in a protected route, redirect to login
    if (!isAuthenticated && inAuthGroup) {
      router.replace('/');
    }
    
  }, [isAuthenticated, segments]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="spending" options={{ headerShown: false }} />
          <Stack.Screen name="claim" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SubsidyProvider>
      <RootLayoutNav />
    </SubsidyProvider>
  );
}
