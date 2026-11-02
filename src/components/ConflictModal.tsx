import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  visible: boolean;
  message: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConflictModal({ visible, message, loading, onConfirm, onCancel }: Props) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View accessibilityViewIsModal style={styles.box}>
          <Text style={styles.title}>Atendimento em aberto</Text>
          <Text accessibilityRole="alert" style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" disabled={loading} onPress={onCancel} style={[styles.button, styles.no]}>
              <Text style={styles.noText}>Não</Text>
            </Pressable>
            <Pressable accessibilityRole="button" disabled={loading} onPress={onConfirm} style={[styles.button, styles.yes, loading && styles.disabled]}>
              <Text style={styles.yesText}>{loading ? 'Aguarde…' : 'Sim'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  box: { backgroundColor: colors.surface, borderRadius: 14, padding: 20, gap: 14, width: '100%', maxWidth: 420 },
  title: { color: colors.text, fontSize: 18, fontWeight: '900' },
  message: { color: colors.danger, fontSize: 14, lineHeight: 21, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 12 },
  button: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  no: { borderWidth: 1, borderColor: colors.border },
  noText: { color: colors.text, fontWeight: '800' },
  yes: { backgroundColor: colors.danger },
  yesText: { color: '#fff', fontWeight: '800' },
  disabled: { opacity: 0.6 },
});