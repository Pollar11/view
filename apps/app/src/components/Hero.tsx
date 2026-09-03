import { useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import type { Item } from '@view/shared';
import { layout, motion, palette, space } from '@/theme/tokens';
import { Txt } from './Txt';
import { Poster } from './Poster';
import { Badge, startsLabel } from './Badge';
import { PillButton } from './PillButton';

export function Hero({ items }: { items: Item[] }) {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;
  const slides = items.slice(0, 6);
  // react-native-web's native driver leaves opacity mid-transition on re-render.
  const nativeDriver = Platform.OS !== 'web';

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
      fade.setValue(0);
      Animated.timing(fade, { toValue: 1, duration: motion.slow, useNativeDriver: nativeDriver }).start();
    }, 7000);
    return () => clearInterval(t);
  }, [slides.length, fade, nativeDriver]);

  if (!slides.length) return null;
  const item = slides[index];
  const h = Math.min(Math.max(height * 0.82, 460), 880);
  const live = startsLabel(item.startsAt);
  const wide = width >= 760;

  return (
    <View style={{ height: h, backgroundColor: palette.black }}>
      <Animated.View
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: fade }}
      >
        <Poster posterUrl={item.posterUrl} title={item.title} aspect={width / h} rounded={false} />
      </Animated.View>
      <LinearGradient
        colors={['rgba(11,11,12,0.35)', 'rgba(11,11,12,0.08)', 'rgba(11,11,12,0.55)', palette.ground]}
        locations={[0, 0.35, 0.78, 1]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          alignItems: wide ? 'center' : 'flex-start',
          paddingHorizontal: layout.gutter,
          paddingBottom: space.xxl,
          maxWidth: layout.maxContentWidth,
          width: '100%',
          alignSelf: 'center',
        }}
      >
        <View style={{ alignItems: wide ? 'center' : 'flex-start', gap: space.md, maxWidth: 760 }}>
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            <Badge label={item.category} />
            {live ? <Badge label={live} tone={live === 'LIVE' ? 'live' : 'neutral'} /> : null}
          </View>
          <Txt
            variant={wide ? 'display' : 'hero'}
            center={wide}
            numberOfLines={2}
          >
            {item.title}
          </Txt>
          <Txt
            variant="body"
            color={palette.textDim}
            center={wide}
            numberOfLines={2}
            style={{ maxWidth: 560 }}
          >
            {item.description}
          </Txt>
          <View style={{ flexDirection: 'row', gap: space.md, marginTop: space.sm }}>
            <PillButton label="Watch" onPress={() => router.push(`/item/${item.id}`)} />
            <PillButton label="Details" variant="glass" onPress={() => router.push(`/item/${item.id}`)} />
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.xl }}>
          {slides.map((s, i) => (
            <Pressable key={s.id} onPress={() => setIndex(i)} hitSlop={8}>
              <View
                style={{
                  width: i === index ? 26 : 7,
                  height: 3,
                  borderRadius: 2,
                  backgroundColor: i === index ? palette.text : palette.lineHi,
                }}
              />
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}
