import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { colors } from '../theme/colors';

type AuthTextInputProps = TextInputProps & {
  helperText?: string;
  label: string;
};

export function AuthTextInput({ helperText, label, style, ...props }: AuthTextInputProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor="#8CA09B"
        selectionColor={colors.primary}
        style={[styles.input, style]}
        {...props}
      />
      {helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
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
