import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AuthButton } from '../components/AuthButton';
import { priorityDetails } from '../data/triage';
import { colors } from '../theme/colors';
import { Patient } from '../types/api';
import { SymptomOption, TriageResult } from '../types/triage';

type HomeScreenProps = {
  lastTriage: { result: TriageResult; symptom: SymptomOption } | null;
  onCreateAccount: () => void;
  onLogout: () => void;
  onStartTriage: () => void;
  patient: Patient | null;
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export function HomeScreen({ lastTriage, onCreateAccount, onLogout, onStartTriage, patient }: HomeScreenProps) {
  const lastPriority = lastTriage ? priorityDetails[lastTriage.result.priority] : null;
  const canSubmitTriage = typeof patient?.id === 'number';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Med+Facil</Text>
            <Text style={styles.brandCaption}>Cuidado que orienta</Text>
          </View>
          <Pressable accessibilityLabel="Sair" accessibilityRole="button" onPress={onLogout} style={styles.profileButton}>
            <Text style={styles.profileInitials}>{patient ? getInitials(patient.nome) : 'P'}</Text>
          </Pressable>
        </View>

        <View style={styles.welcome}>
          <Text style={styles.eyebrow}>OLÁ, {patient?.nome.split(' ')[0].toUpperCase() || 'PACIENTE'}</Text>
          <Text style={styles.title}>Como você está se sentindo hoje?</Text>
          <Text style={styles.subtitle}>
            Faça uma avaliação rápida para receber uma orientação inicial de cuidado.
          </Text>
        </View>

        <View style={styles.triagePanel}>
          <View style={styles.panelTopRow}>
            <View style={styles.plusBadge}>
              <Text style={styles.plus}>+</Text>
            </View>
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>3 a 5 min</Text>
            </View>
          </View>

          <Text style={styles.panelTitle}>Iniciar triagem</Text>
          <Text style={styles.panelDescription}>
            Responda algumas perguntas sobre seus sintomas para entender qual cuidado procurar.
          </Text>

          <View style={styles.steps}>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepLabel}>Sintoma</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.step}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepLabel}>Perguntas</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.step}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepLabel}>Orientação</Text>
            </View>
          </View>

          <AuthButton
            label={canSubmitTriage ? 'Começar avaliação' : 'Criar conta para avaliar'}
            onPress={canSubmitTriage ? onStartTriage : onCreateAccount}
          />
          {!canSubmitTriage ? (
            <Text style={styles.registrationNote}>O cadastro é necessário para enviar as respostas.</Text>
          ) : null}
        </View>

        <View style={styles.emergencyBanner}>
          <View style={styles.emergencyIcon}>
            <Text style={styles.emergencyMark}>!</Text>
          </View>
          <View style={styles.emergencyCopy}>
            <Text style={styles.emergencyTitle}>É uma emergência?</Text>
            <Text style={styles.emergencyText}>Em risco imediato, ligue para o SAMU no número 192.</Text>
          </View>
        </View>

        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>Avaliações recentes</Text>
          <Text style={styles.historyLink}>Ver histórico</Text>
        </View>
        {lastTriage && lastPriority ? (
          <View style={styles.recentTriage}>
            <View style={[styles.recentDot, { backgroundColor: lastPriority.color }]} />
            <View style={styles.emptyCopy}>
              <Text style={styles.emptyTitle}>{lastTriage.symptom.label}</Text>
              <Text style={styles.emptyText}>Classificação: {lastPriority.label}</Text>
            </View>
            <Text style={styles.todayText}>Hoje</Text>
          </View>
        ) : (
          <View style={styles.emptyHistory}>
            <Text style={styles.emptyIcon}>+</Text>
            <View style={styles.emptyCopy}>
              <Text style={styles.emptyTitle}>Nenhuma avaliação ainda</Text>
              <Text style={styles.emptyText}>Suas triagens concluídas aparecerão aqui.</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  brand: { color: colors.primaryDark, fontSize: 24, fontWeight: '900' },
  brandCaption: { color: colors.muted, fontSize: 11, marginTop: 1 },
  content: { paddingBottom: 32, paddingHorizontal: 22 },
  durationBadge: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  durationText: { color: colors.primaryDark, fontSize: 11, fontWeight: '800' },
  emergencyBanner: {
    alignItems: 'center',
    backgroundColor: colors.dangerLight,
    borderColor: '#F5CDD0',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
    padding: 14,
  },
  emergencyCopy: { flex: 1 },
  emergencyIcon: {
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  emergencyMark: { color: colors.white, fontSize: 20, fontWeight: '900' },
  emergencyText: { color: '#7A4B4E', fontSize: 12, lineHeight: 17, marginTop: 2 },
  emergencyTitle: { color: '#7D242A', fontSize: 14, fontWeight: '800' },
  emptyCopy: { flex: 1 },
  emptyHistory: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  emptyIcon: { color: colors.primary, fontSize: 26, fontWeight: '400' },
  emptyText: { color: colors.muted, fontSize: 12, marginTop: 3 },
  emptyTitle: { color: colors.text, fontSize: 14, fontWeight: '700' },
  eyebrow: { color: colors.primaryDark, fontSize: 11, fontWeight: '900' },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 18,
    paddingTop: 12,
  },
  historyHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 26,
  },
  historyLink: { color: colors.primaryDark, fontSize: 12, fontWeight: '800' },
  panelDescription: { color: colors.muted, fontSize: 14, lineHeight: 21, marginBottom: 20 },
  panelTitle: { color: colors.text, fontSize: 22, fontWeight: '900', marginBottom: 7, marginTop: 18 },
  panelTopRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  plus: { color: colors.white, fontSize: 27, fontWeight: '500', lineHeight: 30 },
  plusBadge: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  profileButton: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  profileInitials: { color: colors.primaryDark, fontSize: 13, fontWeight: '900' },
  recentDot: { borderRadius: 7, height: 14, width: 14 },
  recentTriage: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  safeArea: { backgroundColor: colors.background, flex: 1 },
  registrationNote: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 10 },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '900' },
  step: { alignItems: 'center', gap: 5 },
  stepLabel: { color: colors.muted, fontSize: 10, fontWeight: '700' },
  stepLine: {
    backgroundColor: '#A8D8EF',
    flex: 1,
    height: 1,
    marginBottom: 17,
    marginHorizontal: 8,
  },
  stepNumber: {
    backgroundColor: colors.primaryLight,
    borderRadius: 14,
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 28,
    overflow: 'hidden',
    textAlign: 'center',
    width: 28,
  },
  steps: { alignItems: 'center', flexDirection: 'row', marginBottom: 22 },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 9 },
  title: { color: colors.text, fontSize: 27, fontWeight: '900', lineHeight: 34, marginTop: 7 },
  todayText: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  triagePanel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 18,
  },
  welcome: { marginBottom: 22 },
});
