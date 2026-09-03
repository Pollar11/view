import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { palette, space } from '@/theme/tokens';
import { TopBar } from '@/components/TopBar';
import { Txt } from '@/components/Txt';
import { layout } from '@/theme/tokens';
import { CategoryView } from '@/features/catalogue/CategoryView';

export default function Browse() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.ground }} edges={[]}>
      <TopBar />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 96 }}>
        <View style={{ padding: layout.screenPadding, paddingBottom: 0, gap: space.sm }}>
          <Txt variant="title">Browse</Txt>
          <Txt variant="body" color={palette.textDim}>
            Everything in the catalogue, filtered your way.
          </Txt>
        </View>
        <CategoryView />
      </ScrollView>
    </SafeAreaView>
  );
}
