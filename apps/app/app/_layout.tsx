import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Stack, useRouter, useSegments } from 'expo-router';
import { Provider } from 'react-redux';
import { bootstrapAuth, store, useAppSelector } from '@/store';
import { palette } from '@/theme/tokens';
import { Splash } from '@/components/Splash';

function Gate() {
  const router = useRouter();
  const segments = useSegments();
  const { hydrated, user } = useAppSelector((s) => s.auth);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    bootstrapAuth().finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!hydrated || !ready) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!user && !inAuthGroup) router.replace('/(auth)/login');
    else if (user && inAuthGroup) router.replace('/(tabs)');
  }, [hydrated, ready, user, segments, router]);

  if (!hydrated || !ready) return <Splash />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: palette.ground },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="item/[id]" options={{ animation: 'slide_from_bottom', presentation: 'card' }} />
      <Stack.Screen name="category/[slug]" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <SafeAreaProvider>
          <StatusBar style="light" />
          <Gate />
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
