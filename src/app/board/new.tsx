import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput } from 'react-native';
import { router } from 'expo-router';

import { GridSizePicker } from '@/components/GridSizePicker';
import { colors, minTouchTarget, radii, spacing, typography } from '@/constants/theme';
import { createBoard } from '@/services/storage';

export default function NewBoardScreen() {
  const [name, setName] = useState('');
  const [columns, setColumns] = useState(3);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please name this board.');
      return;
    }
    setSaving(true);
    const board = await createBoard(trimmed, columns);
    router.replace({ pathname: '/board/[id]', params: { id: board.id } });
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.label}>Board name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Snacks, Feelings, Playground"
        placeholderTextColor={colors.textMuted}
        value={name}
        onChangeText={setName}
        autoFocus
        maxLength={30}
        accessibilityLabel="Board name"
      />

      <Text style={styles.label}>Grid size</Text>
      <GridSizePicker value={columns} onChange={setColumns} />

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable
        style={[styles.createButton, saving && styles.disabled]}
        onPress={handleCreate}
        disabled={saving}
        accessibilityRole="button"
      >
        <Text style={styles.createButtonText}>Create Board</Text>
      </Pressable>
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
  error: { ...typography.body, color: colors.danger, marginTop: spacing.sm },
  createButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    minHeight: minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: { ...typography.label, color: colors.surface },
  disabled: { opacity: 0.6 },
});
