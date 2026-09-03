import { ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isCategory } from '@view/shared';
import { layout, palette, space } from '@/theme/tokens';
import { Txt } from '@/components/Txt';
import { BackBar } from '@/components/BackBar';
import { CategoryView } from '@/features/catalogue/CategoryView';

const TITLES: Record<string, string> = {
  movies: 'Movies',
  sports: 'Sports',
  documentaries: 'Documentaries',
};

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const category = isCategory(slug) ? slug : undefined;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.ground }} edges={['top']}>
      <BackBar onBack={() => router.back()} title={category ? TITLES[category] : 'Browse'} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 96 }}>
        <View style={{ padding: layout.screenPadding, paddingBottom: 0 }}>
          <Txt variant="title">{category ? TITLES[category] : 'Browse'}</Txt>
        </View>
        <CategoryView fixedCategory={category} showCategoryTabs={!category} />
      </ScrollView>
    </SafeAreaView>
  );
}
