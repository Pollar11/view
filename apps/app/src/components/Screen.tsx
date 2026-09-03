import type { ReactNode } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { layout, palette } from '@/theme/tokens';

interface Props {
  children: ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  padded?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export function Screen({
  children,
  scroll = true,
  refreshing,
  onRefresh,
  padded,
  edges = ['top'],
}: Props) {
  const inner = (
    <View
      style={{
        width: '100%',
        maxWidth: layout.maxContentWidth,
        alignSelf: 'center',
        flex: scroll ? undefined : 1,
        paddingHorizontal: padded ? layout.screenPadding : 0,
      }}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.ground }} edges={edges}>
      {scroll ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 96 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={!!refreshing}
                onRefresh={onRefresh}
                tintColor={palette.textDim}
              />
            ) : undefined
          }
        >
          {inner}
        </ScrollView>
      ) : (
        inner
      )}
    </SafeAreaView>
  );
}
