import * as Location from 'expo-location';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { AuthButton } from '../components/AuthButton';
import { getApiErrorMessage } from '../services/apiClient';
import { Coordinates } from '../services/location';
import { listHospitals } from '../services/medMaisFacilApi';
import { Hospital } from '../types/api';
import { NearestUnitApi, SymptomId } from '../types/triage';
import { colors } from '../theme/colors';

type Props = {
  symptomId: SymptomId;
  initialCoordinates?: Coordinates;
  nearest?: NearestUnitApi | null;
  onBack: () => void;
  onSelect: (hospital: Hospital) => Promise<void>;
};

const OTHERS_LIMIT = 4; // 1 mais próximo + 4 demais = 5 no total

function occupancyLabel(hospital: Hospital) {
  const percentage = hospital.ocupacaoPercentual;
  if (percentage == null) return 'Lotação não informada';
  if (hospital.lotada || percentage >= 100) return `Lotado · ${percentage}% da capacidade`;
  if (percentage >= 70) return `Ocupação alta · ${percentage}% da capacidade`;
  if (percentage >= 30) return `Ocupação moderada · ${percentage}% da capacidade`;
  return `Ocupação baixa · ${percentage}% da capacidade`;
}

function occupancyStyle(hospital: Hospital) {
  if (hospital.ocupacaoPercentual == null) return styles.occupancyUnknown;
  if (hospital.lotada || hospital.ocupacaoPercentual >= 70) return styles.occupancyHigh;
  if (hospital.ocupacaoPercentual >= 30) return styles.occupancyModerate;
  return styles.occupancyLow;
}

