import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { colors, minTouchTarget, radii, spacing, typography } from '@/constants/theme';
import { addButtonsToBoard, getBoard, getButtons } from '@/services/storage';
import type { AACButtonData } from '@/types';

export default function AddButtonsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [available, setAvailable] = useState<AACButtonData[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    const [board, allButtons] = await Promise.all([getBoard(id), getButtons()]);
    const existingIds = new Set(board?.buttonIds ?? []);
    setAvailable(allButtons.filter((button) => !existingIds.has(button.id)));
    setSelected(new Set());
  }, [id]);

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return available;
    return available.filter((button) => button.label.toLowerCase().includes(trimmed));
  }, [available, query]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function toggle(buttonId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(buttonId)) {
        next.delete(buttonId);
      } else {
        next.add(buttonId);
      }
      return next;
    });
  }

  async function handleAdd() {
    if (selected.size === 0) {
      router.back();
      return;
    }
    await addButtonsToBoard(id, Array.from(selected));
    router.back();
  }

  return (
    <View style={styles.container}>
      {available.length > 5 && (
        <TextInput
          style={styles.search}
          placeholder="Search buttons"
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          accessibilityLabel="Search buttons"
        />
      )}

      {available.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Every button you've created is already on this board. Make more from the Create tab.
          </Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No buttons match "{query}".</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
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
                accessibilityLabel={item.label}
              >
                <Image source={{ uri: item.imageUri }} style={styles.thumb} contentFit="cover" />
                <Text style={styles.rowLabel}>{item.label}</Text>
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

      <Pressable style={styles.addButton} onPress={handleAdd} accessibilityRole="button">
        <Text style={styles.addButtonText}>
          {selected.size > 0 ? `Add ${selected.size} to Board` : 'Done'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  search: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
    minHeight: minTouchTarget * 0.55,
  },
  list: { padding: spacing.md, gap: spacing.sm },
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
  thumb: { width: 56, height: 56, borderRadius: radii.sm, backgroundColor: colors.border },
  rowLabel: { ...typography.label, color: colors.text, flex: 1 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
  addButton: {
    margin: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    minHeight: minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: { ...typography.label, color: colors.surface },
});
