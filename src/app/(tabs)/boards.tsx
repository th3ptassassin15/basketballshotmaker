import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useSettings } from '@/context/SettingsContext';
import { colors, minTouchTarget, radii, spacing, typography } from '@/constants/theme';
import { getBoards, getButtons } from '@/services/storage';
import type { Board } from '@/types';

interface BoardSummary extends Board {
  buttonCount: number;
}

export default function BoardListScreen() {
  const { settings } = useSettings();
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

  const homeBoard = boards.find((board) => board.id === settings.homeBoardId);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choice Boards</Text>
        <View style={styles.headerActions}>
          <Pressable
            style={styles.firstThenButton}
            onPress={() => router.push('/first-then')}
            accessibilityRole="button"
            accessibilityLabel="First then Then boards"
          >
            <Ionicons name="swap-horizontal" size={24} color={colors.primaryDark} />
          </Pressable>
          <Pressable
            style={styles.newBoardButton}
            onPress={() => router.push('/board/new')}
            accessibilityRole="button"
            accessibilityLabel="Create new board"
          >
            <Ionicons name="add" size={28} color={colors.surface} />
          </Pressable>
        </View>
      </View>

      <FlatList
        data={boards}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          homeBoard ? (
            <Pressable
              style={styles.homeBanner}
              onPress={() => router.push({ pathname: '/board/[id]', params: { id: homeBoard.id } })}
              accessibilityRole="button"
              accessibilityLabel={`Open home board: ${homeBoard.name}`}
            >
              <Ionicons name="star" size={24} color={colors.surface} />
              <View style={styles.homeBannerText}>
                <Text style={styles.homeBannerLabel}>Home Board</Text>
                <Text style={styles.homeBannerTitle}>{homeBoard.name}</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color={colors.surface} />
            </Pressable>
          ) : null
        }
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
  headerActions: { flexDirection: 'row', gap: spacing.sm },
  firstThenButton: {
    width: minTouchTarget * 0.6,
    height: minTouchTarget * 0.6,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newBoardButton: {
    width: minTouchTarget * 0.6,
    height: minTouchTarget * 0.6,
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl, gap: spacing.md },
  homeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    padding: spacing.md,
    minHeight: minTouchTarget,
    marginBottom: spacing.md,
  },
  homeBannerText: { flex: 1 },
  homeBannerLabel: { ...typography.small, color: colors.surface, opacity: 0.85 },
  homeBannerTitle: { ...typography.label, color: colors.surface, fontSize: 19 },
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
