import { ScrollView, Switch, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CATEGORIES, type Category } from '@view/shared';
import { layout, palette, radius, space } from '@/theme/tokens';
import { BackBar } from '@/components/BackBar';
import { Txt } from '@/components/Txt';
import { Chip } from '@/components/Chip';
import { PillButton } from '@/components/PillButton';
import { Rail } from '@/components/Rail';
import {
  useFavoritesQuery,
  useHistoryQuery,
  useMeQuery,
  useUpdatePreferencesMutation,
} from '@/store/api';
import { clearSession } from '@/store';

export default function Profile() {
  const router = useRouter();
  const { data: me } = useMeQuery();
  const { data: favorites } = useFavoritesQuery();
  const { data: history } = useHistoryQuery();
  const [updatePrefs] = useUpdatePreferencesMutation();

  const prefs = me?.preferences;
  const favCats = new Set<Category>(prefs?.favoriteCategories ?? []);
  const toggleCategory = (c: Category) => {
    const next = new Set(favCats);
    next.has(c) ? next.delete(c) : next.add(c);
    void updatePrefs({ favoriteCategories: [...next] });
  };
  const watched = (history ?? []).filter((h) => h.type === 'view').map((h) => h.item);

  const Wrap = ({ children }: { children: React.ReactNode }) => (
    <View style={{ maxWidth: 720, width: '100%', alignSelf: 'center', paddingHorizontal: layout.gutter }}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.ground }} edges={['top']}>
      <BackBar onBack={() => (router.canGoBack() ? router.back() : router.replace('/(app)'))} title="Account" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 96, gap: space.section }}>
        <Wrap>
          <View style={{ gap: space.md, paddingTop: space.xl }}>
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: radius.pill,
                borderWidth: 1,
                borderColor: palette.lineHi,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Txt variant="title">{me?.displayName?.[0]?.toUpperCase() ?? '·'}</Txt>
            </View>
            <View style={{ gap: 2 }}>
              <Txt variant="title">{me?.displayName ?? 'You'}</Txt>
              <Txt variant="meta" color={palette.textDim}>{me?.email}</Txt>
            </View>
          </View>
        </Wrap>

        <Wrap>
          <View style={{ gap: space.lg }}>
            <Txt variant="section">Preferred categories</Txt>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
              {CATEGORIES.map((c) => (
                <Chip key={c} label={c} active={favCats.has(c)} onPress={() => toggleCategory(c)} />
              ))}
            </View>

            {prefs?.favoriteGenres?.length ? (
              <>
                <Txt variant="section" style={{ marginTop: space.sm }}>Genres you watch</Txt>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
                  {prefs.favoriteGenres.map((g) => (
                    <Chip key={g} label={g} />
                  ))}
                </View>
              </>
            ) : null}

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: space.sm,
                borderTopWidth: 1,
                borderTopColor: palette.line,
                paddingTop: space.lg,
              }}
            >
              <View style={{ flex: 1, paddingRight: space.lg, gap: 2 }}>
                <Txt variant="body">Upcoming match reminders</Txt>
                <Txt variant="meta" color={palette.textFaint}>A local notification 15 minutes before kickoff.</Txt>
              </View>
              <Switch
                value={prefs?.matchNotifications ?? true}
                onValueChange={(v) => {
                  void updatePrefs({ matchNotifications: v });
                }}
                trackColor={{ true: palette.text, false: palette.surfaceHi }}
                thumbColor={palette.ground}
              />
            </View>
          </View>
        </Wrap>

        {favorites && favorites.length > 0 ? <Rail title="Favorites" items={favorites} /> : null}
        {watched.length > 0 ? <Rail title="Watch history" items={watched} /> : null}

        <Wrap>
          <PillButton label="Sign out" variant="outline" onPress={() => clearSession()} />
        </Wrap>
      </ScrollView>
    </SafeAreaView>
  );
}
