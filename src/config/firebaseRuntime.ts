<<<<<<< Updated upstream
import localConfig from '../../firebase.local.json';

type RuntimeEnvironment = { DEV?: boolean; MODE?: string } & Partial<Record<
  'VITE_DATA_BACKEND' | 'VITE_FIREBASE_PROJECT_ID' | 'VITE_FIREBASE_API_KEY' | 'VITE_FIREBASE_APP_ID' |
  'VITE_FIREBASE_AUTH_DOMAIN' | 'VITE_FIREBASE_FIRESTORE_DATABASE_ID' | 'VITE_FIREBASE_STORAGE_BUCKET' |
  'VITE_FIREBASE_MESSAGING_SENDER_ID' | 'VITE_FIREBASE_MEASUREMENT_ID', string>>;
export function resolveFirebaseRuntime(environment: RuntimeEnvironment = {}) {
  const productionConfig = {
    projectId: environment.VITE_FIREBASE_PROJECT_ID || '', apiKey: environment.VITE_FIREBASE_API_KEY || '',
    appId: environment.VITE_FIREBASE_APP_ID || '', authDomain: environment.VITE_FIREBASE_AUTH_DOMAIN || '',
    firestoreDatabaseId: environment.VITE_FIREBASE_FIRESTORE_DATABASE_ID || '(default)',
    storageBucket: environment.VITE_FIREBASE_STORAGE_BUCKET || '', messagingSenderId: environment.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    measurementId: environment.VITE_FIREBASE_MEASUREMENT_ID || '',
  };
  const useEmulators = environment.DEV === true && environment.MODE === 'emulator' && environment.VITE_DATA_BACKEND !== 'mongodb';
  return {
    useEmulators,
    config: useEmulators ? {
      ...productionConfig,
      projectId: 'demo-clase-asistida', apiKey: 'demo-local-api-key',
      appId: '1:1234567890:web:local', authDomain: 'demo-clase-asistida.firebaseapp.com',
      firestoreDatabaseId: '(default)', storageBucket: 'demo-clase-asistida.appspot.com',
    } : productionConfig,
=======
import productionConfig from '../../firebase-applet-config.json';
import localConfig from '../../firebase.local.json';

interface FirebaseEnvironment {
  DEV?: boolean;
  MODE?: string;
}

export function resolveFirebaseRuntime(environment: FirebaseEnvironment = {}) {
  // A production build always uses the published project's configuration.
  const useEmulators = environment.DEV === true && environment.MODE === 'emulator';
  const config = useEmulators ? {
    ...productionConfig,
    projectId: 'demo-clase-asistida',
    apiKey: 'demo-local-api-key',
    appId: '1:1234567890:web:local',
    authDomain: 'demo-clase-asistida.firebaseapp.com',
    storageBucket: 'demo-clase-asistida.appspot.com',
    firestoreDatabaseId: '(default)',
    oAuthClientId: '',
  } : productionConfig;

  return {
    useEmulators,
    config,
>>>>>>> Stashed changes
    authEmulatorUrl: `http://${localConfig.emulators.auth.host}:${localConfig.emulators.auth.port}`,
    firestoreEmulator: localConfig.emulators.firestore,
  };
}

export const firebaseRuntime = resolveFirebaseRuntime(import.meta.env ?? {});
