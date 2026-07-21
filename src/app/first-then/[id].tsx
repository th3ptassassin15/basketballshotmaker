import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSettings } from '@/context/SettingsContext';
import { colors, minTouchTarget, radii, spacing, typography } from '@/constants/theme';
import { deleteFirstThenPair, getButtons, getFirstThenPairs } from '@/services/storage';
import { speak } from '@/services/speech';
import type { AACButtonData, FirstThenPair } from '@/types';

export default function FirstThenViewerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [pair, setPair] = useState<FirstThenPair | null>(null);
  const [firstButton, setFirstButton] = useState<AACButtonData | null>(null);
  const [thenButton, setThenButton] = useState<AACButtonData | null>(null);

  const load = useCallback(async () => {
    const [pairs, buttons] = await Promise.all([getFirstThenPairs(), getButtons()]);
    const found = pairs.find((item) => item.id === id) ?? null;
    setPair(found);
    if (found) {
      setFirstButton(buttons.find((button) => button.id === found.firstButtonId) ?? null);
      setThenButton(buttons.find((button) => button.id === found.thenButtonId) ?? null);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function handleDelete() {
    if (!pair) return;
    Alert.alert('Delete this First / Then?', 'This only removes the pairing, not the buttons themselves.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteFirstThenPair(pair.id);
          router.back();
        },
      },
    ]);
  }

  if (!pair || !firstButton || !thenButton) return null;

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back" style={styles.topBarButton}>
          <Ionicons name="close" size={26} color={colors.text} />
        </Pressable>
        <Pressable onPress={handleDelete} accessibilityRole="button" accessibilityLabel="Delete this First then Then" style={styles.topBarButton}>
          <Ionicons name="trash-outline" size={24} color={colors.danger} />
        </Pressable>
      </View>

      <View style={styles.panels}>
        <Panel label="FIRST" button={firstButton} />
        <View style={styles.divider} />
        <Panel label="THEN" button={thenButton} />
      </View>
    </View>
  );
}

interface PanelProps {
  label: string;
  button: AACButtonData;
}

function Panel({ label, button }: PanelProps) {
  const { settings } = useSettings();
  return (
    <Pressable
      style={styles.panel}
      onPress={() => speak(button.label, settings)}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${button.label}`}
    >
      <Text style={styles.panelLabel}>{label}</Text>
      <Image source={{ uri: button.imageUri }} style={styles.panelImage} contentFit="cover" />
      <Text style={styles.panelButtonLabel} numberOfLines={1}>
        {button.label.toUpperCase()}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  topBarButton: {
    width: minTouchTarget * 0.6,
    height: minTouchTarget * 0.6,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panels: { flex: 1, flexDirection: 'row', padding: spacing.lg, gap: spacing.md },
  divider: { width: 2, backgroundColor: colors.border },
  panel: {
    flex: 1,
    borderRadius: radii.lg,
    borderWidth: 3,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  panelLabel: { ...typography.title, fontSize: 24, color: colors.primaryDark },
  panelImage: { width: '100%', flex: 1, borderRadius: radii.md, backgroundColor: colors.border },
  panelButtonLabel: { ...typography.label, fontSize: 22, color: colors.text },
});
