import { useWindowDimensions, View } from 'react-native';
import type { Item } from '@view/shared';
import { layout, space } from '@/theme/tokens';
import { ItemCard } from './ItemCard';

export function Grid({ items }: { items: Item[] }) {
  const { width } = useWindowDimensions();
  const inner = Math.min(width, layout.maxContentWidth) - layout.screenPadding * 2;
  const cols = width < 480 ? 2 : width < 760 ? 3 : width < 1080 ? 4 : 5;
  const gap = space.md;
  const cardWidth = (inner - gap * (cols - 1)) / cols;

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap,
        paddingHorizontal: layout.screenPadding,
      }}
    >
      {items.map((item) => (
        <ItemCard key={item.id} item={item} width={cardWidth} />
      ))}
    </View>
  );
}
