import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, minTouchTarget, radii, spacing, typography } from '@/constants/theme';

interface BoardLinkTileProps {
  name: string;
  onPress: () => void;
  onLongPress?: () => void;
}

/** A folder-style tile that navigates to another board instead of speaking a word. */
export function BoardLinkTile({ name, onPress, onLongPress }: BoardLinkTileProps) {
  return (
    <Pressable
      style={styles.wrapper}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={500}
      accessibilityRole="button"
      accessibilityLabel={`Go to ${name} board`}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="folder-open" size={36} color={colors.primaryDark} />
      </View>
      <Text style={styles.label} numberOfLines={2}>
        {name.toUpperCase()}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radii.md,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: colors.secondary,
    backgroundColor: colors.surface,
    minWidth: minTouchTarget,
    minHeight: minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
  },
  iconWrap: { alignItems: 'center', justifyContent: 'center' },
  label: {
    ...typography.label,
    fontSize: 15,
    color: colors.text,
    textAlign: 'center',
  },
});
