import { ScrollView, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CATEGORIES, type Category } from '@view/shared';
import { layout, palette, radius, space } from '@/theme/tokens';
import { TopBar } from '@/components/TopBar';
import { Txt } from '@/components/Txt';
import { Chip } from '@/components/Chip';
import { Button } from '@/components/Button';
import { Rail } from '@/components/Rail';
import {
  useFavoritesQuery,
  useHistoryQuery,
  useMeQuery,
  useUpdatePreferencesMutation,
} from '@/store/api';
import { clearSession } from '@/store';

export default function Profile() {
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.ground }} edges={[]}>
      <TopBar />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 96, gap: space.xxl }}>
        {/* identity */}
        <View style={{ padding: layout.screenPadding, gap: space.sm }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: radius.pill,
              borderWidth: 1,
              borderColor: palette.lineHi,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: space.sm,
            }}
          >
            <Txt variant="title">{me?.displayName?.[0]?.toUpperCase() ?? '·'}</Txt>
          </View>
          <Txt variant="title">{me?.displayName ?? 'You'}</Txt>
          <Txt variant="meta" color={palette.textDim}>
            {me?.email}
          </Txt>
        </View>

        {/* preferences */}
        <View style={{ paddingHorizontal: layout.screenPadding, gap: space.md }}>
          <Txt variant="section">Preferred categories</Txt>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {CATEGORIES.map((c) => (
              <Chip key={c} label={c} active={favCats.has(c)} onPress={() => toggleCategory(c)} />
            ))}
          </View>

          {prefs?.favoriteGenres?.length ? (
            <>
              <Txt variant="section" style={{ marginTop: space.md }}>
                Genres you watch
              </Txt>
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
              marginTop: space.md,
              borderTopWidth: 1,
              borderTopColor: palette.line,
              paddingTop: space.md,
            }}
          >
            <View style={{ flex: 1, paddingRight: space.lg }}>
              <Txt variant="body">Upcoming match reminders</Txt>
              <Txt variant="meta" color={palette.textFaint}>
                A local notification 15 minutes before kickoff.
              </Txt>
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

        {favorites && favorites.length > 0 ? <Rail title="Favorites" items={favorites} /> : null}
        {watched.length > 0 ? <Rail title="Watch history" items={watched} /> : null}

        <View style={{ paddingHorizontal: layout.screenPadding, marginTop: space.md }}>
          <Button label="Sign out" variant="danger" onPress={() => clearSession()} full />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
