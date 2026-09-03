import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import type { Item } from '@view/shared';
import { layout, motion, palette, space } from '@/theme/tokens';
import { Txt } from './Txt';
import { Poster } from './Poster';
import { Badge, startsLabel } from './Badge';

export function Hero({ items }: { items: Item[] }) {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;

  const slides = items.slice(0, 5);
  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => {
      Animated.sequence([
        Animated.timing(fade, { toValue: 0, duration: motion.base, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 1, duration: motion.slow, useNativeDriver: true, delay: 40 }),
      ]).start();
      setTimeout(() => setIndex((i) => (i + 1) % slides.length), motion.base);
    }, 6000);
    return () => clearInterval(t);
  }, [slides.length, fade]);

  if (!slides.length) return null;
  const item = slides[index];
  const h = Math.min(Math.max(height * 0.62, 420), 720);
  const live = startsLabel(item.startsAt);

  return (
    <Pressable onPress={() => router.push(`/item/${item.id}`)}>
      <View style={{ height: h, backgroundColor: palette.black }}>
        <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: fade }}>
          <Poster posterUrl={item.posterUrl} title={item.title} aspect={width / h} rounded={false} />
        </Animated.View>
        <LinearGradient
          colors={['rgba(10,10,10,0.1)', 'rgba(10,10,10,0.35)', palette.ground]}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            padding: layout.screenPadding,
            paddingBottom: space.xxl,
            maxWidth: layout.maxContentWidth,
            width: '100%',
            alignSelf: 'center',
            gap: space.md,
          }}
        >
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            <Badge label={item.category} tone="accent" />
            {live ? <Badge label={live} tone={live === 'LIVE' ? 'live' : 'neutral'} /> : null}
          </View>
          <Txt variant="hero" numberOfLines={2} style={{ maxWidth: 640 }}>
            {item.title}
          </Txt>
          <Txt variant="body" color={palette.textDim} numberOfLines={2} style={{ maxWidth: 560 }}>
            {item.description}
          </Txt>
          <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.sm }}>
            {slides.map((s, i) => (
              <View
                key={s.id}
                style={{
                  width: i === index ? 22 : 8,
                  height: 3,
                  borderRadius: 2,
                  backgroundColor: i === index ? palette.text : palette.lineHi,
                }}
              />
            ))}
          </View>
        </View>
      </View>
    </Pressable>
  );
}
