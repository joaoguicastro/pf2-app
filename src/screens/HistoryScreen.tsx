import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { AuthButton } from '../components/AuthButton';
import { getPatientHistoryDetail, listPatientHistory } from '../services/medMaisFacilApi';
import { colors } from '../theme/colors';
import { HistoryAnswer, HistoryCall, HistoryCallDetail, Patient } from '../types/api';
import { SymptomId } from '../types/triage';

const symptomLabels: Record<SymptomId, string> = {
  DOR_TORACICA: 'Dor no peito', DISPNEIA: 'Falta de ar', FEBRE: 'Febre',
  DOR_ABDOMINAL: 'Dor abdominal', CEFALEIA: 'Dor de cabeça',
};
const priorityStyle: Record<string, { label: string; color: string; background: string }> = {
  VERMELHO: { label: 'Emergência', color: '#B42318', background: '#FDECEC' },
  LARANJA: { label: 'Muito urgente', color: '#B54708', background: '#FFF0E4' },
  AMARELO: { label: 'Urgente', color: '#8A6A00', background: '#FFF7D9' },
  VERDE: { label: 'Pouco urgente', color: '#25875F', background: '#EAF7F0' },
  AZUL: { label: 'Não urgente', color: '#257CB6', background: '#E8F4FC' },
};
const statusLabels: Record<string, string> = {
  AGUARDANDO_TRIAGEM: 'Aguardando triagem', EM_FILA: 'Na fila', EM_ATENDIMENTO: 'Em atendimento',
  FINALIZADO: 'Finalizado', EXPIRADO: 'Expirado', CANCELADO: 'Cancelado',
};
const formatDate = (value: string) => new Date(value).toLocaleString('pt-BR', {
  day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

function AnswerGroup({ title, answers }: { title: string; answers: HistoryAnswer[] }) {
  if (!answers?.length) return null;
  return <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {answers.map((answer, index) => <View key={`${answer.pergunta}-${index}`} style={styles.answerRow}>
      <Text style={styles.question}>{answer.pergunta}</Text>
      <Text style={[styles.answer, answer.resposta ? styles.yes : styles.no]}>
        {answer.resposta == null ? 'Sem resposta' : answer.resposta ? 'Sim' : 'Não'}
      </Text>
    </View>)}
  </View>;
}

export function HistoryScreen({ patient, onBack }: { patient: Patient; onBack: () => void }) {
  const [records, setRecords] = useState<HistoryCall[]>([]);
  const [selected, setSelected] = useState<HistoryCallDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    listPatientHistory().then(data => {
      if (active) setRecords(Array.isArray(data) ? data : []);
    }).catch(err => {
      if (active) setError(err instanceof Error ? err.message : 'Não foi possível carregar o histórico.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [attempt]);

  async function openDetail(callId: number) {
    if (typeof patient.id !== 'number' || detailLoading) return;
    setDetailLoading(true); setError('');
    try {
      const detail = await getPatientHistoryDetail(patient.id, callId);
      setSelected(detail);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível abrir este atendimento.');
    } finally { setDetailLoading(false); }
  }

  const priority = selected ? priorityStyle[selected.prioridadeChamado] : null;
  return <SafeAreaView style={styles.safeArea}>
    <AppHeader title={selected ? 'Detalhes do atendimento' : 'Histórico de atendimentos'} onBack={selected ? () => setSelected(null) : onBack} />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {selected ? <>
        <Text style={styles.eyebrow}>ATENDIMENTO #{selected.chamadoId}</Text>
        <Text style={styles.title}>{symptomLabels[selected.sintomaPrincipal] || selected.sintomaPrincipal}</Text>
        <Text style={styles.date}>{formatDate(selected.dataCriacao)}</Text>
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Classificação de Manchester</Text>
          <View style={[styles.badge, { backgroundColor: priority?.background || colors.primaryLight }]}>
            <View style={[styles.dot, { backgroundColor: priority?.color || colors.primary }]} />
            <Text style={[styles.badgeText, { color: priority?.color || colors.primaryDark }]}>
              {priority?.label || selected.prioridadeChamado}
            </Text>
          </View>
          <Text style={styles.status}>Status: {statusLabels[selected.statusChamado] || selected.statusChamado}</Text>
        </View>
        <AnswerGroup title="Sinais gerais de alerta" answers={selected.discriminadoresGerais} />
        <AnswerGroup title="Respostas sobre o sintoma" answers={selected.respostasFluxograma} />
      </> : <>
        <Text style={styles.eyebrow}>SEU CUIDADO</Text>
        <Text style={styles.title}>Histórico de atendimentos</Text>
        <Text style={styles.subtitle}>Consulte as triagens e classificações registradas na sua conta.</Text>
        {loading ? <ActivityIndicator accessibilityLabel="Carregando histórico" color={colors.primary} style={styles.loader} /> : error ? <View style={styles.emptyCard}>
          <Text accessibilityRole="alert" style={styles.error}>{error}</Text>
          <AuthButton label="Tentar novamente" onPress={() => setAttempt(value => value + 1)} />
        </View> : records.length === 0 ? <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>＋</Text>
          <Text style={styles.emptyTitle}>Nenhum atendimento registrado</Text>
          <Text style={styles.emptyText}>Quando você concluir uma triagem, ela aparecerá aqui.</Text>
        </View> : records.map(record => {
          const itemPriority = priorityStyle[record.prioridade];
          return <Pressable key={record.chamadoId} accessibilityRole="button" disabled={detailLoading} onPress={() => void openDetail(record.chamadoId)} style={styles.recordCard}>
            <View style={styles.recordTop}>
              <View style={styles.recordCopy}>
                <Text style={styles.recordTitle}>{symptomLabels[record.sintomaPrincipal] || record.sintomaPrincipal}</Text>
                <Text style={styles.date}>{formatDate(record.dataCriacao)}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </View>
            <View style={styles.recordBottom}>
              <View style={[styles.badge, { backgroundColor: itemPriority?.background || colors.primaryLight }]}>
                <View style={[styles.dot, { backgroundColor: itemPriority?.color || colors.primary }]} />
                <Text style={[styles.badgeText, { color: itemPriority?.color || colors.primaryDark }]}>{itemPriority?.label || record.prioridade}</Text>
              </View>
              <Text style={styles.status}>{statusLabels[record.status] || record.status}</Text>
            </View>
          </Pressable>;
        })}
        {!!error && !loading && records.length > 0 && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        {detailLoading && <View style={styles.loadingOverlay}><ActivityIndicator color={colors.primary} /><Text style={styles.subtitle}>Carregando atendimento…</Text></View>}
      </>}
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingBottom: 40, gap: 14 },
  eyebrow: { color: colors.primaryDark, fontSize: 11, fontWeight: '900', letterSpacing: 0.7 },
  title: { color: colors.text, fontSize: 26, fontWeight: '900' },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  date: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  loader: { marginTop: 40 },
  emptyCard: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: 22, gap: 12, marginTop: 12 },
  emptyIcon: { color: colors.primary, fontSize: 30 },
  emptyTitle: { color: colors.text, fontSize: 16, fontWeight: '800', textAlign: 'center' },
  emptyText: { color: colors.muted, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  recordCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 12, borderWidth: 1, padding: 16, gap: 14 },
  recordTop: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  recordCopy: { flex: 1, gap: 5 },
  recordTitle: { color: colors.text, fontSize: 16, fontWeight: '800' },
  chevron: { color: colors.muted, fontSize: 28 },
  recordBottom: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  badge: { alignItems: 'center', alignSelf: 'flex-start', flexDirection: 'row', gap: 7, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  badgeText: { fontSize: 12, fontWeight: '800' },
  status: { color: colors.muted, fontSize: 12 },
  summaryCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 12, borderWidth: 1, padding: 16, gap: 12, marginTop: 8 },
  section: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 12, borderWidth: 1, padding: 16, gap: 14 },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '900' },
  answerRow: { borderTopColor: colors.border, borderTopWidth: 1, paddingTop: 12, gap: 7 },
  question: { color: colors.text, fontSize: 13, lineHeight: 19 },
  answer: { fontSize: 13, fontWeight: '800' },
  yes: { color: colors.danger },
  no: { color: colors.success },
  error: { color: colors.danger, fontSize: 13, lineHeight: 19 },
  loadingOverlay: { alignItems: 'center', gap: 10, padding: 14 },
});
