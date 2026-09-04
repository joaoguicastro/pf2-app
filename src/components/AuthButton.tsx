import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../theme/colors';

type AuthButtonProps = {
  label: string;
  onPress: () => void;
};

export function AuthButton({ label, onPress }: AuthButtonProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.button}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 9,
    justifyContent: 'center',
    minHeight: 46,
    shadowColor: colors.primaryDark,
    shadowOffset: { height: 6, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
  },
  label: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
});
