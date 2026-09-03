import { Text as RNText, type TextProps, type TextStyle } from 'react-native';
import { palette, type } from '@/theme/tokens';

type Variant = keyof typeof type;

interface Props extends TextProps {
  variant?: Variant;
  color?: string;
  center?: boolean;
}

export function Txt({ variant = 'body', color, center, style, ...rest }: Props) {
  const base = type[variant] as TextStyle;
  return (
    <RNText
      {...rest}
      style={[
        base,
        { color: color ?? palette.text },
        center && { textAlign: 'center' },
        style,
      ]}
    />
  );
}
