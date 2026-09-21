import { useCallback, useEffect, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ApiStateView } from '../components/ApiStateView';
import { AppHeader } from '../components/AppHeader';
import { getApiErrorMessage } from '../services/apiClient';
import { listSymptoms } from '../services/medMaisFacilApi';
import { colors } from '../theme/colors';
import { SymptomOption } from '../types/triage';

type SymptomSelectionScreenProps = {
  onBack: () => void;
  onSelect: (symptom: SymptomOption) => void;
};

export function SymptomSelectionScreen({ onBack, onSelect }: SymptomSelectionScreenProps) {
  const [symptoms, setSymptoms] = useState<SymptomOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSymptoms = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      setSymptoms(await listSymptoms());
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSymptoms();
  }, [loadSymptoms]);

  if (loading || error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppHeader onBack={onBack} title="Sintoma principal" />
        <ApiStateView error={error} loading={loading} onRetry={loadSymptoms} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader onBack={onBack} title="Sintoma principal" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.step}>ETAPA 1 DE 3</Text>
        <Text style={styles.title}>O que mais incomoda você agora?</Text>
        <Text style={styles.description}>
          Escolha apenas o sintoma principal. Você poderá informar outros sinais nas próximas etapas.
        </Text>

        <View style={styles.list}>
          {symptoms.map((symptom) => (
            <Pressable
              accessibilityRole="button"
              key={symptom.id}
              onPress={() => onSelect(symptom)}
              style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
            >
              <View style={styles.symbolBox}>
                <Text style={styles.symbolText}>{symptom.shortLabel}</Text>
              </View>
              <View style={styles.optionCopy}>
                <Text style={styles.optionTitle}>{symptom.label}</Text>
                <Text style={styles.optionDescription}>{symptom.description}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  chevron: { color: colors.primary, fontSize: 27, lineHeight: 28 },
  content: { paddingBottom: 28, paddingHorizontal: 24, paddingTop: 24 },
  description: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 9 },
  list: { gap: 11, marginTop: 24 },
  option: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 13,
    minHeight: 82,
    padding: 14,
  },
  optionCopy: { flex: 1 },
  optionDescription: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 3 },
  optionPressed: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  optionTitle: { color: colors.text, fontSize: 15, fontWeight: '900' },
  safeArea: { backgroundColor: colors.background, flex: 1 },
  step: { color: colors.primaryDark, fontSize: 11, fontWeight: '900' },
  symbolBox: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 7,
    height: 48,
    justifyContent: 'center',
    width: 54,
  },
  symbolText: { color: colors.primaryDark, fontSize: 10, fontWeight: '900', textAlign: 'center' },
  title: { color: colors.text, fontSize: 25, fontWeight: '900', lineHeight: 32, marginTop: 7 },
});
