import { useState } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';
import { palette, radius, space, type } from '@/theme/tokens';
import { Txt } from './Txt';

interface Props extends TextInputProps {
  label: string;
  error?: string | null;
}

export function Field({ label, error, style, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: space.sm }}>
      <Txt variant="label" color={error ? palette.danger : palette.textDim}>
        {label}
      </Txt>
      <TextInput
        placeholderTextColor={palette.textFaint}
        {...rest}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        style={[
          {
            color: palette.text,
            ...type.body,
            borderBottomWidth: 1,
            borderColor: error ? palette.danger : focused ? palette.text : palette.line,
            paddingVertical: space.md,
            borderRadius: radius.sm,
          },
          style,
        ]}
      />
      {error ? (
        <Txt variant="meta" color={palette.danger}>
          {error}
        </Txt>
      ) : null}
    </View>
  );
}
