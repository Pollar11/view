import { View } from 'react-native';
import { Link, Stack } from 'expo-router';
import { palette, space } from '@/theme/tokens';
import { Txt } from '@/components/Txt';

export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <View
        style={{
          flex: 1,
          backgroundColor: palette.ground,
          alignItems: 'center',
          justifyContent: 'center',
          gap: space.lg,
          padding: space.xl,
        }}
      >
        <Txt variant="title">This screen doesn’t exist.</Txt>
        <Link href="/(app)">
          <Txt variant="label" color={palette.accentHi}>
            Go home
          </Txt>
        </Link>
      </View>
    </>
  );
}
