import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '../components/AppHeader';
import { AuthButton } from '../components/AuthButton';
import { colors } from '../theme/colors';

type TriageIntroScreenProps = {
  onBack: () => void;
  onContinue: () => void;
};

const steps = [
  'Escolha o sintoma que mais incomoda você agora.',
  'Responda às perguntas com atenção e sinceridade.',
  'Receba uma classificação e orientações iniciais.',
];

export function TriageIntroScreen({ onBack, onContinue }: TriageIntroScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader onBack={onBack} title="Triagem" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.symbol}>
          <Text style={styles.symbolText}>+</Text>
        </View>
        <Text style={styles.title}>Antes de começar</Text>
        <Text style={styles.description}>
          Esta avaliação leva poucos minutos e ajuda a indicar o nível de urgência dos seus sintomas.
        </Text>

        <View style={styles.stepList}>
          {steps.map((step, index) => (
            <View key={step} style={styles.stepRow}>
              <Text style={styles.stepNumber}>{index + 1}</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        <View style={styles.warning}>
          <Text style={styles.warningMark}>!</Text>
          <View style={styles.warningCopy}>
            <Text style={styles.warningTitle}>Atenção</Text>
            <Text style={styles.warningText}>
              Esta triagem não substitui consulta ou diagnóstico médico. Em emergência, ligue 192.
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <AuthButton label="Entendi, continuar" onPress={onContinue} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingBottom: 28, paddingHorizontal: 24, paddingTop: 28 },
  description: { color: colors.muted, fontSize: 15, lineHeight: 23, textAlign: 'center' },
  footer: { marginTop: 'auto', paddingTop: 28 },
  safeArea: { backgroundColor: colors.background, flex: 1 },
  stepList: { gap: 15, marginTop: 30 },
  stepNumber: {
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 32,
    overflow: 'hidden',
    textAlign: 'center',
    width: 32,
  },
  stepRow: { alignItems: 'center', flexDirection: 'row', gap: 13 },
  stepText: { color: colors.text, flex: 1, fontSize: 14, lineHeight: 20 },
  symbol: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 34,
    height: 68,
    justifyContent: 'center',
    width: 68,
  },
  symbolText: { color: colors.primary, fontSize: 42, fontWeight: '400', lineHeight: 47 },
  title: {
    color: colors.text,
    fontSize: 25,
    fontWeight: '900',
    marginBottom: 10,
    marginTop: 18,
    textAlign: 'center',
  },
  warning: {
    alignItems: 'flex-start',
    backgroundColor: colors.dangerLight,
    borderColor: '#F5CDD0',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 11,
    marginTop: 30,
    padding: 14,
  },
  warningCopy: { flex: 1 },
  warningMark: { color: colors.danger, fontSize: 20, fontWeight: '900' },
  warningText: { color: '#724A4D', fontSize: 12, lineHeight: 18, marginTop: 3 },
  warningTitle: { color: '#7D242A', fontSize: 14, fontWeight: '900' },
});
