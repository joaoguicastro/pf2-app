import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../theme/colors';

type AuthLinkProps = {
  label: string;
  onPress: () => void;
};

export function AuthLink({ label, onPress }: AuthLinkProps) {
  return (
    <Pressable accessibilityRole="link" onPress={onPress} style={styles.link}>
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    alignSelf: 'center',
    paddingVertical: 4,
  },
  text: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
});
