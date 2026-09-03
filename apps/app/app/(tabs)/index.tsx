import { useEffect } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { palette, space } from '@/theme/tokens';
import { Hero } from '@/components/Hero';
import { Rail } from '@/components/Rail';
import { Txt } from '@/components/Txt';
import { Splash } from '@/components/Splash';
import { useHomeQuery, useUpcomingQuery, useMeQuery } from '@/store/api';
import { syncMatchReminders } from '@/features/matchNotifications';

export default function Home() {
  const router = useRouter();
  const { data, isLoading, isFetching, refetch } = useHomeQuery();
  const { data: upcoming } = useUpcomingQuery();
  const { data: me } = useMeQuery();

  useEffect(() => {
    if (upcoming?.length) {
      void syncMatchReminders(upcoming, me?.preferences.matchNotifications ?? true);
    }
  }, [upcoming, me?.preferences.matchNotifications]);

  if (isLoading || !data) return <Splash />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.ground }} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 96, gap: space.xxl }}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={palette.textDim} />
        }
      >
        <Hero items={data.hero} />
        <View style={{ gap: space.xxl }}>
          {data.sections.map((section) => (
            <Rail
              key={section.key}
              title={section.title}
              items={section.items}
              onSeeAll={
                ['movies', 'sports', 'documentaries'].includes(section.key)
                  ? () => router.push(`/category/${section.key}`)
                  : undefined
              }
            />
          ))}
          {data.sections.length === 0 ? (
            <Txt variant="body" color={palette.textDim} center style={{ padding: space.xxl }}>
              Nothing in the catalogue yet. Check back after the next sync.
            </Txt>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
