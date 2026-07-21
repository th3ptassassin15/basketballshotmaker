import { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { AACButtonTile } from '@/components/AACButtonTile';
import { ButtonActionSheet } from '@/components/ButtonActionSheet';
import { colors, spacing, typography } from '@/constants/theme';
import { deleteButton, getBoard, getButtons } from '@/services/storage';
import { speak } from '@/services/speech';
import type { AACButtonData, Board } from '@/types';

export default function BoardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [board, setBoard] = useState<Board | null>(null);
  const [buttons, setButtons] = useState<AACButtonData[]>([]);
  const [activeButton, setActiveButton] = useState<AACButtonData | null>(null);

  const load = useCallback(async () => {
    const [foundBoard, allButtons] = await Promise.all([getBoard(id), getButtons()]);
    if (!foundBoard) return;
    setBoard(foundBoard);

    const buttonById = new Map(allButtons.map((button) => [button.id, button]));
    setButtons(
      foundBoard.buttonIds
        .map((buttonId) => buttonById.get(buttonId))
        .filter((button): button is AACButtonData => Boolean(button))
    );
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function handleDelete(button: AACButtonData) {
    setActiveButton(null);
    Alert.alert('Delete this button?', `"${button.label}" will be removed everywhere it's used.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteButton(button.id);
          load();
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: board?.name ?? 'Board',
          headerRight: () => (
            <View style={styles.headerActions}>
              <Pressable
                onPress={() => router.push({ pathname: '/board/[id]/add-buttons', params: { id } })}
                accessibilityRole="button"
                accessibilityLabel="Add buttons to this board"
                style={styles.headerButton}
              >
                <Ionicons name="add-circle-outline" size={26} color={colors.primaryDark} />
              </Pressable>
              <Pressable
                onPress={() => router.push({ pathname: '/board/[id]/settings', params: { id } })}
                accessibilityRole="button"
                accessibilityLabel="Board settings"
                style={styles.headerButton}
              >
                <Ionicons name="settings-outline" size={24} color={colors.primaryDark} />
              </Pressable>
            </View>
          ),
        }}
      />

      {buttons.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            No buttons here yet. Tap the + above to add buttons from your library.
          </Text>
        </View>
      ) : (
        <FlatList
          data={buttons}
          key={board?.columns ?? 3}
          numColumns={board?.columns ?? 3}
          keyExtractor={(item) => item.id}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <AACButtonTile
              label={item.label}
              imageUri={item.imageUri}
              onPress={() => speak(item.label)}
              onLongPress={() => setActiveButton(item)}
            />
          )}
        />
      )}

      <ButtonActionSheet
        visible={activeButton !== null}
        label={activeButton?.label ?? ''}
        onEdit={() => {
          if (!activeButton) return;
          const buttonId = activeButton.id;
          setActiveButton(null);
          router.push({ pathname: '/button/[id]/edit', params: { id: buttonId } });
        }}
        onDelete={() => activeButton && handleDelete(activeButton)}
        onClose={() => setActiveButton(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerActions: { flexDirection: 'row', gap: spacing.sm, marginRight: spacing.sm },
  headerButton: { padding: spacing.xs },
  grid: { padding: spacing.md, paddingBottom: spacing.xl },
  row: { gap: spacing.md, marginBottom: spacing.md },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
});
