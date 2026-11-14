import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Application from 'expo-application';
import { useFonts } from 'expo-font';
import { LibreFranklin_400Regular, LibreFranklin_600SemiBold } from '@expo-google-fonts/libre-franklin';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { EBGaramond_500Medium } from '@expo-google-fonts/eb-garamond';
import { AuthProvider, useAuth } from '../lib/auth';
import { BirthProvider, useBirth } from '../lib/birthContext';
import { fetchMobileConfig } from '../lib/api';
import { color, font } from '../lib/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

function Gate() {
  const auth = useAuth();
  const { ready: birthReady } = useBirth();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  // MOBILE_MIN_BUILD on the website: an older native build must update.
  useEffect(() => {
    const build = Number(Application.nativeBuildVersion) || 0;
    fetchMobileConfig()
      .then(({ minBuild }) => { if (Platform.OS === 'ios' && build && minBuild && build < minBuild) router.replace('/update'); })
      .catch(() => {})
      .finally(() => setChecked(true));
  }, [router]);

  useEffect(() => {
    if (auth.ready && birthReady && checked) SplashScreen.hideAsync().catch(() => {});
  }, [auth.ready, birthReady, checked]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerTintColor: color.ink,
          headerTitleStyle: { fontFamily: font.heading, fontSize: 17 },
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: color.paper },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="update" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="sign-in" options={{ title: '', presentation: 'modal' }} />
        <Stack.Screen name="signup" options={{ title: '', presentation: 'modal' }} />
        <Stack.Screen name="birth" options={{ title: 'Birth details', presentation: 'modal' }} />
        <Stack.Screen name="app/auth-callback" options={{ headerShown: false }} />
        <Stack.Screen name="almanac/[date]" options={{ title: 'Almanac' }} />
        <Stack.Screen name="readings/purple-star" options={{ title: 'Purple Star' }} />
        <Stack.Screen name="readings/new" options={{ title: 'New relationship reading' }} />
        <Stack.Screen name="readings/[slug]" options={{ title: 'Relationship reading' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    LibreFranklin_400Regular,
    LibreFranklin_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    EBGaramond_500Medium,
  });
  if (!loaded) return null;
  return (
    <AuthProvider>
      <BirthProvider>
        <Gate />
      </BirthProvider>
    </AuthProvider>
  );
}
