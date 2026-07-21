import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, minTouchTarget, radii, spacing, typography } from '@/constants/theme';

const COLUMN_OPTIONS = [2, 3, 4];

interface GridSizePickerProps {
  value: number;
  onChange: (columns: number) => void;
}

export function GridSizePicker({ value, onChange }: GridSizePickerProps) {
  return (
    <View style={styles.row}>
      {COLUMN_OPTIONS.map((columns) => {
        const selected = columns === value;
        return (
          <Pressable
            key={columns}
            onPress={() => onChange(columns)}
            style={[styles.option, selected && styles.optionSelected]}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`${columns} by ${columns} grid`}
          >
            <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
              {columns} x {columns}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  option: {
    flex: 1,
    minHeight: minTouchTarget * 0.7,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  optionText: { ...typography.label, fontSize: 17, color: colors.text },
  optionTextSelected: { color: colors.surface },
});
