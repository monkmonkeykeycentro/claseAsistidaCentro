import productionConfig from '../../firebase-applet-config.json';
import localConfig from '../../firebase.local.json';

export function resolveFirebaseRuntime(environment: { DEV?: boolean; MODE?: string } = {}) {
  const useEmulators = environment.DEV === true && environment.MODE === 'emulator';
  return {
    useEmulators,
    config: useEmulators ? {
      ...productionConfig,
      projectId: 'demo-clase-asistida', apiKey: 'demo-local-api-key',
      appId: '1:1234567890:web:local', authDomain: 'demo-clase-asistida.firebaseapp.com',
      firestoreDatabaseId: '(default)', storageBucket: 'demo-clase-asistida.appspot.com',
    } : productionConfig,
    authEmulatorUrl: `http://${localConfig.emulators.auth.host}:${localConfig.emulators.auth.port}`,
    firestoreEmulator: localConfig.emulators.firestore,
  };
}

export const firebaseRuntime = resolveFirebaseRuntime(import.meta.env ?? {});
