import { useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, type ViewStyle } from 'react-native';
import { palette, radius, space, type } from '@/theme/tokens';
import { Txt } from './Txt';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  full?: boolean;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  full,
  style,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const to = (v: number) =>
    Animated.spring(scale, { toValue: v, useNativeDriver: true, speed: 40, bounciness: 0 }).start();

  const bg =
    variant === 'primary' ? palette.text : variant === 'danger' ? 'transparent' : 'transparent';
  const fg =
    variant === 'primary' ? palette.black : variant === 'danger' ? palette.danger : palette.text;
  const border =
    variant === 'primary' ? palette.text : variant === 'danger' ? palette.danger : palette.lineHi;

  return (
    <Animated.View style={[{ transform: [{ scale }] }, full && { alignSelf: 'stretch' }, style]}>
      <Pressable
        accessibilityRole="button"
        disabled={disabled || loading}
        onPressIn={() => to(0.97)}
        onPressOut={() => to(1)}
        onPress={onPress}
        style={{
          backgroundColor: bg,
          borderColor: border,
          borderWidth: 1,
          borderRadius: radius.pill,
          paddingVertical: space.md + 2,
          paddingHorizontal: space.xl,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.4 : 1,
          minHeight: 48,
        }}
      >
        {loading ? (
          <ActivityIndicator color={fg} />
        ) : (
          <Txt style={{ ...type.label, color: fg }}>{label}</Txt>
        )}
      </Pressable>
    </Animated.View>
  );
}
