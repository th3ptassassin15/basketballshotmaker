import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { colors, minTouchTarget, radii, spacing, typography } from '@/constants/theme';
import { getBoards, getButtons } from '@/services/storage';
import type { Board } from '@/types';

interface BoardSummary extends Board {
  buttonCount: number;
}

export default function BoardListScreen() {
  const [boards, setBoards] = useState<BoardSummary[]>([]);

  const load = useCallback(async () => {
    const [allBoards, allButtons] = await Promise.all([getBoards(), getButtons()]);
    const validButtonIds = new Set(allButtons.map((button) => button.id));
    setBoards(
      allBoards.map((board) => ({
        ...board,
        buttonCount: board.buttonIds.filter((id) => validButtonIds.has(id)).length,
      }))
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choice Boards</Text>
        <Pressable
          style={styles.newBoardButton}
          onPress={() => router.push('/board/new')}
          accessibilityRole="button"
          accessibilityLabel="Create new board"
        >
          <Ionicons name="add" size={28} color={colors.surface} />
        </Pressable>
      </View>

      <FlatList
        data={boards}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push({ pathname: '/board/[id]', params: { id: item.id } })}
            accessibilityRole="button"
          >
            <View style={styles.cardIcon}>
              <Ionicons name="grid" size={28} color={colors.primaryDark} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSubtitle}>
                {item.buttonCount} {item.buttonCount === 1 ? 'button' : 'buttons'} · {item.columns} columns
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: spacing.lg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  title: { ...typography.title, color: colors.text },
  newBoardButton: {
    width: minTouchTarget * 0.6,
    height: minTouchTarget * 0.6,
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl, gap: spacing.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.md,
    minHeight: minTouchTarget,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: { flex: 1 },
  cardTitle: { ...typography.label, color: colors.text },
  cardSubtitle: { ...typography.small, color: colors.textMuted, marginTop: 2 },
});
