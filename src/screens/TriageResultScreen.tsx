import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '../components/AppHeader';
import { AuthButton } from '../components/AuthButton';
import { priorityDetails } from '../data/triage';
import { colors } from '../theme/colors';
import { TriageResult } from '../types/triage';

type TriageResultScreenProps = {
  result: TriageResult;
  symptomLabel: string;
  onFinish: () => void;
  onRestart: () => void;
};

export function TriageResultScreen({ result, symptomLabel, onFinish, onRestart }: TriageResultScreenProps) {
  const details = priorityDetails[result.priority];

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader onBack={onFinish} title="Resultado da triagem" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.completed}>AVALIAÇÃO CONCLUÍDA</Text>
        <Text style={styles.title}>Sua orientação inicial</Text>
        <Text style={styles.subtitle}>Sintoma avaliado: {symptomLabel}</Text>

        <View style={[styles.priorityPanel, { backgroundColor: details.lightColor, borderColor: details.color }]}>
          <View style={[styles.priorityDot, { backgroundColor: details.color }]} />
          <View style={styles.priorityCopy}>
            <Text style={[styles.priorityCaption, { color: details.color }]}>CLASSIFICAÇÃO</Text>
            <Text style={[styles.priorityTitle, { color: details.color }]}>{details.label}</Text>
            <Text style={styles.priorityAction}>{details.action}</Text>
          </View>
        </View>

        <View style={styles.messagePanel}>
          <Text style={styles.messageTitle}>{result.orientation.urgent ? 'Procure atendimento' : 'Orientação'}</Text>
          <Text style={styles.messageText}>{result.orientation.message}</Text>
          {result.orientation.urgent ? (
            <Text style={styles.samuText}>Em risco imediato, ligue para o SAMU: 192.</Text>
          ) : null}
        </View>

        {result.orientation.homeCare.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cuidados agora</Text>
            {result.orientation.homeCare.map((item) => (
              <View key={item} style={styles.listItem}>
                <Text style={styles.check}>✓</Text>
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Observe estes sinais de alerta</Text>
          {result.orientation.warningSigns.map((item) => (
            <View key={item} style={styles.listItem}>
              <Text style={styles.alertMark}>!</Text>
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.disclaimer}>
          O resultado é uma orientação inicial e não representa diagnóstico médico.
        </Text>

        <View style={styles.footer}>
          <AuthButton label="Concluir" onPress={onFinish} />
          <Pressable accessibilityRole="button" onPress={onRestart} style={styles.restartButton}>
            <Text style={styles.restartText}>Refazer triagem</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  alertMark: { color: colors.danger, fontSize: 15, fontWeight: '900', width: 18 },
  check: { color: colors.success, fontSize: 15, fontWeight: '900', width: 18 },
  completed: { color: colors.primaryDark, fontSize: 11, fontWeight: '900' },
  content: { paddingBottom: 30, paddingHorizontal: 24, paddingTop: 24 },
  disclaimer: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 22, textAlign: 'center' },
  footer: { gap: 10, marginTop: 22 },
  listItem: { alignItems: 'flex-start', flexDirection: 'row', gap: 8, marginTop: 12 },
  listText: { color: colors.text, flex: 1, fontSize: 13, lineHeight: 19 },
  messagePanel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
    padding: 16,
  },
  messageText: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 6 },
  messageTitle: { color: colors.text, fontSize: 16, fontWeight: '900' },
  priorityAction: { color: colors.text, fontSize: 13, lineHeight: 19, marginTop: 5 },
  priorityCaption: { fontSize: 10, fontWeight: '900' },
  priorityCopy: { flex: 1 },
  priorityDot: { borderRadius: 11, height: 22, marginTop: 3, width: 22 },
  priorityPanel: {
    alignItems: 'flex-start',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 13,
    marginTop: 22,
    padding: 16,
  },
  priorityTitle: { fontSize: 22, fontWeight: '900', marginTop: 2 },
  restartButton: { alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  restartText: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  safeArea: { backgroundColor: colors.background, flex: 1 },
  samuText: { color: colors.danger, fontSize: 13, fontWeight: '900', marginTop: 10 },
  section: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
    padding: 16,
  },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '900' },
  subtitle: { color: colors.muted, fontSize: 14, marginTop: 6 },
  title: { color: colors.text, fontSize: 25, fontWeight: '900', marginTop: 6 },
});
