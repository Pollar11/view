import { useState } from 'react';
import { Image, View, type DimensionValue } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { palette, radius } from '@/theme/tokens';
import { API_URL } from '@/lib/config';
import { Txt } from './Txt';

/** Resolves the API's opaque `/media/...` path against the API origin. */
export function mediaSrc(posterUrl: string | null): string | null {
  if (!posterUrl) return null;
  if (posterUrl.startsWith('http')) return posterUrl;
  const origin = API_URL.replace(/\/api\/?$/, '');
  return `${origin}${posterUrl}`;
}

interface Props {
  posterUrl: string | null;
  title: string;
  aspect?: number;
  width?: DimensionValue;
  rounded?: boolean;
}

export function Poster({ posterUrl, title, aspect = 2 / 3, width = '100%', rounded = true }: Props) {
  const [failed, setFailed] = useState(false);
  const src = mediaSrc(posterUrl);

  return (
    <View
      style={{
        width,
        aspectRatio: aspect,
        borderRadius: rounded ? radius.md : 0,
        overflow: 'hidden',
        backgroundColor: palette.surfaceHi,
      }}
    >
      {src && !failed ? (
        <Image
          source={{ uri: src }}
          onError={() => setFailed(true)}
          resizeMode="cover"
          style={{ width: '100%', height: '100%' }}
        />
      ) : (
        <LinearGradient
          colors={[palette.surfaceHi, palette.surface]}
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}
        >
          <Txt variant="section" color={palette.textFaint} center numberOfLines={3}>
            {title}
          </Txt>
        </LinearGradient>
      )}
    </View>
  );
}
