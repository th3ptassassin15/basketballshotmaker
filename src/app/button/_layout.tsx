import { Stack } from 'expo-router';

import { colors } from '@/constants/theme';

export default function ButtonLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="[id]/edit" options={{ title: 'Edit Button', presentation: 'modal' }} />
    </Stack>
  );
}
