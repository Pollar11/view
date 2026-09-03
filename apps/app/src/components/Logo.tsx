import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { palette } from '@/theme/tokens';
import { Txt } from './Txt';

/** The View mark: a checked "v" flowing into a play arrow. */
export function Logo({ size = 22, wordmark = true }: { size?: number; wordmark?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Svg width={size * 1.4} height={size} viewBox="0 0 56 40" fill="none">
        <Path
          d="M6 8 L20 32 L30 12"
          stroke={palette.text}
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M26 20 C34 22 40 20 46 12 M46 12 L38 12 M46 12 L46 20"
          stroke={palette.text}
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
      {wordmark ? (
        <Txt style={{ fontSize: size * 0.9, fontWeight: '300', letterSpacing: 1 }}>view</Txt>
      ) : null}
    </View>
  );
}
