import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';

import { useSettings } from '@/context/SettingsContext';
import { colors, minTouchTarget, radii, spacing, typography } from '@/constants/theme';

interface AACButtonTileProps {
  label: string;
  imageUri: string;
  onPress?: () => void;
  onLongPress?: () => void;
}

export function AACButtonTile({ label, imageUri, onPress, onLongPress }: AACButtonTileProps) {
  const { settings } = useSettings();
  const scale = useRef(new Animated.Value(1)).current;
  const highlight = useRef(new Animated.Value(0)).current;

  function handlePress() {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.94, duration: 90, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    Animated.sequence([
      Animated.timing(highlight, { toValue: 1, duration: 80, useNativeDriver: false }),
      Animated.timing(highlight, { toValue: 0, duration: 500, useNativeDriver: false }),
    ]).start();
    onPress?.();
  }

  const borderColor = highlight.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.highlight],
  });

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }], borderColor }]}>
      <Pressable
        onPress={handlePress}
        onLongPress={onLongPress}
        delayLongPress={500}
        style={styles.pressable}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" />
        {settings.showLabels && (
          <View style={styles.labelBar}>
            <Text style={styles.labelText} numberOfLines={1}>
              {label.toUpperCase()}
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radii.md,
    borderWidth: 3,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    minWidth: minTouchTarget,
    minHeight: minTouchTarget,
  },
  pressable: {
    flex: 1,
  },
  image: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.border,
  },
  labelBar: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  labelText: {
    ...typography.label,
    textAlign: 'center',
    color: colors.text,
  },
});
