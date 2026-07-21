import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { colors, minTouchTarget, radii, spacing, typography } from '@/constants/theme';
import { getBoard, getBoards, linkBoards } from '@/services/storage';
import type { Board } from '@/types';

export default function LinkBoardsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [available, setAvailable] = useState<Board[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    const [board, allBoards] = await Promise.all([getBoard(id), getBoards()]);
    const linkedIds = new Set(board?.linkedBoardIds ?? []);
    setAvailable(allBoards.filter((other) => other.id !== id && !linkedIds.has(other.id)));
    setSelected(new Set());
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function toggle(boardId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(boardId)) {
        next.delete(boardId);
      } else {
        next.add(boardId);
      }
      return next;
    });
  }

  async function handleLink() {
    if (selected.size === 0) {
      router.back();
      return;
    }
    await Promise.all(Array.from(selected).map((targetId) => linkBoards(id, targetId)));
    router.back();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>
        Link boards to create categories — tapping a linked board here jumps straight to it.
      </Text>

      {available.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No other boards to link. Create another board first.</Text>
        </View>
      ) : (
        <FlatList
          data={available}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const isSelected = selected.has(item.id);
            return (
              <Pressable
                style={[styles.row, isSelected && styles.rowSelected]}
                onPress={() => toggle(item.id)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={item.name}
              >
                <Ionicons name="folder-open" size={28} color={colors.primaryDark} />
                <Text style={styles.rowLabel}>{item.name}</Text>
                <Ionicons
                  name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                  size={26}
                  color={isSelected ? colors.primary : colors.border}
                />
              </Pressable>
            );
          }}
        />
      )}

      <Pressable style={styles.linkButton} onPress={handleLink} accessibilityRole="button">
        <Text style={styles.linkButtonText}>
          {selected.size > 0 ? `Link ${selected.size} to Board` : 'Done'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hint: { ...typography.body, color: colors.textMuted, padding: spacing.md },
  list: { paddingHorizontal: spacing.md, gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.sm,
    minHeight: minTouchTarget,
  },
  rowSelected: { borderColor: colors.primary },
  rowLabel: { ...typography.label, color: colors.text, flex: 1 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
  linkButton: {
    margin: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    minHeight: minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkButtonText: { ...typography.label, color: colors.surface },
});
