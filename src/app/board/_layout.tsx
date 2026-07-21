import { Stack } from 'expo-router';

import { colors } from '@/constants/theme';

export default function BoardLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="new" options={{ title: 'New Board', presentation: 'modal' }} />
      <Stack.Screen name="[id]/index" options={{ title: '' }} />
      <Stack.Screen name="[id]/settings" options={{ title: 'Board Settings', presentation: 'modal' }} />
      <Stack.Screen name="[id]/add-buttons" options={{ title: 'Add Buttons', presentation: 'modal' }} />
      <Stack.Screen name="[id]/link-boards" options={{ title: 'Link Boards', presentation: 'modal' }} />
    </Stack>
  );
}
