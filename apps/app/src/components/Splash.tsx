import { ActivityIndicator, View } from 'react-native';
import { palette, space } from '@/theme/tokens';
import { Logo } from './Logo';

export function Splash() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: palette.ground,
        alignItems: 'center',
        justifyContent: 'center',
        gap: space.xl,
      }}
    >
      <Logo size={34} />
      <ActivityIndicator color={palette.textFaint} />
    </View>
  );
}
