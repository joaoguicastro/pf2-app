import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

type AnswerOptionProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function AnswerOption({ label, onPress, selected }: AnswerOptionProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.option, selected && styles.optionSelected, pressed && styles.pressed]}
    >
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  labelSelected: {
    color: colors.primaryDark,
  },
  option: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 58,
    paddingHorizontal: 16,
  },
  optionSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  pressed: {
    opacity: 0.85,
  },
  radio: {
    alignItems: 'center',
    borderColor: '#9BB2BD',
    borderRadius: 10,
    borderWidth: 2,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  radioDot: {
    backgroundColor: colors.white,
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  radioSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});
