import { View } from 'react-native';
import { palette, radius, space } from '@/theme/tokens';
import { Txt } from './Txt';

export function Badge({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: 'neutral' | 'live' | 'accent';
}) {
  const color =
    tone === 'live' ? palette.danger : tone === 'accent' ? palette.accentHi : palette.textDim;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: tone === 'neutral' ? palette.line : color,
        borderRadius: radius.pill,
        paddingVertical: 3,
        paddingHorizontal: space.sm,
      }}
    >
      {tone === 'live' ? (
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: palette.danger }} />
      ) : null}
      <Txt variant="label" color={color}>
        {label}
      </Txt>
    </View>
  );
}

/** "Starts in 3h" / "Tomorrow 20:00" for sports kickoffs. */
export function startsLabel(startsAt: string | null): string | null {
  if (!startsAt) return null;
  const ms = new Date(startsAt).getTime() - Date.now();
  if (Number.isNaN(ms)) return null;
  const mins = Math.round(ms / 60000);
  if (mins <= 0 && mins > -180) return 'LIVE';
  if (mins <= 0) return null;
  if (mins < 60) return `IN ${mins}M`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `IN ${hrs}H`;
  const days = Math.round(hrs / 24);
  return `IN ${days}D`;
}
