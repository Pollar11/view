import { Pressable } from 'react-native';
import { palette, radius, space, type } from '@/theme/tokens';
import { Txt } from './Txt';

export function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderWidth: 1,
        borderColor: active ? palette.text : palette.line,
        backgroundColor: active ? palette.text : 'transparent',
        borderRadius: radius.pill,
        paddingVertical: space.sm,
        paddingHorizontal: space.md + 2,
      }}
    >
      <Txt style={{ ...type.label, color: active ? palette.black : palette.textDim }}>{label}</Txt>
    </Pressable>
  );
}
