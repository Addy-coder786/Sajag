import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/poppins';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SettingsProvider } from '@/state/settings';
import { C } from '@/theme';

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  // If fonts fail to load (e.g. offline web first visit), continue with system fonts.
  if (!loaded && !error) return <View style={{ flex: 1, backgroundColor: C.bg }} />;

  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg }, animation: 'slide_from_right' }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="language" />
          <Stack.Screen name="ruko" />
          <Stack.Screen name="check" />
          <Stack.Screen name="lost" />
          <Stack.Screen name="helplines" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="contacts" />
          <Stack.Screen name="practice/index" />
          <Stack.Screen name="practice/[id]" />
        </Stack>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
