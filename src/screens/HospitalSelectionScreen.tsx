import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { AuthButton } from '../components/AuthButton';
import { getApiErrorMessage } from '../services/apiClient';
import { listHospitals } from '../services/medMaisFacilApi';
import { Hospital } from '../types/api';
import { SymptomId } from '../types/triage';
import { colors } from '../theme/colors';

type Props = { symptomId: SymptomId; onBack: () => void; onSelect: (hospital: Hospital) => Promise<void> };

export function HospitalSelectionScreen({ symptomId, onBack, onSelect }: Props) {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selected, setSelected] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [locationMessage, setLocationMessage] = useState('Permita o acesso à localização para ordenar os hospitais mais próximos.');
  const [blocked, setBlocked] = useState(false);
  const coordinates = useRef<{ latitude: number; longitude: number } | undefined>(undefined);
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Encaminhamento" onBack={() => { if (!saving) onBack(); }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>PRÓXIMO PASSO · ESCOLHA DO HOSPITAL</Text>
        <Text style={styles.title}>Onde você deseja ser atendido?</Text>
        <Text style={styles.subtitle}>Selecione uma unidade que atende o sintoma informado para gerar seu QR Code de check-in.</Text>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Hospitais perto de você</Text>
          <Text style={styles.subtitle}>{locationMessage}</Text>
          <AuthButton disabled={locating || saving || loading} label={locating ? 'Obtendo localização…' : 'Usar minha localização'} onPress={() => void locate()} />
          {blocked && Platform.OS !== 'web' && <Pressable accessibilityRole="button" onPress={() => { void Linking.openSettings().catch(() => setLocationMessage('Abra as configurações do aparelho para permitir a localização.')); }}><Text style={styles.link}>Abrir configurações</Text></Pressable>}
        </View>
        {loading ? <ActivityIndicator accessibilityLabel="Carregando hospitais" color={colors.primary} /> : hospitals.length === 0 && !error ? <Text style={styles.subtitle}>Nenhuma unidade disponível para este sintoma.</Text> : hospitals.map(hospital => (
          <Pressable key={hospital.id} accessibilityRole="radio" accessibilityState={{ checked: selected?.id === hospital.id, disabled: saving || locating }} disabled={saving || locating} onPress={() => setSelected(hospital)} style={[styles.hospital, selected?.id === hospital.id && styles.selected]}>
            <View style={styles.row}><Text style={styles.panelTitle}>{hospital.nome}</Text><Text style={styles.radio}>{selected?.id === hospital.id ? '●' : '○'}</Text></View>
            <Text style={styles.address}>{hospital.endereco}</Text>
            {hospital.distanciaKm != null && <Text style={styles.distance}>{hospital.distanciaKm < 1 ? `${Math.round(hospital.distanciaKm * 1000)} m` : `${hospital.distanciaKm.toFixed(1).replace('.', ',')} km`} de você</Text>}
          </Pressable>
        ))}
        {!!error && <View style={styles.panel}><Text accessibilityRole="alert" style={styles.error}>{error}</Text><Pressable accessibilityRole="button" disabled={saving || locating} onPress={() => void load()}><Text style={styles.link}>Atualizar lista</Text></Pressable></View>}
        <AuthButton disabled={!selected || saving || loading || locating} label={saving ? 'Gerando check-in…' : 'Confirmar hospital e gerar QR Code'} onPress={() => void confirm()} />
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
  panel: { backgroundColor: colors.surface, padding: 16, borderRadius: 12, gap: 12 },
  panelTitle: { color: colors.text, fontSize: 16, fontWeight: '800', flexShrink: 1 },
  hospital: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 16, gap: 8 },
  selected: { borderColor: colors.primary, borderWidth: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  radio: { color: colors.primary, fontSize: 24 },
  address: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  distance: { color: colors.primaryDark, fontWeight: '800', fontSize: 13 },
  link: { color: colors.primaryDark, textAlign: 'center', padding: 10, fontWeight: '700' },
  error: { color: colors.danger },
});
