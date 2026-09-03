import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { palette, space, type } from '@/theme/tokens';
import { Txt } from '@/components/Txt';
import { Logo } from '@/components/Logo';

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const { width } = useWindowDimensions();
  const twoUp = width >= 900;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.ground }}>
      <View style={{ flex: 1, flexDirection: twoUp ? 'row' : 'column' }}>
        {twoUp ? (
          <LinearGradient
            colors={[palette.surface, palette.ground]}
            style={{ flex: 1.1, padding: space.section, justifyContent: 'space-between' }}
          >
            <Logo size={30} />
            <View style={{ gap: space.lg }}>
              <Txt style={{ ...type.hero, fontSize: 48, lineHeight: 54, maxWidth: 460 }}>
                Everything worth watching. One screen.
              </Txt>
              <Txt variant="body" color={palette.textDim} style={{ maxWidth: 420 }}>
                Movies, live sport and documentaries — aggregated, ad-free, and
                tuned to what you actually watch.
              </Txt>
            </View>
            <Txt variant="meta" color={palette.textFaint}>
              No ads · No trackers · Your data stays yours
            </Txt>
          </LinearGradient>
        ) : null}

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'center',
              padding: space.xl,
            }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={{ width: '100%', maxWidth: 400, alignSelf: 'center', gap: space.xl }}>
              {!twoUp ? (
                <View style={{ alignItems: 'center', marginBottom: space.md }}>
                  <Logo size={30} />
                </View>
              ) : null}
              <View style={{ gap: space.sm }}>
                <Txt variant="title">{title}</Txt>
                <Txt variant="body" color={palette.textDim}>
                  {subtitle}
                </Txt>
              </View>
              {children}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}
