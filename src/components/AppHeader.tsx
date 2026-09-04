import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

type AppHeaderProps = {
  title: string;
  onBack?: () => void;
};

export function AppHeader({ title, onBack }: AppHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.titleGroup}>
        {onBack ? (
          <Pressable accessibilityRole="button" onPress={onBack} style={styles.backButton}>
            <Text style={styles.backIcon}>{'‹'}</Text>
          </Pressable>
        ) : null}
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.accessibilityBadge}>
        <Text style={styles.accessibilityText}>A+</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  accessibilityBadge: {
    alignItems: 'center',
    backgroundColor: '#DDF2FF',
    borderRadius: 12,
    height: 28,
    justifyContent: 'center',
    width: 36,
  },
  accessibilityText: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: '800',
  },
  backButton: {
    alignItems: 'center',
    height: 30,
    justifyContent: 'center',
    marginLeft: -6,
    width: 22,
  },
  backIcon: {
    color: colors.text,
    fontSize: 28,
    lineHeight: 28,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  titleGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
});
