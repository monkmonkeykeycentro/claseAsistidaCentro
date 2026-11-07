import { firebaseRuntime } from './firebaseRuntime';

export const useMongoDB = import.meta.env?.VITE_DATA_BACKEND === 'mongodb';
export const databaseLabel = useMongoDB ? 'MongoDB Atlas' : firebaseRuntime.useEmulators ? 'Firebase local' : 'Firebase de producción';

export const databaseSource = useMongoDB
  ? { projectId: 'mongodb', databaseId: 'configured-on-server', environment: 'production' as const }
  : { projectId: firebaseRuntime.config.projectId, databaseId: firebaseRuntime.config.firestoreDatabaseId || '(default)', environment: firebaseRuntime.useEmulators ? 'emulator' as const : 'production' as const };
