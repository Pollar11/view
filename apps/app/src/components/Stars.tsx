import { Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { palette, space } from '@/theme/tokens';
import { Txt } from './Txt';

export function Stars({
  value,
  onRate,
  size = 26,
}: {
  value: number;
  onRate?: (v: number) => void;
  size?: number;
}) {
  return (
    <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(value);
        return (
          <Pressable key={n} onPress={() => onRate?.(n)} hitSlop={6} disabled={!onRate}>
            <Svg width={size} height={size} viewBox="0 0 24 24">
              <Path
                d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.8 6.1 20.9l1.2-6.5L2.5 9.8l6.6-.9z"
                fill={filled ? palette.text : 'none'}
                stroke={filled ? palette.text : palette.lineHi}
                strokeWidth={1.4}
                strokeLinejoin="round"
              />
            </Svg>
          </Pressable>
        );
      })}
      {value ? (
        <Txt variant="meta" color={palette.textDim} style={{ marginLeft: space.xs }}>
          {value.toFixed(0)}/5
        </Txt>
      ) : null}
    </View>
  );
}
