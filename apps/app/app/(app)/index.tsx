import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, RefreshControl, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { Category } from '@view/shared';
import { palette, space } from '@/theme/tokens';
import { TopNav, type NavTarget } from '@/components/TopNav';
import { Hero } from '@/components/Hero';
import { Rail } from '@/components/Rail';
import { Grid } from '@/components/Grid';
import { SearchBar } from '@/components/SearchBar';
import { Footer } from '@/components/Footer';
import { Txt } from '@/components/Txt';
import { Splash } from '@/components/Splash';
import {
  useHomeQuery,
  useMeQuery,
  useSearchQuery,
  useUpcomingQuery,
} from '@/store/api';
import { syncMatchReminders } from '@/features/matchNotifications';

function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export default function Home() {
  const router = useRouter();
  const { data, isLoading, isFetching, refetch } = useHomeQuery();
  const { data: upcoming } = useUpcomingQuery();
  const { data: me } = useMeQuery();

  const [searching, setSearching] = useState(false);
  const [q, setQ] = useState('');
  const debouncedQ = useDebounced(q.trim(), 260);
  const searchSkip = !searching || debouncedQ.length < 2;
  const { data: results, isFetching: searchLoading } = useSearchQuery(
    { q: debouncedQ },
    { skip: searchSkip },
  );

  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const sectionY = useRef<Record<string, number>>({});

  const navProgress = scrollY.interpolate({
    inputRange: [0, 220, 320],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    if (upcoming?.length) {
      void syncMatchReminders(upcoming, me?.preferences.matchNotifications ?? true);
    }
  }, [upcoming, me?.preferences.matchNotifications]);

  const jumpTo = useCallback((t: NavTarget) => {
    const y = sectionY.current[t];
    if (y != null) scrollRef.current?.scrollTo({ y: Math.max(0, y - 72), animated: true });
  }, []);

  const openSearch = () => {
    setSearching((s) => !s);
    if (searching) setQ('');
    scrollRef.current?.scrollTo?.({ y: 0, animated: true });
  };

  const sections = useMemo(() => data?.sections ?? [], [data]);

  if (isLoading || !data) return <Splash />;

  return (
    <View style={{ flex: 1, backgroundColor: palette.ground }}>
      <TopNav
        progress={navProgress}
        forceSolid={searching}
        onJump={jumpTo}
        onSearch={openSearch}
        searchActive={searching}
      />

      <Animated.ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={palette.textDim} progressViewOffset={80} />
        }
      >
        {searching ? (
          <View style={{ paddingTop: 96 + space.sm }}>
            <SearchBar
              value={q}
              onChange={setQ}
              onClose={() => {
                setSearching(false);
                setQ('');
              }}
              resultCount={results ? results.total : null}
            />
            {searchLoading ? (
              <ActivityIndicator color={palette.textDim} style={{ marginTop: space.section }} />
            ) : debouncedQ.length < 2 ? (
              <Txt variant="body" color={palette.textFaint} center style={{ padding: space.section }}>
                Type at least two characters.
              </Txt>
            ) : results && results.items.length > 0 ? (
              <View style={{ marginTop: space.md }}>
                <Grid items={results.items} />
              </View>
            ) : (
              <Txt variant="body" color={palette.textDim} center style={{ padding: space.section }}>
                Nothing found for “{debouncedQ}”.
              </Txt>
            )}
          </View>
        ) : (
          <>
            <Hero items={data.hero} />

            <View style={{ gap: space.section, marginTop: space.xxl }}>
              {sections.map((section) => (
                <View
                  key={section.key}
                  onLayout={(e) => {
                    sectionY.current[section.key] = e.nativeEvent.layout.y;
                  }}
                >
                  <Rail
                    title={section.title}
                    items={section.items}
                    onSeeAll={
                      (['movies', 'sports', 'documentaries'] as string[]).includes(section.key)
                        ? () => router.push(`/category/${section.key as Category}`)
                        : undefined
                    }
                  />
                </View>
              ))}

              {sections.length === 0 ? (
                <Txt variant="body" color={palette.textDim} center style={{ padding: space.section }}>
                  Nothing in the catalogue yet. Pull to refresh after the next sync.
                </Txt>
              ) : null}
            </View>

            <Footer />
          </>
        )}
      </Animated.ScrollView>
    </View>
  );
}
