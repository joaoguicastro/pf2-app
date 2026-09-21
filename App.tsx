import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';

import { CreateAccountScreen } from './src/screens/CreateAccountScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { QuestionnaireScreen } from './src/screens/QuestionnaireScreen';
import { SymptomSelectionScreen } from './src/screens/SymptomSelectionScreen';
import { TriageIntroScreen } from './src/screens/TriageIntroScreen';
import { TriageResultScreen } from './src/screens/TriageResultScreen';
import { createCall, createPatient } from './src/services/medMaisFacilApi';
import { CreatePatientRequest, LoginRequest, Patient } from './src/types/api';
import { SymptomOption, TriageResult, TriageSubmission } from './src/types/triage';

export type ScreenName =
  | 'create-account'
  | 'login'
  | 'home'
  | 'triage-intro'
  | 'symptom-selection'
  | 'questionnaire'
  | 'triage-result';

export default function App() {
  const [screen, setScreen] = useState<ScreenName>('login');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [selectedSymptom, setSelectedSymptom] = useState<SymptomOption | null>(null);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [lastTriage, setLastTriage] = useState<{
    result: TriageResult;
    symptom: SymptomOption;
  } | null>(null);

  function startTriage() {
    if (typeof patient?.id !== 'number') {
      setScreen('create-account');
      return;
    }
    setSelectedSymptom(null);
    setTriageResult(null);
    setScreen('triage-intro');
  }

  function selectSymptom(symptom: SymptomOption) {
    setSelectedSymptom(symptom);
    setScreen('questionnaire');
  }

  async function handleLogin(payload: LoginRequest) {
    setPatient({ email: payload.email, nome: payload.email.split('@')[0] || 'Paciente' });
    setScreen('home');
  }

  async function handleCreateAccount(payload: CreatePatientRequest) {
    const createdPatient = await createPatient(payload);
    setPatient(createdPatient);
    setScreen('home');
  }

  function handleLogout() {
    setPatient(null);
    setLastTriage(null);
    setSelectedSymptom(null);
    setTriageResult(null);
    setScreen('login');
  }

  async function finishQuestionnaire(submission: TriageSubmission) {
    if (typeof patient?.id !== 'number' || !selectedSymptom) {
      throw new Error('É necessário criar um cadastro para enviar a triagem.');
    }
    const result = await createCall(patient.id, submission);
    setTriageResult(result);
    setLastTriage({ result, symptom: selectedSymptom });
    setScreen('triage-result');
  }

  return (
    <>
      <StatusBar style="dark" />
      {screen === 'login' && (
        <LoginScreen
          onCreateAccount={() => setScreen('create-account')}
          onLogin={handleLogin}
        />
      )}

      {screen === 'create-account' && (
        <CreateAccountScreen
          onBack={() => setScreen('login')}
          onCreateAccount={handleCreateAccount}
          onLogin={() => setScreen('login')}
        />
      )}

      {screen === 'home' && (
        <HomeScreen
          lastTriage={lastTriage}
          onCreateAccount={() => setScreen('create-account')}
          onLogout={handleLogout}
          onStartTriage={startTriage}
          patient={patient}
        />
      )}

      {screen === 'triage-intro' && (
        <TriageIntroScreen
          onBack={() => setScreen('home')}
          onContinue={() => setScreen('symptom-selection')}
        />
      )}

      {screen === 'symptom-selection' && (
        <SymptomSelectionScreen onBack={() => setScreen('triage-intro')} onSelect={selectSymptom} />
      )}

      {screen === 'questionnaire' && selectedSymptom && (
        <QuestionnaireScreen
          key={selectedSymptom.id}
          onBack={() => setScreen('symptom-selection')}
          onComplete={finishQuestionnaire}
          symptomId={selectedSymptom.id}
          symptomLabel={selectedSymptom.label}
        />
      )}

      {screen === 'triage-result' && selectedSymptom && triageResult && (
        <TriageResultScreen
          onFinish={() => setScreen('home')}
          onRestart={startTriage}
          result={triageResult}
          symptomLabel={selectedSymptom.label}
        />
      )}
    </>
  );
}
