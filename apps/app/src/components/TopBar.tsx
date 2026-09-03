import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { layout, palette, space } from '@/theme/tokens';
import { Logo } from './Logo';
import { Txt } from './Txt';

export function TopBar({ right }: { right?: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        paddingTop: insets.top + space.sm,
        paddingBottom: space.md,
        paddingHorizontal: layout.screenPadding,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: palette.line,
        backgroundColor: palette.ground,
      }}
    >
      <Logo size={20} />
      {right ?? <Txt variant="label" color={palette.textFaint}>Ad-free</Txt>}
    </View>
  );
}
