import { useEffect, useState } from 'react';
import {
  Alert,
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
import { router, useLocalSearchParams } from 'expo-router';

import { colors, minTouchTarget, radii, spacing, typography } from '@/constants/theme';
import { persistImage } from '@/services/imageStorage';
import { deleteButton, getButtons, updateButton } from '@/services/storage';
import type { AACButtonData } from '@/types';

export default function EditButtonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [button, setButton] = useState<AACButtonData | null>(null);
  const [label, setLabel] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getButtons().then((buttons) => {
      const found = buttons.find((item) => item.id === id) ?? null;
      setButton(found);
      setLabel(found?.label ?? '');
      setPhotoUri(found?.imageUri ?? null);
    });
  }, [id]);

  async function handleRetake() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError('Camera access is needed to retake this photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: Platform.OS === 'web',
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
      setPhotoBase64(result.assets[0].base64 ?? null);
    }
  }

  async function handleChooseFromLibrary() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Photo library access is needed to choose an existing photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: Platform.OS === 'web',
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
      setPhotoBase64(result.assets[0].base64 ?? null);
    }
  }

  async function handleSave() {
    const trimmed = label.trim();
    if (!button || !photoUri || !trimmed) {
      setError('Please add a text label before saving.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const updates: Partial<Pick<AACButtonData, 'label' | 'imageUri'>> = { label: trimmed };
      if (photoUri !== button.imageUri) {
        updates.imageUri = persistImage(photoUri, button.id, photoBase64);
      }
      await updateButton(button.id, updates);
      router.back();
    } catch {
      setError('Something went wrong saving these changes. Please try again.');
      setSaving(false);
    }
  }

  function handleDelete() {
    if (!button) return;
    Alert.alert('Delete this button?', `"${button.label}" will be removed everywhere it's used.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteButton(button.id);
          router.dismissTo('/boards');
        },
      },
    ]);
  }

  if (!button) return null;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {photoUri && <Image source={{ uri: photoUri }} style={styles.preview} />}

      <View style={styles.retakeRow}>
        <Pressable style={[styles.retakeButton, styles.retakeButtonFlex]} onPress={handleRetake} accessibilityRole="button">
          <Text style={styles.retakeButtonText}>Retake Photo</Text>
        </Pressable>
        <Pressable
          style={[styles.retakeButton, styles.retakeButtonFlex]}
          onPress={handleChooseFromLibrary}
          accessibilityRole="button"
        >
          <Text style={styles.retakeButtonText}>Choose from Library</Text>
        </Pressable>
      </View>

      <TextInput
        style={styles.input}
        value={label}
        onChangeText={setLabel}
        autoCapitalize="characters"
        maxLength={24}
        editable={!saving}
        accessibilityLabel="Button label"
      />

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Pressable
        style={[styles.saveButton, saving && styles.disabled]}
        onPress={handleSave}
        disabled={saving}
        accessibilityRole="button"
      >
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </Pressable>

      <Pressable style={styles.deleteButton} onPress={handleDelete} accessibilityRole="button">
        <Text style={styles.deleteButtonText}>Delete Button</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, gap: spacing.md },
  preview: { width: '100%', aspectRatio: 1, borderRadius: radii.lg, backgroundColor: colors.surface },
  retakeRow: { flexDirection: 'row', gap: spacing.sm },
  retakeButton: {
    alignSelf: 'center',
    minHeight: minTouchTarget * 0.6,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retakeButtonFlex: { flex: 1 },
  retakeButtonText: { ...typography.label, fontSize: 17, color: colors.text },
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
  errorText: { ...typography.body, color: colors.danger, textAlign: 'center' },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    minHeight: minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: { ...typography.label, color: colors.surface },
  disabled: { opacity: 0.6 },
  deleteButton: {
    borderRadius: radii.md,
    minHeight: minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.danger,
  },
  deleteButtonText: { ...typography.label, color: colors.danger },
});
