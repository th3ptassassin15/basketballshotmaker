import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, minTouchTarget, radii, spacing, typography } from '@/constants/theme';

interface StepperProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
}

export function Stepper({ label, value, min, max, step, onChange, formatValue }: StepperProps) {
  const displayValue = formatValue ? formatValue(value) : value.toFixed(1);

  function decrement() {
    onChange(Math.max(min, Math.round((value - step) * 100) / 100));
  }

  function increment() {
    onChange(Math.min(max, Math.round((value + step) * 100) / 100));
  }

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.controls}>
        <Pressable
          style={[styles.button, value <= min && styles.buttonDisabled]}
          onPress={decrement}
          disabled={value <= min}
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${label}`}
        >
          <Text style={styles.buttonText}>−</Text>
        </Pressable>
        <Text style={styles.value}>{displayValue}</Text>
        <Pressable
          style={[styles.button, value >= max && styles.buttonDisabled]}
          onPress={increment}
          disabled={value >= max}
          accessibilityRole="button"
          accessibilityLabel={`Increase ${label}`}
        >
          <Text style={styles.buttonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  label: { ...typography.label, fontSize: 17, color: colors.text },
  controls: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  button: {
    width: minTouchTarget * 0.6,
    height: minTouchTarget * 0.6,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { ...typography.title, fontSize: 22, color: colors.primaryDark },
  value: { ...typography.label, fontSize: 17, color: colors.text, minWidth: 44, textAlign: 'center' },
});
