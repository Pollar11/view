import { Animated, Platform, Pressable, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';
import { layout, palette, space, type } from '@/theme/tokens';
import { Logo } from './Logo';
import { Txt } from './Txt';

export type NavTarget = 'movies' | 'sports' | 'documentaries';

interface Props {
  /** 0 → transparent over hero, 1 → frosted solid. */
  progress: Animated.Value | Animated.AnimatedInterpolation<number>;
  /** Force the solid background regardless of scroll (e.g. while searching). */
  forceSolid?: boolean;
  onJump?: (t: NavTarget) => void;
  onSearch?: () => void;
  searchActive?: boolean;
}

const LINKS: { key: NavTarget; label: string }[] = [
  { key: 'movies', label: 'Movies' },
  { key: 'sports', label: 'Sports' },
  { key: 'documentaries', label: 'Docs' },
];

export function TopNav({ progress, forceSolid, onJump, onSearch, searchActive }: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= 760;

  const bg = forceSolid
    ? palette.navBlur
    : progress.interpolate({
        inputRange: [0, 1],
        outputRange: ['rgba(11,11,12,0)', palette.navBlur],
      });
  const border = forceSolid
    ? 'rgba(255,255,255,0.09)'
    : progress.interpolate({
        inputRange: [0, 1],
        outputRange: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.09)'],
      });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        paddingTop: insets.top + 6,
        paddingBottom: space.md,
        paddingHorizontal: layout.gutter,
        backgroundColor: bg,
        borderBottomWidth: 1,
        borderBottomColor: border,
        ...(Platform.OS === 'web' ? { backdropFilter: 'saturate(160%) blur(14px)' } : null),
      }}
    >
      <View
        style={{
          width: '100%',
          maxWidth: layout.maxContentWidth,
          alignSelf: 'center',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Pressable onPress={() => router.push('/(app)')}>
          <Logo size={19} />
        </Pressable>

        {wide ? (
          <View style={{ flexDirection: 'row', gap: space.xl, position: 'absolute', left: 0, right: 0, justifyContent: 'center' }}>
            {LINKS.map((l) => (
              <Pressable key={l.key} onPress={() => onJump?.(l.key)} hitSlop={8}>
                <Txt style={{ ...type.label, letterSpacing: 1.4, color: palette.textDim }}>{l.label}</Txt>
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg }}>
          <Pressable onPress={onSearch} hitSlop={10}>
            <Svg width={20} height={20} viewBox="0 0 24 24">
              {searchActive ? (
                <Path d="M6 6l12 12M18 6L6 18" stroke={palette.text} strokeWidth={1.7} strokeLinecap="round" />
              ) : (
                <>
                  <Circle cx={11} cy={11} r={6.5} stroke={palette.text} strokeWidth={1.6} fill="none" />
                  <Path d="M20 20l-4.2-4.2" stroke={palette.text} strokeWidth={1.6} strokeLinecap="round" />
                </>
              )}
            </Svg>
          </Pressable>
          <Pressable onPress={() => router.push('/(app)/profile')} hitSlop={10}>
            <View
              style={{
                width: 30,
                height: 30,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: palette.lineHi,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Svg width={16} height={16} viewBox="0 0 24 24">
                <Circle cx={12} cy={8.5} r={3.6} stroke={palette.text} strokeWidth={1.5} fill="none" />
                <Path d="M5 20c1.4-3.6 4.3-5.4 7-5.4s5.6 1.8 7 5.4" stroke={palette.text} strokeWidth={1.5} fill="none" strokeLinecap="round" />
              </Svg>
            </View>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}
