import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

type ProgressBarProps = {
  current: number;
  total: number;
};

export function ProgressBar({ current, total }: ProgressBarProps) {
  const progress = Math.min(Math.max(current / total, 0), 1);

  return (
    <View>
      <View style={styles.labels}>
        <Text style={styles.label}>Pergunta {current} de {total}</Text>
        <Text style={styles.percentage}>{Math.round(progress * 100)}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    backgroundColor: colors.primary,
    borderRadius: 4,
    height: '100%',
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  percentage: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '800',
  },
  track: {
    backgroundColor: colors.border,
    borderRadius: 4,
    height: 7,
    overflow: 'hidden',
  },
});
