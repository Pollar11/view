import { useMemo, useState } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { SafeAreaView } from 'react-native-safe-area-context';
import { layout, palette, space } from '@/theme/tokens';
import { Txt } from '@/components/Txt';
import { PillButton } from '@/components/PillButton';
import { Badge, startsLabel } from '@/components/Badge';
import { BackBar } from '@/components/BackBar';
import { Poster } from '@/components/Poster';
import { Stars } from '@/components/Stars';
import { Rail } from '@/components/Rail';
import { Splash } from '@/components/Splash';
import {
  useItemQuery,
  useItemsQuery,
  useFavoritesQuery,
  useHistoryQuery,
  useInteractMutation,
  useLazyItemSourceQuery,
} from '@/store/api';
import { errMessage } from '@/lib/errors';

export default function ItemDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= 860;

  const { data: item, isLoading } = useItemQuery(id);
  const { data: favorites } = useFavoritesQuery();
  const { data: history } = useHistoryQuery();
  const [interact] = useInteractMutation();
  const [fetchSource, { isFetching: sourceLoading }] = useLazyItemSourceQuery();
  const [watchError, setWatchError] = useState<string | null>(null);

  const related = useItemsQuery(
    item ? { category: item.category, sort: 'popular', limit: 12 } : { limit: 1 },
    { skip: !item },
  );

  const isFav = useMemo(() => favorites?.some((f) => f.id === id) ?? false, [favorites, id]);
  const myRating = useMemo(
    () => history?.find((h) => h.item.id === id && h.type === 'rating')?.value ?? 0,
    [history, id],
  );

  if (isLoading || !item) return <Splash />;

  const live = startsLabel(item.startsAt);
  const meta = [
    item.year,
    item.rating ? `★ ${item.rating.toFixed(1)}` : null,
    item.genres.slice(0, 3).join(' · ') || null,
  ]
    .filter(Boolean)
    .join('     ');

  const watch = async () => {
    setWatchError(null);
    try {
      const { url } = await fetchSource(item.id).unwrap();
      void interact({ itemId: item.id, type: 'view' });
      await WebBrowser.openBrowserAsync(url, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        controlsColor: palette.text,
        toolbarColor: palette.ground,
      });
    } catch (e) {
      setWatchError(errMessage(e, 'Could not open the source.'));
    }
  };

  const backdropH = wide ? 460 : 320;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.ground }} edges={['top']}>
      <BackBar onBack={() => (router.canGoBack() ? router.back() : router.replace('/(app)'))} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={{ height: backdropH }}>
          <Poster posterUrl={item.posterUrl} title={item.title} aspect={width / backdropH} rounded={false} />
          <LinearGradient
            colors={['rgba(11,11,12,0.15)', 'rgba(11,11,12,0.5)', palette.ground]}
            locations={[0, 0.6, 1]}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />
        </View>

        <View
          style={{
            maxWidth: layout.maxContentWidth,
            width: '100%',
            alignSelf: 'center',
            paddingHorizontal: layout.gutter,
            marginTop: -96,
            gap: space.xl,
            flexDirection: wide ? 'row' : 'column',
          }}
        >
          {wide ? (
            <View style={{ width: 232 }}>
              <Poster posterUrl={item.posterUrl} title={item.title} />
            </View>
          ) : null}

          <View style={{ flex: 1, gap: space.lg }}>
            <View style={{ flexDirection: 'row', gap: space.sm }}>
              <Badge label={item.category} />
              {live ? <Badge label={live} tone={live === 'LIVE' ? 'live' : 'neutral'} /> : null}
            </View>
            <Txt variant={wide ? 'hero' : 'title'}>{item.title}</Txt>
            {meta ? <Txt variant="meta" color={palette.textDim}>{meta}</Txt> : null}

            <View style={{ flexDirection: 'row', gap: space.md, flexWrap: 'wrap' }}>
              <PillButton label={sourceLoading ? 'Opening' : 'Watch'} onPress={watch} loading={sourceLoading} />
              <PillButton
                label={isFav ? 'Saved' : 'Add to list'}
                variant="outline"
                onPress={() => interact({ itemId: item.id, type: isFav ? 'unfavorite' : 'favorite' })}
              />
            </View>
            {watchError ? <Txt variant="meta" color={palette.danger}>{watchError}</Txt> : null}
            <Txt variant="meta" color={palette.textFaint}>
              Opens the original source in your browser. The link stays hidden until you tap Watch.
            </Txt>

            <Txt variant="body" style={{ marginTop: space.sm }}>
              {item.description || 'No description available for this title.'}
            </Txt>

            {item.tags.length > 0 ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
                {item.tags.map((t) => (
                  <View
                    key={t}
                    style={{
                      borderWidth: 1,
                      borderColor: palette.line,
                      borderRadius: 999,
                      paddingVertical: 4,
                      paddingHorizontal: 11,
                    }}
                  >
                    <Txt variant="meta" color={palette.textDim}>{t}</Txt>
                  </View>
                ))}
              </View>
            ) : null}

            <View style={{ marginTop: space.md, gap: space.sm }}>
              <Txt variant="section">Your rating</Txt>
              <Stars value={myRating} onRate={(v) => interact({ itemId: item.id, type: 'rating', value: v })} />
            </View>
          </View>
        </View>

        {related.data && related.data.items.length > 1 ? (
          <View style={{ marginTop: space.section }}>
            <Rail title="More like this" items={related.data.items.filter((i) => i.id !== item.id)} />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
