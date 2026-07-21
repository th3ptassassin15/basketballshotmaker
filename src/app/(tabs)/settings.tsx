import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Alert, FlatList, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import * as Speech from 'expo-speech';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Stepper } from '@/components/Stepper';
import { useSettings } from '@/context/SettingsContext';
import { colors, minTouchTarget, radii, spacing, typography } from '@/constants/theme';
import { exportBackup, importBackup } from '@/services/backup';
import { getBoards } from '@/services/storage';
import { speak } from '@/services/speech';
import type { Board } from '@/types';

export default function SettingsScreen() {
  const { settings, updateSettings } = useSettings();
  const [voices, setVoices] = useState<Speech.Voice[]>([]);
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const [boards, setBoards] = useState<Board[]>([]);
  const [busy, setBusy] = useState<'export' | 'import' | null>(null);

  useEffect(() => {
    Speech.getAvailableVoicesAsync().then(setVoices).catch(() => setVoices([]));
  }, []);

  useFocusEffect(
    useCallback(() => {
      getBoards().then(setBoards);
    }, [])
  );

  const currentVoiceName =
    voices.find((voice) => voice.identifier === settings.voiceIdentifier)?.name ?? 'System Default';

  function handlePreviewVoice() {
    speak('Hello! This is what your voice sounds like.', settings);
  }

  async function handleExport() {
    setBusy('export');
    try {
      await exportBackup();
    } catch {
      Alert.alert('Export failed', 'Something went wrong creating the backup. Please try again.');
    } finally {
      setBusy(null);
    }
  }

  function handleImport() {
    Alert.alert(
      'Restore from backup?',
      'This replaces all buttons and boards on this device with the contents of the backup file.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Choose Backup File',
          onPress: async () => {
            setBusy('import');
            try {
              const summary = await importBackup();
              if (summary) {
                Alert.alert(
                  'Restore complete',
                  `Restored ${summary.buttonCount} buttons across ${summary.boardCount} boards.`
                );
                getBoards().then(setBoards);
              }
            } catch {
              Alert.alert('Restore failed', 'This file could not be read as a TapVoice backup.');
            } finally {
              setBusy(null);
            }
          },
        },
      ]
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>

      <Section title="Speech">
        <Pressable style={styles.row} onPress={() => setShowVoicePicker(true)} accessibilityRole="button">
          <Text style={styles.rowLabel}>Voice</Text>
          <View style={styles.rowValue}>
            <Text style={styles.rowValueText} numberOfLines={1}>
              {currentVoiceName}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </View>
        </Pressable>

        <Stepper
          label="Speech Rate"
          value={settings.speechRate}
          min={0.5}
          max={1.5}
          step={0.1}
          onChange={(speechRate) => updateSettings({ speechRate })}
        />
        <Stepper
          label="Speech Pitch"
          value={settings.speechPitch}
          min={0.5}
          max={2.0}
          step={0.1}
          onChange={(speechPitch) => updateSettings({ speechPitch })}
        />

        <Pressable style={styles.previewButton} onPress={handlePreviewVoice} accessibilityRole="button">
          <Text style={styles.previewButtonText}>Preview Voice</Text>
        </Pressable>
      </Section>

      <Section title="Display & Feedback">
        <View style={styles.switchRow}>
          <Text style={styles.rowLabel}>Show Word Labels</Text>
          <Switch
            value={settings.showLabels}
            onValueChange={(showLabels) => updateSettings({ showLabels })}
            trackColor={{ true: colors.primary, false: colors.border }}
          />
        </View>
        <Text style={styles.hint}>Turn off for pre-readers who only need the picture.</Text>

        <View style={styles.switchRow}>
          <Text style={styles.rowLabel}>Vibrate on Tap</Text>
          <Switch
            value={settings.hapticsEnabled}
            onValueChange={(hapticsEnabled) => updateSettings({ hapticsEnabled })}
            trackColor={{ true: colors.primary, false: colors.border }}
          />
        </View>
      </Section>

      <Section title="Home Board">
        <Text style={styles.hint}>Featured as a quick-access shortcut at the top of the Boards tab.</Text>
        <Pressable
          style={[styles.boardOption, settings.homeBoardId === null && styles.boardOptionSelected]}
          onPress={() => updateSettings({ homeBoardId: null })}
          accessibilityRole="button"
        >
          <Text style={styles.boardOptionText}>None</Text>
          {settings.homeBoardId === null && <Ionicons name="checkmark" size={20} color={colors.primary} />}
        </Pressable>
        {boards.map((board) => (
          <Pressable
            key={board.id}
            style={[styles.boardOption, settings.homeBoardId === board.id && styles.boardOptionSelected]}
            onPress={() => updateSettings({ homeBoardId: board.id })}
            accessibilityRole="button"
          >
            <Text style={styles.boardOptionText}>{board.name}</Text>
            {settings.homeBoardId === board.id && <Ionicons name="checkmark" size={20} color={colors.primary} />}
          </Pressable>
        ))}
      </Section>

      <Section title="Backup & Restore">
        <Text style={styles.hint}>
          Save every button, photo, and board to a file you can store in Files, Drive, or email — and
          restore it on this or another device.
        </Text>
        <Pressable
          style={[styles.previewButton, busy === 'export' && styles.disabled]}
          onPress={handleExport}
          disabled={busy !== null}
          accessibilityRole="button"
        >
          <Text style={styles.previewButtonText}>{busy === 'export' ? 'Exporting…' : 'Export Backup'}</Text>
        </Pressable>
        <Pressable
          style={[styles.secondaryButton, busy === 'import' && styles.disabled]}
          onPress={handleImport}
          disabled={busy !== null}
          accessibilityRole="button"
        >
          <Text style={styles.secondaryButtonText}>
            {busy === 'import' ? 'Restoring…' : 'Restore from Backup'}
          </Text>
        </Pressable>
      </Section>

      <Text style={styles.footer}>
        Not yet supported: a built-in symbol library, premium neural voices, and switch-scanning /
        switch-access input. These are on the roadmap.
      </Text>

      <Modal visible={showVoicePicker} animationType="slide" onRequestClose={() => setShowVoicePicker(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choose a Voice</Text>
            <Pressable onPress={() => setShowVoicePicker(false)} accessibilityRole="button">
              <Text style={styles.modalClose}>Done</Text>
            </Pressable>
          </View>
          <FlatList
            data={[{ identifier: '', name: 'System Default', language: '', quality: Speech.VoiceQuality.Default }, ...voices]}
            keyExtractor={(item) => item.identifier || 'default'}
            contentContainerStyle={styles.voiceList}
            renderItem={({ item }) => {
              const selected = (settings.voiceIdentifier ?? '') === item.identifier;
              return (
                <Pressable
                  style={[styles.voiceRow, selected && styles.voiceRowSelected]}
                  onPress={() => {
                    updateSettings({ voiceIdentifier: item.identifier || null });
                    setShowVoicePicker(false);
                  }}
                  accessibilityRole="button"
                >
                  <View style={styles.voiceRowText}>
                    <Text style={styles.voiceName}>{item.name}</Text>
                    {item.language ? <Text style={styles.voiceLanguage}>{item.language}</Text> : null}
                  </View>
                  {selected && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
                </Pressable>
              );
            }}
          />
        </View>
      </Modal>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl, gap: spacing.lg },
  title: { ...typography.title, color: colors.text },
  section: { gap: spacing.sm },
  sectionTitle: { ...typography.label, fontSize: 15, color: colors.textMuted, textTransform: 'uppercase' },
  sectionBody: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: minTouchTarget * 0.7,
  },
  rowLabel: { ...typography.label, fontSize: 17, color: colors.text },
  rowValue: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexShrink: 1 },
  rowValueText: { ...typography.body, color: colors.textMuted },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: minTouchTarget * 0.7,
  },
  hint: { ...typography.small, color: colors.textMuted },
  previewButton: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    minHeight: minTouchTarget * 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewButtonText: { ...typography.label, color: colors.surface },
  secondaryButton: {
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radii.md,
    minHeight: minTouchTarget * 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: { ...typography.label, color: colors.text },
  disabled: { opacity: 0.6 },
  boardOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: minTouchTarget * 0.7,
    paddingHorizontal: spacing.xs,
  },
  boardOptionSelected: { backgroundColor: colors.background, borderRadius: radii.sm },
  boardOptionText: { ...typography.body, color: colors.text },
  footer: { ...typography.small, color: colors.textMuted, textAlign: 'center' },
  modalContainer: { flex: 1, backgroundColor: colors.background, paddingTop: spacing.xl },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  modalTitle: { ...typography.title, fontSize: 22, color: colors.text },
  modalClose: { ...typography.label, fontSize: 17, color: colors.primaryDark },
  voiceList: { padding: spacing.md, gap: spacing.sm },
  voiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.md,
    minHeight: minTouchTarget,
  },
  voiceRowSelected: { borderColor: colors.primary },
  voiceRowText: { flex: 1 },
  voiceName: { ...typography.label, fontSize: 16, color: colors.text },
  voiceLanguage: { ...typography.small, color: colors.textMuted, marginTop: 2 },
});
