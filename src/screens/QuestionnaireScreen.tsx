import { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { AnswerOption } from '../components/AnswerOption';
import { ApiStateView } from '../components/ApiStateView';
import { AppHeader } from '../components/AppHeader';
import { AuthButton } from '../components/AuthButton';
import { ProgressBar } from '../components/ProgressBar';
import { getApiErrorMessage } from '../services/apiClient';
import { getQuestionnaire } from '../services/medMaisFacilApi';
import { colors } from '../theme/colors';
import { SymptomId, TriageAnswers, TriageQuestionnaire, TriageSubmission } from '../types/triage';

type QuestionnaireScreenProps = {
  symptomId: SymptomId;
  symptomLabel: string;
  onBack: () => void;
  onComplete: (submission: TriageSubmission) => Promise<void>;
};

export function QuestionnaireScreen({
  symptomId,
  symptomLabel,
  onBack,
  onComplete,
}: QuestionnaireScreenProps) {
  const [questionnaire, setQuestionnaire] = useState<TriageQuestionnaire | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<TriageAnswers>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadQuestionnaire = useCallback(async () => {
    setLoadError(null);
    setLoading(true);
    try {
      const result = await getQuestionnaire(symptomId);
      if (result.discriminadoresGerais.length + result.perguntaFluxograma.length === 0) {
        setLoadError('Nenhuma pergunta foi encontrada para este sintoma.');
        return;
      }
      setQuestionnaire(result);
    } catch (requestError) {
      setLoadError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [symptomId]);

  useEffect(() => {
    loadQuestionnaire();
  }, [loadQuestionnaire]);

  const questions = useMemo(
    () =>
      questionnaire
        ? [...questionnaire.discriminadoresGerais, ...questionnaire.perguntaFluxograma]
        : [],
    [questionnaire],
  );

  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.key] : undefined;
  const hasAnswer = currentQuestion
    ? Object.prototype.hasOwnProperty.call(answers, currentQuestion.key)
    : false;
  const isGeneralQuestion = currentIndex < (questionnaire?.discriminadoresGerais.length || 0);
  const isLastQuestion = currentIndex === questions.length - 1;

  function handleBack() {
    if (currentIndex === 0) {
      onBack();
      return;
    }
    setCurrentIndex((index) => index - 1);
  }

  async function handleContinue() {
    if (!hasAnswer || !questionnaire || isSubmitting) return;
    if (isLastQuestion) {
      const generalKeys = new Set(questionnaire.discriminadoresGerais.map((question) => question.key));
      const discriminadoresGerais: TriageAnswers = {};
      const respostasFluxograma: TriageAnswers = {};

      Object.entries(answers).forEach(([key, answer]) => {
        if (generalKeys.has(key)) discriminadoresGerais[key] = answer;
        else respostasFluxograma[key] = answer;
      });

      setSubmitError(null);
      setIsSubmitting(true);
      try {
        await onComplete({ discriminadoresGerais, respostasFluxograma, sintomaPrincipal: symptomId });
      } catch (requestError) {
        setSubmitError(getApiErrorMessage(requestError));
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
    setCurrentIndex((index) => index + 1);
  }

  if (loading || loadError || !currentQuestion) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppHeader onBack={onBack} title="Questionário" />
        <ApiStateView error={loadError} loading={loading} onRetry={loadQuestionnaire} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader onBack={handleBack} title="Questionário" />
      <View style={styles.content}>
        <ProgressBar current={currentIndex + 1} total={questions.length} />

        <View style={styles.stageBadge}>
          <Text style={styles.stageText}>
            {isGeneralQuestion ? 'SINAIS GERAIS DE ALERTA' : symptomLabel.toUpperCase()}
          </Text>
        </View>

        <View style={styles.questionArea}>
          <Text style={styles.question}>{currentQuestion.text}</Text>
          <Text style={styles.hint}>Selecione uma resposta para continuar.</Text>

          <View accessibilityRole="radiogroup" style={styles.options}>
            <AnswerOption
              label="Sim"
              onPress={() => {
                setSubmitError(null);
                setAnswers((current) => ({ ...current, [currentQuestion.key]: true }));
              }}
              selected={currentAnswer === true}
            />
            <AnswerOption
              label="Não"
              onPress={() => {
                setSubmitError(null);
                setAnswers((current) => ({ ...current, [currentQuestion.key]: false }));
              }}
              selected={currentAnswer === false && hasAnswer}
            />
          </View>
        </View>

        <View style={styles.footer}>
          {submitError ? <Text style={styles.error}>{submitError}</Text> : null}
          <AuthButton
            disabled={!hasAnswer || isSubmitting}
            label={isSubmitting ? 'Enviando triagem...' : isLastQuestion ? 'Ver resultado' : 'Continuar'}
            onPress={handleContinue}
          />
          <Text style={styles.disclaimer}>Suas respostas serão usadas apenas para esta triagem.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingBottom: 24, paddingHorizontal: 24, paddingTop: 20 },
  disclaimer: { color: colors.muted, fontSize: 11, marginTop: 12, textAlign: 'center' },
  error: {
    backgroundColor: colors.dangerLight,
    borderRadius: 8,
    color: colors.danger,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
    padding: 12,
  },
  footer: { marginTop: 'auto', paddingTop: 22 },
  hint: { color: colors.muted, fontSize: 13, marginTop: 12 },
  options: { gap: 12, marginTop: 26 },
  question: { color: colors.text, fontSize: 24, fontWeight: '900', lineHeight: 33 },
  questionArea: { marginTop: 26 },
  safeArea: { backgroundColor: colors.background, flex: 1 },
  stageBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    marginTop: 22,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  stageText: { color: colors.primaryDark, fontSize: 10, fontWeight: '900' },
});
