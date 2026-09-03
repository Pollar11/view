import { useRef } from 'react';
import { ActivityIndicator, Animated, Platform, Pressable, type ViewStyle } from 'react-native';
import { palette, radius, space, type } from '@/theme/tokens';
import { Txt } from './Txt';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: 'solid' | 'glass' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  size?: 'md' | 'sm';
  style?: ViewStyle;
}

/** tesla.com-style pill: a solid light action paired with a translucent secondary. */
export function PillButton({
  label,
  onPress,
  variant = 'solid',
  loading,
  disabled,
  size = 'md',
  style,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const to = (v: number) =>
    Animated.spring(scale, { toValue: v, useNativeDriver: true, speed: 40, bounciness: 0 }).start();

  const bg =
    variant === 'solid'
      ? palette.text
      : variant === 'glass'
        ? 'rgba(255,255,255,0.12)'
        : 'transparent';
  const fg = variant === 'solid' ? palette.black : palette.text;
  const borderColor = variant === 'outline' ? palette.lineHi : 'transparent';
  const padV = size === 'sm' ? space.sm + 1 : space.md;
  const padH = size === 'sm' ? space.lg : space.xl;

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        accessibilityRole="button"
        disabled={disabled || loading}
        onPressIn={() => to(0.96)}
        onPressOut={() => to(1)}
        onPress={onPress}
        style={{
          backgroundColor: bg,
          borderColor,
          borderWidth: variant === 'outline' ? 1 : 0,
          borderRadius: radius.pill,
          paddingVertical: padV,
          paddingHorizontal: padH,
          minWidth: 128,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.45 : 1,
          ...(Platform.OS === 'web' && variant === 'glass'
            ? { backdropFilter: 'blur(8px)' }
            : null),
        }}
      >
        {loading ? (
          <ActivityIndicator color={fg} size="small" />
        ) : (
          <Txt style={{ ...type.label, color: fg, letterSpacing: 1.4 }}>{label}</Txt>
        )}
      </Pressable>
    </Animated.View>
  );
}
