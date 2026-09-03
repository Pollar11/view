import { useEffect, useRef } from 'react';
import { Platform, Pressable, TextInput, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { layout, palette, radius, space, type } from '@/theme/tokens';
import { Txt } from './Txt';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onClose: () => void;
  resultCount?: number | null;
}

export function SearchBar({ value, onChange, onClose, resultCount }: Props) {
  const ref = useRef<TextInput>(null);
  useEffect(() => {
    const t = setTimeout(() => ref.current?.focus(), 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <View
      style={{
        paddingHorizontal: layout.gutter,
        paddingTop: space.sm,
        paddingBottom: space.md,
        maxWidth: layout.maxContentWidth,
        alignSelf: 'center',
        width: '100%',
        gap: space.sm,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.md,
          backgroundColor: palette.surface,
          borderWidth: 1,
          borderColor: palette.line,
          borderRadius: radius.pill,
          paddingHorizontal: space.lg,
          height: 52,
        }}
      >
        <Svg width={18} height={18} viewBox="0 0 24 24">
          <Circle cx={11} cy={11} r={6.5} stroke={palette.textDim} strokeWidth={1.6} fill="none" />
          <Path d="M20 20l-4.2-4.2" stroke={palette.textDim} strokeWidth={1.6} strokeLinecap="round" />
        </Svg>
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChange}
          placeholder="Search movies, sport, documentaries"
          placeholderTextColor={palette.textFaint}
          returnKeyType="search"
          autoCorrect={false}
          style={{
            flex: 1,
            color: palette.text,
            ...(Platform.OS === 'web' ? { outlineStyle: 'none' as never } : null),
            fontSize: type.subtitle.fontSize,
            fontWeight: '400',
          }}
        />
        <Pressable onPress={value ? () => onChange('') : onClose} hitSlop={10}>
          <Svg width={16} height={16} viewBox="0 0 24 24">
            <Path d="M6 6l12 12M18 6L6 18" stroke={palette.textDim} strokeWidth={1.8} strokeLinecap="round" />
          </Svg>
        </Pressable>
      </View>
      {resultCount != null && value.trim().length >= 2 ? (
        <Txt variant="meta" color={palette.textFaint}>
          {resultCount} result{resultCount === 1 ? '' : 's'} for “{value.trim()}”
        </Txt>
      ) : null}
    </View>
  );
}
