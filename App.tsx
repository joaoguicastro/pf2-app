import { HospitalSelectionScreen } from './src/screens/HospitalSelectionScreen';
import { CheckInScreen } from './src/screens/CheckInScreen';
import { CheckIn, Hospital } from './src/types/api';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';

import { CreateAccountScreen } from './src/screens/CreateAccountScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { QuestionnaireScreen } from './src/screens/QuestionnaireScreen';
import { SymptomSelectionScreen } from './src/screens/SymptomSelectionScreen';
import { TriageIntroScreen } from './src/screens/TriageIntroScreen';
import { TriageResultScreen } from './src/screens/TriageResultScreen';
import { createCall, createPatient, loginPatient, patientFromToken, selectHospital } from './src/services/medMaisFacilApi';
import { CreatePatientRequest, LoginRequest, Patient } from './src/types/api';
import { clearAuthToken, loadAuthToken, saveAuthToken, setAuthToken } from './src/services/apiClient';
import { SymptomOption, TriageResult, TriageSubmission } from './src/types/triage';

export type ScreenName =
  | 'create-account'
  | 'login'
  | 'home'
  | 'history'
  | 'triage-intro'
  | 'symptom-selection'
  | 'questionnaire'
  | 'triage-result'
  | 'hospital-selection'
  | 'check-in';

export default function App() {
  const [checkIn, setCheckIn] = useState<CheckIn | null>(null);
  const [screen, setScreen] = useState<ScreenName>('login');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [selectedSymptom, setSelectedSymptom] = useState<SymptomOption | null>(null);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [lastTriage, setLastTriage] = useState<{
    result: TriageResult;
    symptom: SymptomOption;
  } | null>(null);

  useEffect(() => {
    let active = true;
    void loadAuthToken().then(async (token) => {
      if (!active || !token) return;
      try {
        const restoredPatient = patientFromToken(token);
        setAuthToken(token);
        setPatient(restoredPatient);
        setScreen('home');
      } catch {
        await clearAuthToken();
      }
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  function startTriage() {
    if (typeof patient?.id !== 'number') {
      setScreen('create-account');
      return;
    }
    setCheckIn(null);
    setSelectedSymptom(null);
    setTriageResult(null);
    setScreen('triage-intro');
  }

  function selectSymptom(symptom: SymptomOption) {
    setSelectedSymptom(symptom);
    setScreen('questionnaire');
  }

  async function handleLogin(payload: LoginRequest) {
    const session = await loginPatient(payload);
    await saveAuthToken(session.token);
    setPatient(session.patient);
    setScreen('home');
  }

  async function handleCreateAccount(payload: CreatePatientRequest) {
    const createdPatient = await createPatient(payload);
    const session = await loginPatient({ email: createdPatient.email, senha: payload.senha });
    await saveAuthToken(session.token);
    setPatient(session.patient);
    setScreen('home');
  }

  function handleLogout() {
    void clearAuthToken();
    setPatient(null);
    setLastTriage(null);
    setCheckIn(null);
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

  async function handleHospitalSelection(hospital: Hospital) {
    if (typeof patient?.id !== 'number' || !triageResult) throw new Error('Atendimento não encontrado.');
    const result = await selectHospital(patient.id, triageResult.id, hospital.id);
    setCheckIn(result);
    setScreen('check-in');
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
          onResumeTriage={() => {
            if (!lastTriage) return;
            setSelectedSymptom(lastTriage.symptom);
            setTriageResult(lastTriage.result);
            setScreen(checkIn?.chamadoId === lastTriage.result.id ? 'check-in' : 'triage-result');
          }}
          onCreateAccount={() => setScreen('create-account')}
          onViewHistory={() => setScreen('history')}
          onLogout={handleLogout}
          onStartTriage={startTriage}
          patient={patient}
        />
      )}

      {screen === 'history' && patient && (
        <HistoryScreen patient={patient} onBack={() => setScreen('home')} />
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

      {screen === 'hospital-selection' && selectedSymptom && triageResult && (
        <HospitalSelectionScreen symptomId={selectedSymptom.id} onBack={() => setScreen('triage-result')} onSelect={handleHospitalSelection} />
      )}
      {screen === 'check-in' && checkIn && (
        <CheckInScreen checkIn={checkIn} onFinish={() => setScreen('home')} onChangeHospital={() => setScreen('hospital-selection')} />
      )}
      {screen === 'triage-result' && selectedSymptom && triageResult && (
        <TriageResultScreen
          onContinue={() => setScreen('hospital-selection')}
          onFinish={() => setScreen('home')}
          onRestart={startTriage}
          result={triageResult}
          symptomLabel={selectedSymptom.label}
        />
      )}
    </>
  );
}
