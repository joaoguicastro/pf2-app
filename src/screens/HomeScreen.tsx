import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '../components/AppHeader';
import { AuthButton } from '../components/AuthButton';
import { colors } from '../theme/colors';

type HomeScreenProps = {
  onLogout: () => void;
};

export function HomeScreen({ onLogout }: HomeScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Home" />

      <View style={styles.content}>
        <View>
          <Text style={styles.brand}>Med+Facil</Text>
          <Text style={styles.title}>Home</Text>
        </View>
        <AuthButton label="Sair" onPress={onLogout} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  brand: {
    color: colors.primaryDark,
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 8,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
  },
});
