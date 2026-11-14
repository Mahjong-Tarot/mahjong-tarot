import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { color, font } from '../../lib/theme';

const icon = (name) => ({ color: c, size }) => <Ionicons name={name} size={size - 2} color={c} />;

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: color.fire600,
        tabBarInactiveTintColor: color.ink3,
        tabBarLabelStyle: { fontFamily: font.bodyMedium, fontSize: 11 },
        tabBarStyle: { borderTopColor: color.rule, backgroundColor: color.paper },
      }}
    >
      <Tabs.Screen name="today" options={{ title: 'Today', tabBarIcon: icon('sunny-outline') }} />
      <Tabs.Screen name="chart" options={{ title: 'My Chart', tabBarIcon: icon('grid-outline') }} />
      <Tabs.Screen name="readings" options={{ title: 'Reports', tabBarIcon: icon('book-outline') }} />
      <Tabs.Screen name="me" options={{ title: 'Me', tabBarIcon: icon('person-outline') }} />
    </Tabs>
  );
}
