import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { AACButtonTile } from '@/components/AACButtonTile';
import { colors, spacing, typography } from '@/constants/theme';
import { getBoards, getButtons } from '@/services/storage';
import { speak } from '@/services/speech';
import type { AACButtonData, Board } from '@/types';

export default function BoardsScreen() {
  const [board, setBoard] = useState<Board | null>(null);
  const [buttons, setButtons] = useState<AACButtonData[]>([]);

  const load = useCallback(async () => {
    const [boards, allButtons] = await Promise.all([getBoards(), getButtons()]);
    const primaryBoard = boards[0] ?? null;
    setBoard(primaryBoard);

    const buttonById = new Map(allButtons.map((button) => [button.id, button]));
    const ordered = (primaryBoard?.buttonIds ?? [])
      .map((id) => buttonById.get(id))
      .filter((button): button is AACButtonData => Boolean(button));
    setButtons(ordered);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{board?.name ?? 'My Buttons'}</Text>

      {buttons.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            No buttons yet. Open the Create tab to snap a photo and make your first AAC button.
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
            <AACButtonTile label={item.label} imageUri={item.imageUri} onPress={() => speak(item.label)} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: spacing.lg },
  title: { ...typography.title, color: colors.text, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  grid: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  row: { gap: spacing.md, marginBottom: spacing.md },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
});
