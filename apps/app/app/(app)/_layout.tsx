import { Stack } from 'expo-router';
import { palette } from '@/theme/tokens';

/** Authed area — a plain stack; navigation lives in the in-page top bar. */
export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: palette.ground },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="profile" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}
