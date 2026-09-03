import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { layout, palette, space, type } from '@/theme/tokens';
import { TopBar } from '@/components/TopBar';
import { Txt } from '@/components/Txt';
import { Grid } from '@/components/Grid';
import { useSearchQuery } from '@/store/api';

function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export default function Search() {
  const [q, setQ] = useState('');
  const debounced = useDebounced(q.trim(), 280);
  const skip = debounced.length < 2;
  const { data, isFetching } = useSearchQuery({ q: debounced }, { skip });

  const empty = useMemo(() => !skip && !isFetching && data && data.items.length === 0, [skip, isFetching, data]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.ground }} edges={[]}>
      <TopBar />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 96 }} keyboardShouldPersistTaps="handled">
        <View style={{ padding: layout.screenPadding, gap: space.lg }}>
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search movies, sport, documentaries"
            placeholderTextColor={palette.textFaint}
            autoFocus
            autoCorrect={false}
            style={{
              ...type.title,
              color: palette.text,
              borderBottomWidth: 1,
              borderBottomColor: palette.lineHi,
              paddingVertical: space.md,
            }}
          />
        </View>

        {isFetching ? (
          <ActivityIndicator color={palette.textDim} style={{ marginTop: space.xxl }} />
        ) : data && data.items.length > 0 ? (
          <View style={{ gap: space.lg }}>
            <Txt variant="meta" color={palette.textFaint} style={{ paddingHorizontal: layout.screenPadding }}>
              {data.total} result{data.total === 1 ? '' : 's'}
            </Txt>
            <Grid items={data.items} />
          </View>
        ) : empty ? (
          <Txt variant="body" color={palette.textDim} center style={{ padding: space.xxl }}>
            Nothing found for “{debounced}”.
          </Txt>
        ) : (
          <Txt variant="body" color={palette.textFaint} center style={{ padding: space.xxl }}>
            Type at least two characters.
          </Txt>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
