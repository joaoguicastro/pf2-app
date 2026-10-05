import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { AppHeader } from '../components/AppHeader';
import { AuthButton } from '../components/AuthButton';
import { CheckIn } from '../types/api';
import { colors } from '../theme/colors';

type Props = { checkIn: CheckIn; onFinish: () => void; onChangeHospital: () => void };
export function CheckInScreen({ checkIn, onFinish, onChangeHospital }: Props) {
  return <SafeAreaView style={styles.safeArea}>
    <AppHeader title="Seu check-in" onBack={onChangeHospital} />
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Tudo pronto para sua chegada</Text>
      <Text style={styles.subtitle}>Apresente este código na unidade escolhida para identificar seu atendimento.</Text>
      <View style={styles.card}>
        <Text style={styles.hospital}>{checkIn.hospital.nome}</Text>
        <Text style={styles.subtitle}>{checkIn.hospital.endereco}</Text>
        <View accessible accessibilityLabel={`QR Code do atendimento ${checkIn.chamadoId}`} style={styles.qr}><QRCode value={checkIn.qrCode} size={210} quietZone={12} /></View>
        <Text selectable style={styles.hospital}>Atendimento #{checkIn.chamadoId}</Text>
        <Text style={styles.subtitle}>A entrada na fila será confirmada na unidade após o registro dos sinais vitais.</Text>
      </View>
      <AuthButton label="Concluir" onPress={onFinish} />
    </ScrollView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, gap: 20 },
  title: { color: colors.text, fontSize: 26, fontWeight: '900' },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  card: { backgroundColor: colors.surface, padding: 20, borderRadius: 12, gap: 16 },
  hospital: { color: colors.text, fontSize: 17, fontWeight: '800' },
  qr: { alignItems: 'center', paddingVertical: 12, backgroundColor: '#fff' },
});
