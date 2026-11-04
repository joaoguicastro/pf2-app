import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { colors } from '../theme/colors';

type AuthTextInputProps = TextInputProps & {
  error?: string | null;
  helperText?: string;
  label: string;
};

export function AuthTextInput({ error, helperText, label, style, ...props }: AuthTextInputProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityHint={error ?? helperText}
        accessibilityLabel={label}
        placeholderTextColor="#8CA09B"
        selectionColor={colors.primary}
        style={[styles.input, error ? styles.inputError : null, style]}
        {...props}
      />
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helper}>{helperText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  error: {
    color: colors.danger,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  helper: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 4,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    minHeight: 42,
    paddingHorizontal: 14,
  },
  inputError: {
    backgroundColor: colors.dangerLight,
    borderColor: colors.danger,
  },
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 7,
  },
  wrapper: {
    marginBottom: 16,
  },
});
