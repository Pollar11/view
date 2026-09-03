import { FlatList, Pressable, useWindowDimensions, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { Item } from '@view/shared';
import { layout, palette, space, type } from '@/theme/tokens';
import { Txt } from './Txt';
import { ItemCard } from './ItemCard';

interface Props {
  title: string;
  items: Item[];
  onSeeAll?: () => void;
}

export function useCardWidth(): number {
  const { width } = useWindowDimensions();
  const w = Math.min(width, layout.maxContentWidth);
  if (w < 480) return 134;
  if (w < 900) return 158;
  return 178;
}

export function Rail({ title, items, onSeeAll }: Props) {
  const cardWidth = useCardWidth();
  if (!items?.length) return null;

  return (
    <View style={{ gap: space.lg }}>
      <Pressable
        onPress={onSeeAll}
        disabled={!onSeeAll}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: layout.gutter,
          maxWidth: layout.maxContentWidth,
          alignSelf: 'center',
          width: '100%',
        }}
      >
        <Txt variant="section">{title}</Txt>
        {onSeeAll ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Txt style={{ ...type.label, color: palette.textDim }}>See all</Txt>
            <Svg width={13} height={13} viewBox="0 0 24 24">
              <Path d="M9 5l7 7-7 7" stroke={palette.textDim} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
        ) : null}
      </Pressable>

      <FlatList
        horizontal
        data={items}
        keyExtractor={(i) => i.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: layout.gutter,
          gap: space.md,
          alignSelf: 'center',
        }}
        renderItem={({ item }) => <ItemCard item={item} width={cardWidth} />}
        initialNumToRender={6}
        windowSize={5}
      />
    </View>
  );
}
