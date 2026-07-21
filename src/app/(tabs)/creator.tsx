import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';

import { colors, minTouchTarget, radii, spacing, typography } from '@/constants/theme';
import { persistImage } from '@/services/imageStorage';
import { saveButton } from '@/services/storage';
import { speak } from '@/services/speech';
import { generateId } from '@/utils/id';
import type { AACButtonData } from '@/types';

type Stage = 'idle' | 'reviewing' | 'saving';

export default function CreatorScreen() {
  const [stage, setStage] = useState<Stage>('idle');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [label, setLabel] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleTakePhoto() {
    setError(null);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError('Camera access is needed to create a button. Please enable it in your device settings.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
      setStage('reviewing');
    }
  }

  function handleRetake() {
    setPhotoUri(null);
    setLabel('');
    setError(null);
    setStage('idle');
  }

  async function handleSave() {
    const trimmedLabel = label.trim();
    if (!photoUri || !trimmedLabel) {
      setError('Please add a text label before saving.');
      return;
    }

    setStage('saving');
    setError(null);

    try {
      const id = generateId();
      const permanentUri = persistImage(photoUri, id);
      const button: AACButtonData = {
        id,
        label: trimmedLabel,
        imageUri: permanentUri,
        createdAt: Date.now(),
      };
      await saveButton(button);
      speak(trimmedLabel);

      setPhotoUri(null);
      setLabel('');
      setStage('idle');
      router.push('/boards');
    } catch {
      setError('Something went wrong saving this button. Please try again.');
      setStage('reviewing');
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>Create a Button</Text>

      {stage === 'idle' && (
        <View style={styles.centerContent}>
          <Text style={styles.instructions}>
            Snap a photo of a real object, add a word, and it becomes a talking button.
          </Text>
          <Pressable style={styles.primaryButton} onPress={handleTakePhoto} accessibilityRole="button">
            <Text style={styles.primaryButtonText}>Take Photo</Text>
          </Pressable>
        </View>
      )}

      {(stage === 'reviewing' || stage === 'saving') && photoUri && (
        <View style={styles.reviewContent}>
          <Image source={{ uri: photoUri }} style={styles.preview} />

          <TextInput
            style={styles.input}
            placeholder="Type a label, e.g. BALL"
            placeholderTextColor={colors.textMuted}
            value={label}
            onChangeText={setLabel}
            autoCapitalize="characters"
            maxLength={24}
            editable={stage !== 'saving'}
            accessibilityLabel="Button label"
          />

          <View style={styles.actionRow}>
            <Pressable
              style={[styles.secondaryButton, stage === 'saving' && styles.disabled]}
              onPress={handleRetake}
              disabled={stage === 'saving'}
              accessibilityRole="button"
            >
              <Text style={styles.secondaryButtonText}>Retake</Text>
            </Pressable>

            <Pressable
              style={[styles.primaryButton, styles.saveButton, stage === 'saving' && styles.disabled]}
              onPress={handleSave}
              disabled={stage === 'saving'}
              accessibilityRole="button"
            >
              {stage === 'saving' ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Text style={styles.primaryButtonText}>Save Button</Text>
              )}
            </Pressable>
          </View>
        </View>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  title: { ...typography.title, color: colors.text, marginBottom: spacing.lg },
  centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  instructions: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  reviewContent: { flex: 1, gap: spacing.md },
  preview: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    backgroundColor: colors.surface,
    minHeight: minTouchTarget * 0.6,
  },
  actionRow: { flexDirection: 'row', gap: spacing.md },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: { flex: 1 },
  primaryButtonText: { ...typography.label, color: colors.surface },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: { ...typography.label, color: colors.text },
  disabled: { opacity: 0.6 },
  errorText: {
    ...typography.body,
    color: colors.danger,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