function formatDistance(km: number) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1).replace('.', ',')} km`;
}

function normalize(text: string) {
  return text.trim().toLowerCase();
}

type CardProps = { hospital: Hospital; selected: boolean; disabled: boolean; highlight?: boolean; onPress: () => void };

function HospitalCard({ hospital, selected, disabled, highlight, onPress }: CardProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.hospital, highlight && styles.highlight, selected && styles.selected]}
    >
      <View style={styles.row}>
        <Text style={styles.panelTitle}>{hospital.nome}</Text>
        <Text style={styles.radio}>{selected ? '●' : '○'}</Text>
      </View>
      <Text style={styles.address}>{hospital.endereco}</Text>
      {hospital.distanciaKm != null && <Text style={styles.distance}>{formatDistance(hospital.distanciaKm)} de você</Text>}
      <View accessibilityLabel={occupancyLabel(hospital)} style={[styles.occupancyBadge, occupancyStyle(hospital)]}>
        <Text style={styles.occupancyText}>{occupancyLabel(hospital)}</Text>
        {hospital.ocupacaoAtual != null && hospital.limiteLotacao != null && hospital.limiteLotacao > 0 && (
          <Text style={styles.occupancyDetail}>{hospital.ocupacaoAtual} na fila · limite {hospital.limiteLotacao}</Text>
        )}
      </View>
    </Pressable>
  );
}

export function HospitalSelectionScreen({ symptomId, initialCoordinates, nearest, onBack, onSelect }: Props) {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selected, setSelected] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [located, setLocated] = useState(!!initialCoordinates);
  const [nearestHint, setNearestHint] = useState<NearestUnitApi | null>(nearest ?? null);
  const [locationMessage, setLocationMessage] = useState(
    initialCoordinates
      ? 'Hospitais ordenados por proximidade. Distância aproximada em linha reta.'
      : 'Permita o acesso à localização para ver os hospitais mais próximos.',
  );
  const [blocked, setBlocked] = useState(false);
  const coordinates = useRef<Coordinates | undefined>(initialCoordinates);
  const request = useRef(0);
  const mounted = useRef(true);
  const savingRef = useRef(false);

  async function load() {
    const id = ++request.current;
    setLoading(true);
    setError('');
    try {
      const result = await listHospitals(symptomId, coordinates.current);
      if (mounted.current && id === request.current) {
        setHospitals(result);
        setSelected(current => result.find(h => h.id === current?.id) ?? null);
      }
    } catch (e) {
      if (mounted.current && id === request.current) setError(getApiErrorMessage(e));
    } finally {
      if (mounted.current && id === request.current) setLoading(false);
    }
  }

  useEffect(() => {
    mounted.current = true;
    void load();
    return () => { mounted.current = false; request.current++; };
  }, [symptomId]);

  async function locate() {
    setLocating(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!mounted.current) return;
      setBlocked(!permission.canAskAgain && !permission.granted);
      if (!permission.granted) {
        setLocationMessage('Localização não autorizada. Você pode escolher um hospital pela lista ou liberar o acesso nas configurações.');
        return;
      }
      if (!await Location.hasServicesEnabledAsync()) {
        setLocationMessage('Ative a localização do aparelho e tente novamente, ou escolha um hospital manualmente.');
        return;
      }
      let timer: ReturnType<typeof setTimeout> | undefined;
      const position = await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('timeout')), 15000); }),
      ]).finally(() => clearTimeout(timer));
      if (!mounted.current) return;
      coordinates.current = { latitude: position.coords.latitude, longitude: position.coords.longitude };
      setNearestHint(null); // posição nova: o "mais próximo" é recalculado pela lista
      setLocated(true);
      setLocationMessage('Hospitais ordenados por proximidade. Distância aproximada em linha reta.');
      await load();
    } catch {
      if (mounted.current) setLocationMessage('Não foi possível obter sua localização. Tente novamente ou escolha pela lista.');
    } finally {
      if (mounted.current) setLocating(false);
    }
  }

  async function confirm() {
    if (!selected || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setError('');
    try { await onSelect(selected); }
    catch (e) { if (mounted.current) setError(getApiErrorMessage(e)); }
    finally { savingRef.current = false; if (mounted.current) setSaving(false); }
  }

  const { nearestHospital, others } = useMemo(() => {
    if (!located) return { nearestHospital: null as Hospital | null, others: hospitals };
    const sorted = [...hospitals].sort((a, b) => (a.distanciaKm ?? Infinity) - (b.distanciaKm ?? Infinity));
    const fromBackend = nearestHint
      ? sorted.find(h => (nearestHint.id != null && h.id === nearestHint.id) || normalize(h.nome) === normalize(nearestHint.nome))
      : undefined;
    const near = fromBackend ?? sorted[0] ?? null;
    return {
      nearestHospital: near,
      others: sorted.filter(h => h.id !== near?.id).slice(0, OTHERS_LIMIT),
    };
  }, [hospitals, located, nearestHint]);

  const busy = saving || locating;

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Encaminhamento" onBack={() => { if (!saving) onBack(); }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>PRÓXIMO PASSO · ESCOLHA DO HOSPITAL</Text>
        <Text style={styles.title}>Onde você deseja ser atendido?</Text>
        <Text style={styles.subtitle}>Selecione uma unidade que atende o sintoma informado.</Text>

        <View style={styles.panel}>
          <Text style={styles.subtitle}>{locationMessage}</Text>
          <Text style={styles.occupancyHint}>A lotação considera a fila atual e a capacidade informada pela unidade.</Text>
          <AuthButton
            disabled={busy || loading}
            label={locating ? 'Obtendo localização…' : located ? 'Atualizar minha localização' : 'Usar minha localização'}
            onPress={() => void locate()}
          />
          {blocked && Platform.OS !== 'web' && (
            <Pressable accessibilityRole="button" onPress={() => { void Linking.openSettings().catch(() => setLocationMessage('Abra as configurações do aparelho para permitir a localização.')); }}>
              <Text style={styles.link}>Abrir configurações</Text>
            </Pressable>
          )}
        </View>

        {loading ? (
          <ActivityIndicator accessibilityLabel="Carregando hospitais" color={colors.primary} />
        ) : !nearestHospital && others.length === 0 && !error ? (
          <Text style={styles.subtitle}>Nenhuma unidade disponível para este sintoma.</Text>
        ) : (
          <>
            {nearestHospital && (
              <>
                <Text style={styles.sectionLabel}>HOSPITAL MAIS PRÓXIMO</Text>
                <HospitalCard highlight disabled={busy} hospital={nearestHospital} selected={selected?.id === nearestHospital.id} onPress={() => setSelected(nearestHospital)} />
              </>
            )}
            {others.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>{nearestHospital ? 'DEMAIS HOSPITAIS' : 'HOSPITAIS DISPONÍVEIS'}</Text>
                {others.map(hospital => (
                  <HospitalCard key={hospital.id} disabled={busy} hospital={hospital} selected={selected?.id === hospital.id} onPress={() => setSelected(hospital)} />
                ))}
              </>
            )}
          </>
        )}

        {!!error && (
          <View style={styles.panel}>
            <Text accessibilityRole="alert" style={styles.error}>{error}</Text>
            <Pressable accessibilityRole="button" disabled={busy} onPress={() => void load()}><Text style={styles.link}>Atualizar lista</Text></Pressable>
          </View>
        )}
        <AuthButton disabled={!selected || busy || loading} label={saving ? 'Confirmando…' : 'Confirmar hospital'} onPress={() => void confirm()} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, gap: 16, paddingBottom: 40 },
  eyebrow: { color: colors.primaryDark, fontSize: 11, fontWeight: '800' },
  title: { color: colors.text, fontSize: 26, fontWeight: '900' },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  sectionLabel: { color: colors.primaryDark, fontSize: 11, fontWeight: '900', marginTop: 4 },
  panel: { backgroundColor: colors.surface, padding: 16, borderRadius: 12, gap: 12 },
  panelTitle: { color: colors.text, fontSize: 16, fontWeight: '800', flexShrink: 1 },
  hospital: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 16, gap: 8 },
  highlight: { borderColor: colors.primaryDark },
  selected: { borderColor: colors.primary, borderWidth: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  radio: { color: colors.primary, fontSize: 24 },
  address: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  distance: { color: colors.primaryDark, fontWeight: '800', fontSize: 13 },
  occupancyHint: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  occupancyBadge: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 9, gap: 3 },
  occupancyHigh: { backgroundColor: colors.dangerLight },
  occupancyModerate: { backgroundColor: '#FFF5DF' },
  occupancyLow: { backgroundColor: '#E8F6EF' },
  occupancyUnknown: { backgroundColor: colors.infoLight },
  occupancyText: { color: colors.text, fontSize: 13, fontWeight: '800' },
  occupancyDetail: { color: colors.muted, fontSize: 11 },
  link: { color: colors.primaryDark, textAlign: 'center', padding: 10, fontWeight: '700' },
  error: { color: colors.danger },
});