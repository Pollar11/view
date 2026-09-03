import { useRouter } from 'expo-router';
import { Pressable, useWindowDimensions, View } from 'react-native';
import { layout, palette, space } from '@/theme/tokens';
import { Logo } from './Logo';
import { Txt } from './Txt';

export function Footer() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= 640;

  return (
    <View
      style={{
        borderTopWidth: 1,
        borderTopColor: palette.line,
        marginTop: space.section,
        paddingVertical: space.xxl,
        paddingHorizontal: layout.gutter,
      }}
    >
      <View
        style={{
          maxWidth: layout.maxContentWidth,
          alignSelf: 'center',
          width: '100%',
          flexDirection: wide ? 'row' : 'column',
          alignItems: wide ? 'center' : 'flex-start',
          justifyContent: 'space-between',
          gap: space.lg,
        }}
      >
        <View style={{ gap: space.sm }}>
          <Logo size={16} />
          <Txt variant="meta" color={palette.textFaint}>
            No ads. No trackers. Metadata only — nothing is streamed or stored here.
          </Txt>
        </View>
        <View style={{ flexDirection: 'row', gap: space.xl }}>
          <Pressable onPress={() => router.push('/(app)/profile')}>
            <Txt variant="label" color={palette.textDim}>Profile</Txt>
          </Pressable>
          <Pressable onPress={() => router.push('/category/movies')}>
            <Txt variant="label" color={palette.textDim}>Browse</Txt>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
