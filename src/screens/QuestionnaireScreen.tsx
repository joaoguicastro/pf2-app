import { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { AnswerOption } from '../components/AnswerOption';
import { ApiStateView } from '../components/ApiStateView';
import { AppHeader } from '../components/AppHeader';
import { AuthButton } from '../components/AuthButton';
import { ConflictModal } from '../components/ConflictModal';
import { ProgressBar } from '../components/ProgressBar';
import { Skeleton, SkeletonGroup } from '../components/Skeleton';
import { getApiErrorMessage } from '../services/apiClient';
import { getQuestionnaire } from '../services/medMaisFacilApi';
import { colors } from '../theme/colors';
import { SymptomId, TriageAnswers, TriageQuestionnaire, TriageSubmission } from '../types/triage';

type QuestionnaireScreenProps = {
  symptomId: SymptomId;
  symptomLabel: string;
  onBack: () => void;
  onComplete: (submission: TriageSubmission, options?: { confirmarNovoAtendimento?: boolean }) => Promise<void>;
};

function isConflictError(error: unknown) {
  return typeof error === 'object' && error !== null && (error as { status?: number }).status === 409;
}

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
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);

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

  async function submitTriage(confirmarNovoAtendimento = false) {
  if (!questionnaire || isSubmitting) return;

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
    await onComplete(
      { discriminadoresGerais, respostasFluxograma, sintomaPrincipal: symptomId },
      { confirmarNovoAtendimento },
    );
    setConflictMessage(null);
  } catch (requestError) {
    if (isConflictError(requestError) && !confirmarNovoAtendimento) {
      setConflictMessage(getApiErrorMessage(requestError));
    } else {
      setConflictMessage(null);
      setSubmitError(getApiErrorMessage(requestError));
    }
  } finally {
    setIsSubmitting(false);
  }
}

  async function handleContinue() {
    if (!hasAnswer || !questionnaire || isSubmitting) return;
    if (isLastQuestion) {
      await submitTriage(false);
      return;
    }
    setCurrentIndex((index) => index + 1);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppHeader onBack={onBack} title="Questionário" />
        <SkeletonGroup accessibilityLabel="Carregando questionário" style={styles.content}>
          <Skeleton height={12} width={110} />
          <Skeleton height={7} radius={4} style={styles.skeletonGap} />
          <Skeleton height={22} radius={12} style={styles.stageBadgeSkeleton} width={150} />
          <View style={styles.questionArea}>
            <Skeleton height={24} />
            <Skeleton height={24} style={styles.skeletonGap} width="80%" />
            <Skeleton height={13} style={styles.hintSkeleton} width="60%" />
            <View style={styles.options}>
              <Skeleton height={58} radius={8} />
              <Skeleton height={58} radius={8} />
            </View>
          </View>
          <View style={styles.footer}>
            <Skeleton height={48} radius={10} />
          </View>
        </SkeletonGroup>
      </SafeAreaView>
    );
  }

  if (loadError || !currentQuestion) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppHeader onBack={onBack} title="Questionário" />
        <ApiStateView error={loadError} onRetry={loadQuestionnaire} />
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

      <ConflictModal
        visible={conflictMessage !== null}
        message={conflictMessage ?? ''}
        loading={isSubmitting}
        onConfirm={() => void submitTriage(true)}
        onCancel={() => setConflictMessage(null)}
      />
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
  hintSkeleton: { marginTop: 12 },
  skeletonGap: { marginTop: 8 },
  stageBadgeSkeleton: { marginTop: 22 },
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