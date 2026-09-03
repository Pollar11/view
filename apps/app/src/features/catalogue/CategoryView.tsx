import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import type { Category, ItemQuery } from '@view/shared';
import { CATEGORIES } from '@view/shared';
import { layout, palette, space } from '@/theme/tokens';
import { Txt } from '@/components/Txt';
import { Chip } from '@/components/Chip';
import { Grid } from '@/components/Grid';
import { Button } from '@/components/Button';
import { useItemsQuery } from '@/store/api';

const SORTS: { key: NonNullable<ItemQuery['sort']>; label: string }[] = [
  { key: 'popular', label: 'Popular' },
  { key: 'newest', label: 'Newest' },
  { key: 'rating', label: 'Top rated' },
  { key: 'title', label: 'A–Z' },
];

export function CategoryView({
  fixedCategory,
  showCategoryTabs = true,
}: {
  fixedCategory?: Category;
  showCategoryTabs?: boolean;
}) {
  const [category, setCategory] = useState<Category | undefined>(fixedCategory);
  const [sort, setSort] = useState<NonNullable<ItemQuery['sort']>>('popular');
  const [genre, setGenre] = useState<string | undefined>();
  const [page, setPage] = useState(1);

  const query: ItemQuery = useMemo(
    () => ({ category, sort, genre, page, limit: 24 }),
    [category, sort, genre, page],
  );
  const { data, isFetching, isLoading } = useItemsQuery(query);

  const genres = useMemo(() => {
    const set = new Set<string>();
    data?.items.forEach((i) => i.genres.forEach((g) => set.add(g)));
    return [...set].sort().slice(0, 16);
  }, [data?.items]);

  const reset = (fn: () => void) => {
    setPage(1);
    fn();
  };

  return (
    <View style={{ gap: space.lg, paddingTop: space.md }}>
      {showCategoryTabs ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: space.sm, paddingHorizontal: layout.screenPadding }}
        >
          <Chip label="All" active={!category} onPress={() => reset(() => { setCategory(undefined); setGenre(undefined); })} />
          {CATEGORIES.map((c) => (
            <Chip
              key={c}
              label={c}
              active={category === c}
              onPress={() => reset(() => { setCategory(c); setGenre(undefined); })}
            />
          ))}
        </ScrollView>
      ) : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: space.sm, paddingHorizontal: layout.screenPadding }}
      >
        {SORTS.map((s) => (
          <Chip key={s.key} label={s.label} active={sort === s.key} onPress={() => reset(() => setSort(s.key))} />
        ))}
      </ScrollView>

      {genres.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: space.sm, paddingHorizontal: layout.screenPadding }}
        >
          <Chip label="Any genre" active={!genre} onPress={() => reset(() => setGenre(undefined))} />
          {genres.map((g) => (
            <Chip
              key={g}
              label={g}
              active={genre?.toLowerCase() === g.toLowerCase()}
              onPress={() => reset(() => setGenre(g.toLowerCase()))}
            />
          ))}
        </ScrollView>
      ) : null}

      {isLoading ? (
        <ActivityIndicator color={palette.textDim} style={{ marginTop: space.xxl }} />
      ) : data && data.items.length > 0 ? (
        <>
          <Txt variant="meta" color={palette.textFaint} style={{ paddingHorizontal: layout.screenPadding }}>
            {data.total} title{data.total === 1 ? '' : 's'}
          </Txt>
          <Grid items={data.items} />
          {data.hasNext ? (
            <View style={{ paddingHorizontal: layout.screenPadding, marginTop: space.lg }}>
              <Button
                label={isFetching ? 'Loading…' : 'Load more'}
                variant="ghost"
                onPress={() => setPage((p) => p + 1)}
                loading={isFetching}
                full
              />
            </View>
          ) : null}
        </>
      ) : (
        <Txt variant="body" color={palette.textDim} center style={{ padding: space.xxl }}>
          No titles match these filters.
        </Txt>
      )}
    </View>
  );
}
