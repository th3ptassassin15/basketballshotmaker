import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';

import { ButtonPickerModal } from '@/components/ButtonPickerModal';
import { colors, minTouchTarget, radii, spacing, typography } from '@/constants/theme';
import { createFirstThenPair, getButtons } from '@/services/storage';
import type { AACButtonData } from '@/types';

type ActiveSlot = 'first' | 'then' | null;

export default function NewFirstThenScreen() {
  const [buttons, setButtons] = useState<AACButtonData[]>([]);
  const [firstButton, setFirstButton] = useState<AACButtonData | null>(null);
  const [thenButton, setThenButton] = useState<AACButtonData | null>(null);
  const [activeSlot, setActiveSlot] = useState<ActiveSlot>(null);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getButtons().then(setButtons);
    }, [])
  );

  function handleSelect(button: AACButtonData) {
    if (activeSlot === 'first') setFirstButton(button);
    if (activeSlot === 'then') setThenButton(button);
    setActiveSlot(null);
  }

  async function handleSave() {
    if (!firstButton || !thenButton) return;
    setSaving(true);
    const pair = await createFirstThenPair(firstButton.id, thenButton.id);
    router.replace({ pathname: '/first-then/[id]', params: { id: pair.id } });
  }

  return (
    <View style={styles.container}>
      <View style={styles.slots}>
        <Slot label="FIRST" button={firstButton} onPress={() => setActiveSlot('first')} />
        <Slot label="THEN" button={thenButton} onPress={() => setActiveSlot('then')} />
      </View>

      <Pressable
        style={[styles.saveButton, (!firstButton || !thenButton || saving) && styles.disabled]}
        onPress={handleSave}
        disabled={!firstButton || !thenButton || saving}
        accessibilityRole="button"
      >
        <Text style={styles.saveButtonText}>Save First / Then</Text>
      </Pressable>

      <ButtonPickerModal
        visible={activeSlot !== null}
        title={activeSlot === 'first' ? 'Choose the First button' : 'Choose the Then button'}
        buttons={buttons}
        onSelect={handleSelect}
        onClose={() => setActiveSlot(null)}
      />
    </View>
  );
}

interface SlotProps {
  label: string;
  button: AACButtonData | null;
  onPress: () => void;
}

function Slot({ label, button, onPress }: SlotProps) {
  return (
    <Pressable
      style={styles.slot}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={button ? `${label}: ${button.label}. Tap to change.` : `Choose ${label} button`}
    >
      <Text style={styles.slotLabel}>{label}</Text>
      {button ? (
        <>
          <Image source={{ uri: button.imageUri }} style={styles.slotImage} contentFit="cover" />
          <Text style={styles.slotButtonLabel} numberOfLines={1}>
            {button.label.toUpperCase()}
          </Text>
        </>
      ) : (
        <View style={styles.slotPlaceholder}>
          <Text style={styles.slotPlaceholderText}>Tap to choose</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, gap: spacing.lg },
  slots: { flex: 1, flexDirection: 'row', gap: spacing.md },
  slot: {
    flex: 1,
    borderRadius: radii.lg,
    borderWidth: 3,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  slotLabel: { ...typography.title, fontSize: 20, color: colors.primaryDark },
  slotImage: { width: '100%', flex: 1, borderRadius: radii.md, backgroundColor: colors.border },
  slotButtonLabel: { ...typography.label, color: colors.text },
  slotPlaceholder: {
    flex: 1,
    width: '100%',
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotPlaceholderText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    minHeight: minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: { ...typography.label, color: colors.surface },
  disabled: { opacity: 0.5 },
});
