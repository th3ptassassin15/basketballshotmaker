import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, minTouchTarget, radii, spacing, typography } from '@/constants/theme';

interface ButtonActionSheetProps {
  visible: boolean;
  label: string;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function ButtonActionSheet({ visible, label, onEdit, onDelete, onClose }: ButtonActionSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close menu">
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.title} numberOfLines={1}>
            {label.toUpperCase()}
          </Text>

          <Pressable style={styles.action} onPress={onEdit} accessibilityRole="button">
            <Text style={styles.actionText}>Edit</Text>
          </Pressable>

          <Pressable style={styles.action} onPress={onDelete} accessibilityRole="button">
            <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
          </Pressable>

          <Pressable style={styles.cancelAction} onPress={onClose} accessibilityRole="button">
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(31, 42, 51, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    ...typography.label,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  action: {
    minHeight: minTouchTarget,
    borderRadius: radii.md,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: { ...typography.label, color: colors.text },
  deleteText: { color: colors.danger },
  cancelAction: {
    minHeight: minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  cancelText: { ...typography.label, color: colors.textMuted },
});
