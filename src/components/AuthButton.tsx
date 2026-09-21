import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../theme/colors';

type AuthButtonProps = {
  disabled?: boolean;
  label: string;
  onPress: () => void;
};

export function AuthButton({ disabled = false, label, onPress }: AuthButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
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
  buttonDisabled: {
    backgroundColor: '#9DBBC9',
    shadowOpacity: 0,
  },
  buttonPressed: {
    opacity: 0.88,
  },
  label: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
});
