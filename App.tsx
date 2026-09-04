import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';

import { CreateAccountScreen } from './src/screens/CreateAccountScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { LoginScreen } from './src/screens/LoginScreen';

export type ScreenName = 'create-account' | 'login' | 'home';

export default function App() {
  const [screen, setScreen] = useState<ScreenName>('login');

  return (
    <>
      <StatusBar style="dark" />

      {screen === 'login' && (
        <LoginScreen
          onCreateAccount={() => setScreen('create-account')}
          onLogin={() => setScreen('home')}
        />
      )}

      {screen === 'create-account' && (
        <CreateAccountScreen
          onBack={() => setScreen('login')}
          onCreateAccount={() => setScreen('home')}
          onLogin={() => setScreen('login')}
        />
      )}

      {screen === 'home' && <HomeScreen onLogout={() => setScreen('login')} />}
    </>
  );
}
