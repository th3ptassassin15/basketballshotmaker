import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { GridSizePicker } from '@/components/GridSizePicker';
import { colors, minTouchTarget, radii, spacing, typography } from '@/constants/theme';
import { LIBRARY_BOARD_ID, deleteBoard, getBoard, renameBoard, updateBoardColumns } from '@/services/storage';

export default function BoardSettingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [name, setName] = useState('');
  const [columns, setColumns] = useState(3);
  const [loaded, setLoaded] = useState(false);
  const isLibraryBoard = id === LIBRARY_BOARD_ID;

  useEffect(() => {
    getBoard(id).then((board) => {
      if (board) {
        setName(board.name);
        setColumns(board.columns);
      }
      setLoaded(true);
    });
  }, [id]);

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) return;
    await renameBoard(id, trimmed);
    await updateBoardColumns(id, columns);
    router.back();
  }

  function handleDelete() {
    Alert.alert('Delete this board?', 'Buttons on this board are not deleted, only the board itself.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteBoard(id);
          router.dismissTo('/boards');
        },
      },
    ]);
  }

  if (!loaded) return null;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.label}>Board name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        maxLength={30}
        accessibilityLabel="Board name"
      />

      <Text style={styles.label}>Grid size</Text>
      <GridSizePicker value={columns} onChange={setColumns} />

      <Pressable style={styles.saveButton} onPress={handleSave} accessibilityRole="button">
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </Pressable>

      {!isLibraryBoard && (
        <Pressable style={styles.deleteButton} onPress={handleDelete} accessibilityRole="button">
          <Text style={styles.deleteButtonText}>Delete Board</Text>
        </Pressable>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, gap: spacing.sm },
  label: { ...typography.label, color: colors.text, marginTop: spacing.md },
  input: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    backgroundColor: colors.surface,
    minHeight: minTouchTarget * 0.6,
  },
  saveButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    minHeight: minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: { ...typography.label, color: colors.surface },
  deleteButton: {
    marginTop: spacing.md,
    borderRadius: radii.md,
    minHeight: minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.danger,
  },
  deleteButtonText: { ...typography.label, color: colors.danger },
});
