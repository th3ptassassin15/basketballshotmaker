import { Stack } from 'expo-router';

import { colors } from '@/constants/theme';

export default function FirstThenLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'First / Then' }} />
      <Stack.Screen name="new" options={{ title: 'New First / Then', presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ title: '', headerShown: false }} />
    </Stack>
  );
}
