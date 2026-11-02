import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { AuthButton } from '../components/AuthButton';
import { CheckIn } from '../types/api';
import { colors } from '../theme/colors';

type Props = { checkIn: CheckIn; onFinish: () => void; onChangeHospital: () => void };

const NEXT_STEPS = [
  'Dirija-se à unidade escolhida.',
  'Faça o registro dos seus sinais vitais na chegada.',
  'Após o registro, sua entrada na fila será confirmada.',
];

export function CheckInScreen({ checkIn, onFinish, onChangeHospital }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Encaminhamento confirmado" onBack={onChangeHospital} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.badge}><Text style={styles.badgeIcon}>✓</Text></View>
        <Text style={styles.title}>Encaminhamento confirmado</Text>
        <Text style={styles.subtitle}>Você escolheu a unidade abaixo. Siga as orientações para o seu atendimento.</Text>

        <View style={styles.card}>
          <Text style={styles.label}>UNIDADE ESCOLHIDA</Text>
          <Text style={styles.hospital}>{checkIn.hospital.nome}</Text>
          <Text style={styles.subtitle}>{checkIn.hospital.endereco}</Text>
          {/* Referência do atendimento: remova esta linha se não precisar dela */}
          <Text selectable style={styles.reference}>Atendimento #{checkIn.chamadoId}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>PRÓXIMOS PASSOS</Text>
          {NEXT_STEPS.map((step, index) => (
            <View key={step} style={styles.stepRow}>
              <Text style={styles.stepNumber}>{index + 1}</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        <AuthButton label="Concluir" onPress={onFinish} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, gap: 20 },
  badge: { alignSelf: 'center', width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  badgeIcon: { color: '#fff', fontSize: 32, fontWeight: '900' },
  title: { color: colors.text, fontSize: 26, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  card: { backgroundColor: colors.surface, padding: 20, borderRadius: 12, gap: 12 },
  label: { color: colors.primaryDark, fontSize: 11, fontWeight: '800' },
  hospital: { color: colors.text, fontSize: 18, fontWeight: '800' },
  reference: { color: colors.muted, fontSize: 13, fontWeight: '700' },
  stepRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  stepNumber: { color: colors.primaryDark, fontWeight: '900', fontSize: 15, width: 20 },
  stepText: { color: colors.text, fontSize: 14, lineHeight: 21, flex: 1 },
});