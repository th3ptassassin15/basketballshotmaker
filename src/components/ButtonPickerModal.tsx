import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { colors, minTouchTarget, radii, spacing, typography } from '@/constants/theme';
import type { AACButtonData } from '@/types';

interface ButtonPickerModalProps {
  visible: boolean;
  title: string;
  buttons: AACButtonData[];
  onSelect: (button: AACButtonData) => void;
  onClose: () => void;
}

export function ButtonPickerModal({ visible, title, buttons, onSelect, onClose }: ButtonPickerModalProps) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Pressable onPress={onClose} accessibilityRole="button" style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </Pressable>
        </View>

        {buttons.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              No buttons yet. Make some from the Create tab first.
            </Text>
          </View>
        ) : (
          <FlatList
            data={buttons}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <Pressable
                style={styles.row}
                onPress={() => onSelect(item)}
                accessibilityRole="button"
                accessibilityLabel={item.label}
              >
                <Image source={{ uri: item.imageUri }} style={styles.thumb} contentFit="cover" />
                <Text style={styles.rowLabel}>{item.label}</Text>
              </Pressable>
            )}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: spacing.xl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  title: { ...typography.title, fontSize: 22, color: colors.text },
  closeButton: { minHeight: minTouchTarget * 0.5, justifyContent: 'center', paddingHorizontal: spacing.sm },
  closeButtonText: { ...typography.label, fontSize: 17, color: colors.primaryDark },
  list: { padding: spacing.md, gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.sm,
    minHeight: minTouchTarget,
  },
  thumb: { width: 56, height: 56, borderRadius: radii.sm, backgroundColor: colors.border },
  rowLabel: { ...typography.label, color: colors.text, flex: 1 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
});
