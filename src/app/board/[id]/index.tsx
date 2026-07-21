import { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { AACButtonTile } from '@/components/AACButtonTile';
import { BoardLinkTile } from '@/components/BoardLinkTile';
import { ButtonActionSheet } from '@/components/ButtonActionSheet';
import { useSettings } from '@/context/SettingsContext';
import { colors, minTouchTarget, radii, spacing, typography } from '@/constants/theme';
import { deleteButton, getBoard, getBoards, getButtons, unlinkBoard } from '@/services/storage';
import { speak } from '@/services/speech';
import type { AACButtonData, Board } from '@/types';

type GridItem = { kind: 'button'; button: AACButtonData } | { kind: 'link'; board: Board };

export default function BoardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { settings } = useSettings();
  const [board, setBoard] = useState<Board | null>(null);
  const [buttons, setButtons] = useState<AACButtonData[]>([]);
  const [linkedBoards, setLinkedBoards] = useState<Board[]>([]);
  const [activeButton, setActiveButton] = useState<AACButtonData | null>(null);
  const [sentence, setSentence] = useState<AACButtonData[]>([]);

  const load = useCallback(async () => {
    const [foundBoard, allButtons, allBoards] = await Promise.all([getBoard(id), getButtons(), getBoards()]);
    if (!foundBoard) return;
    setBoard(foundBoard);

    const buttonById = new Map(allButtons.map((button) => [button.id, button]));
    setButtons(
      foundBoard.buttonIds
        .map((buttonId) => buttonById.get(buttonId))
        .filter((button): button is AACButtonData => Boolean(button))
    );

    const boardById = new Map(allBoards.map((other) => [other.id, other]));
    setLinkedBoards(
      foundBoard.linkedBoardIds
        .map((boardId) => boardById.get(boardId))
        .filter((linked): linked is Board => Boolean(linked))
    );
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
      setSentence([]);
    }, [load])
  );

  const gridItems: GridItem[] = useMemo(
    () => [
      ...buttons.map((button): GridItem => ({ kind: 'button', button })),
      ...linkedBoards.map((linked): GridItem => ({ kind: 'link', board: linked })),
    ],
    [buttons, linkedBoards]
  );

  function handleTapButton(button: AACButtonData) {
    speak(button.label, settings);
    setSentence((prev) => [...prev, button]);
  }

  function handleRemoveFromSentence(index: number) {
    setSentence((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSpeakSentence() {
    if (sentence.length === 0) return;
    speak(sentence.map((button) => button.label).join(' '), settings);
  }

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

  function handleUnlink(linked: Board) {
    Alert.alert('Remove this link?', `"${linked.name}" will no longer appear here. The board itself is kept.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await unlinkBoard(id, linked.id);
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
                <Ionicons name="add-circle-outline" size={24} color={colors.primaryDark} />
              </Pressable>
              <Pressable
                onPress={() => router.push({ pathname: '/board/[id]/link-boards', params: { id } })}
                accessibilityRole="button"
                accessibilityLabel="Link other boards"
                style={styles.headerButton}
              >
                <Ionicons name="folder-outline" size={22} color={colors.primaryDark} />
              </Pressable>
              <Pressable
                onPress={() => router.push({ pathname: '/board/[id]/settings', params: { id } })}
                accessibilityRole="button"
                accessibilityLabel="Board settings"
                style={styles.headerButton}
              >
                <Ionicons name="settings-outline" size={22} color={colors.primaryDark} />
              </Pressable>
            </View>
          ),
        }}
      />

      {sentence.length > 0 && (
        <View style={styles.sentenceBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sentenceScroll}>
            {sentence.map((button, index) => (
              <Pressable
                key={`${button.id}-${index}`}
                style={styles.sentenceChip}
                onPress={() => handleRemoveFromSentence(index)}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${button.label} from sentence`}
              >
                <Image source={{ uri: button.imageUri }} style={styles.sentenceChipImage} contentFit="cover" />
                <Text style={styles.sentenceChipText} numberOfLines={1}>
                  {button.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          <Pressable
            style={styles.sentenceClearButton}
            onPress={() => setSentence([])}
            accessibilityRole="button"
            accessibilityLabel="Clear sentence"
          >
            <Ionicons name="close" size={22} color={colors.textMuted} />
          </Pressable>
          <Pressable
            style={styles.sentenceSpeakButton}
            onPress={handleSpeakSentence}
            accessibilityRole="button"
            accessibilityLabel="Speak sentence"
          >
            <Ionicons name="volume-high" size={22} color={colors.surface} />
          </Pressable>
        </View>
      )}

      {gridItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            No buttons here yet. Tap the + above to add buttons from your library.
          </Text>
        </View>
      ) : (
        <FlatList
          data={gridItems}
          key={board?.columns ?? 3}
          numColumns={board?.columns ?? 3}
          keyExtractor={(item) => (item.kind === 'button' ? `b-${item.button.id}` : `l-${item.board.id}`)}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) =>
            item.kind === 'button' ? (
              <AACButtonTile
                label={item.button.label}
                imageUri={item.button.imageUri}
                onPress={() => handleTapButton(item.button)}
                onLongPress={() => setActiveButton(item.button)}
              />
            ) : (
              <BoardLinkTile
                name={item.board.name}
                onPress={() => router.push({ pathname: '/board/[id]', params: { id: item.board.id } })}
                onLongPress={() => handleUnlink(item.board)}
              />
            )
          }
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
  headerActions: { flexDirection: 'row', gap: spacing.xs, marginRight: spacing.xs },
  headerButton: { padding: spacing.xs },
  sentenceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  sentenceScroll: { flex: 1 },
  sentenceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.background,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginRight: spacing.xs,
    maxWidth: 140,
  },
  sentenceChipImage: { width: 28, height: 28, borderRadius: radii.sm, backgroundColor: colors.border },
  sentenceChipText: { ...typography.small, color: colors.text, fontWeight: '700' },
  sentenceClearButton: {
    width: minTouchTarget * 0.55,
    height: minTouchTarget * 0.55,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sentenceSpeakButton: {
    width: minTouchTarget * 0.55,
    height: minTouchTarget * 0.55,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: { padding: spacing.md, paddingBottom: spacing.xl },
  row: { gap: spacing.md, marginBottom: spacing.md },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
});
