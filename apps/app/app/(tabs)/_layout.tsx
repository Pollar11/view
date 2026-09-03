import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { palette, type } from '@/theme/tokens';

function Icon({ name, color }: { name: string; color: string }) {
  const p = { stroke: color, strokeWidth: 1.6, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      {name === 'home' && <Path d="M3 10.5 12 4l9 6.5M5 9.5V20h14V9.5" {...p} />}
      {name === 'browse' && (
        <>
          <Path d="M4 5h16M4 12h16M4 19h16" {...p} />
        </>
      )}
      {name === 'search' && (
        <>
          <Circle cx={11} cy={11} r={6.5} {...p} />
          <Path d="M20 20l-4-4" {...p} />
        </>
      )}
      {name === 'profile' && (
        <>
          <Circle cx={12} cy={8} r={4} {...p} />
          <Path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" {...p} />
        </>
      )}
    </Svg>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.text,
        tabBarInactiveTintColor: palette.textFaint,
        tabBarStyle: {
          backgroundColor: Platform.OS === 'web' ? palette.ground : 'rgba(10,10,10,0.92)',
          borderTopColor: palette.line,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingTop: 8,
        },
        tabBarLabelStyle: { ...type.label, fontSize: 9 },
        sceneStyle: { backgroundColor: palette.ground },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: ({ color }) => <Icon name="home" color={color} /> }}
      />
      <Tabs.Screen
        name="browse"
        options={{ title: 'Browse', tabBarIcon: ({ color }) => <Icon name="browse" color={color} /> }}
      />
      <Tabs.Screen
        name="search"
        options={{ title: 'Search', tabBarIcon: ({ color }) => <Icon name="search" color={color} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: ({ color }) => <Icon name="profile" color={color} /> }}
      />
    </Tabs>
  );
}
