import { Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { layout, palette, space } from '@/theme/tokens';
import { Txt } from './Txt';

export function BackBar({ onBack, title }: { onBack: () => void; title?: string }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.md,
        paddingHorizontal: layout.gutter,
        paddingVertical: space.md,
        borderBottomWidth: 1,
        borderBottomColor: palette.line,
      }}
    >
      <Pressable onPress={onBack} hitSlop={12} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Svg width={20} height={20} viewBox="0 0 24 24">
          <Path
            d="M15 5l-7 7 7 7"
            stroke={palette.text}
            strokeWidth={1.6}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
        <Txt variant="label" color={palette.textDim}>
          Back
        </Txt>
      </Pressable>
      {title ? (
        <Txt variant="label" color={palette.textFaint} numberOfLines={1}>
          {title}
        </Txt>
      ) : null}
    </View>
  );
}
