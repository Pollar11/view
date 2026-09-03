import { useWindowDimensions, View } from 'react-native';
import { FlatList } from 'react-native';
import type { Item } from '@view/shared';
import { layout, palette, space } from '@/theme/tokens';
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
  if (w < 480) return 132;
  if (w < 900) return 156;
  return 184;
}

export function Rail({ title, items, onSeeAll }: Props) {
  const cardWidth = useCardWidth();
  if (!items?.length) return null;

  return (
    <View style={{ gap: space.md }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          paddingHorizontal: layout.screenPadding,
        }}
      >
        <Txt variant="section">{title}</Txt>
        {onSeeAll ? (
          <Txt variant="label" color={palette.textDim} onPress={onSeeAll}>
            All
          </Txt>
        ) : null}
      </View>
      <FlatList
        horizontal
        data={items}
        keyExtractor={(i) => i.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: layout.screenPadding, gap: space.md }}
        renderItem={({ item }) => <ItemCard item={item} width={cardWidth} />}
        initialNumToRender={6}
        windowSize={5}
      />
    </View>
  );
}
