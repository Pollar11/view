import { useRef, useState } from 'react';
import { Animated, Platform, Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import type { Item } from '@view/shared';
import { palette, radius, space } from '@/theme/tokens';
import { Txt } from './Txt';
import { Poster } from './Poster';
import { Badge, startsLabel } from './Badge';

interface Props {
  item: Item;
  width: number;
  /** Show the hover/press preview overlay (description + meta). */
  preview?: boolean;
}

export function ItemCard({ item, width, preview = true }: Props) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(0)).current;

  const nativeDriver = Platform.OS !== 'web';
  const toggle = (on: boolean) => {
    setHovered(on);
    Animated.timing(anim, { toValue: on ? 1 : 0, duration: 180, useNativeDriver: nativeDriver }).start();
    Animated.spring(lift, { toValue: on ? 1 : 0, useNativeDriver: nativeDriver, speed: 30, bounciness: 4 }).start();
  };

  const live = startsLabel(item.startsAt);
  const meta = [item.year || null, item.genres[0] || null, item.rating ? `★ ${item.rating.toFixed(1)}` : null]
    .filter(Boolean)
    .join('  ·  ');

  return (
    <Animated.View
      style={{
        width,
        transform: [{ translateY: lift.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }],
      }}
    >
      <Pressable
        onPress={() => router.push(`/item/${item.id}`)}
        onHoverIn={() => Platform.OS === 'web' && toggle(true)}
        onHoverOut={() => Platform.OS === 'web' && toggle(false)}
        onLongPress={() => preview && toggle(!hovered)}
        style={{ borderRadius: radius.md, overflow: 'hidden' }}
      >
        <Poster posterUrl={item.posterUrl} title={item.title} />

        {live ? (
          <View style={{ position: 'absolute', top: space.sm, left: space.sm }}>
            <Badge label={live} tone={live === 'LIVE' ? 'live' : 'accent'} />
          </View>
        ) : null}

        {preview ? (
          <Animated.View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: anim,
            }}
          >
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.94)']}
              style={{ flex: 1, justifyContent: 'flex-end', padding: space.md }}
            >
              <Txt variant="label" color={palette.textDim}>
                {item.category}
              </Txt>
              <Txt numberOfLines={4} style={{ marginTop: 6, fontSize: 12.5, lineHeight: 17 }}>
                {item.description || 'No description available.'}
              </Txt>
            </LinearGradient>
          </Animated.View>
        ) : null}
      </Pressable>

      <View style={{ marginTop: space.sm, gap: 2 }}>
        <Txt numberOfLines={1} style={{ fontSize: 14, fontWeight: '500' }}>
          {item.title}
        </Txt>
        {meta ? (
          <Txt variant="meta" color={palette.textFaint} numberOfLines={1}>
            {meta}
          </Txt>
        ) : null}
      </View>
    </Animated.View>
  );
}
