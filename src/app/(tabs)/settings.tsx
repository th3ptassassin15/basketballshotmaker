import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/constants/theme';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.body}>
        Voice options, board management, and backup/export are coming in a later step of this build.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, paddingTop: spacing.xl },
  title: { ...typography.title, color: colors.text, marginBottom: spacing.md },
  body: { ...typography.body, color: colors.textMuted },
});
