import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { colors, minTouchTarget, radii, spacing, typography } from '@/constants/theme';
import { getButtons, getFirstThenPairs } from '@/services/storage';
import type { AACButtonData, FirstThenPair } from '@/types';

interface PairSummary extends FirstThenPair {
  firstButton?: AACButtonData;
  thenButton?: AACButtonData;
}

export default function FirstThenListScreen() {
  const [pairs, setPairs] = useState<PairSummary[]>([]);

  const load = useCallback(async () => {
    const [allPairs, allButtons] = await Promise.all([getFirstThenPairs(), getButtons()]);
    const buttonById = new Map(allButtons.map((button) => [button.id, button]));
    setPairs(
      allPairs.map((pair) => ({
        ...pair,
        firstButton: buttonById.get(pair.firstButtonId),
        thenButton: buttonById.get(pair.thenButtonId),
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
        <Text style={styles.subtitle}>
          Build a quick visual contract: show what comes first, and what comes after.
        </Text>
        <Pressable
          style={styles.newButton}
          onPress={() => router.push('/first-then/new')}
          accessibilityRole="button"
          accessibilityLabel="Create new First then Then"
        >
          <Ionicons name="add" size={22} color={colors.surface} />
          <Text style={styles.newButtonText}>New First / Then</Text>
        </Pressable>
      </View>

      {pairs.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No First/Then boards yet. Tap above to build one.</Text>
        </View>
      ) : (
        <FlatList
          data={pairs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => router.push({ pathname: '/first-then/[id]', params: { id: item.id } })}
              accessibilityRole="button"
            >
              {item.firstButton && (
                <Image source={{ uri: item.firstButton.imageUri }} style={styles.thumb} contentFit="cover" />
              )}
              <Ionicons name="arrow-forward" size={20} color={colors.textMuted} />
              {item.thenButton && (
                <Image source={{ uri: item.thenButton.imageUri }} style={styles.thumb} contentFit="cover" />
              )}
              <Text style={styles.cardLabel} numberOfLines={1}>
                {item.firstButton?.label ?? '?'} → {item.thenButton?.label ?? '?'}
              </Text>
              <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, gap: spacing.md },
  subtitle: { ...typography.body, color: colors.textMuted },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    minHeight: minTouchTarget,
    paddingHorizontal: spacing.lg,
  },
  newButtonText: { ...typography.label, color: colors.surface },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl, gap: spacing.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.sm,
    minHeight: minTouchTarget,
  },
  thumb: { width: 48, height: 48, borderRadius: radii.sm, backgroundColor: colors.border },
  cardLabel: { ...typography.label, fontSize: 16, color: colors.text, flex: 1, marginLeft: spacing.xs },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
});
