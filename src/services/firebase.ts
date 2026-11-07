import { logSafeError } from '../utils/safeError';
import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  connectAuthEmulator,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  connectFirestoreEmulator,
} from 'firebase/firestore';
import { doc, getDoc, setDoc, getDocFromServer, onSnapshot, setDatabaseTokenProvider } from './database';
import { useMongoDB } from '../config/dataBackend';
import { firebaseRuntime } from '../config/firebaseRuntime';
import { UserProgress, BuilderState } from '../types/classStructure';

// Initialize Firebase app once
const firebaseConfig = firebaseRuntime.config;
const appName = firebaseRuntime.useEmulators ? 'firebase-local' : '[DEFAULT]';
export const app = getApps().find((existing) => existing.name === appName) ?? initializeApp(firebaseConfig, appName);

export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;
export { firebaseConfig };

const databaseId = (firebaseConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId;
export const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
export const auth = getAuth(app);
setDatabaseTokenProvider(async () => {
  await auth.authStateReady();
  return auth.currentUser?.getIdToken();
});

if (firebaseRuntime.useEmulators && !auth.emulatorConfig) {
  connectAuthEmulator(auth, firebaseRuntime.authEmulatorUrl, { disableWarnings: true });
  const { host, port } = firebaseRuntime.firestoreEmulator;
  if (!useMongoDB) connectFirestoreEmulator(db, host, port);
}

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isCentroStudent: boolean;
  role: 'student' | 'teacher' | 'admin' | 'guest';
}

/**
 * Checks if the email belongs to CENTRO domain (centro.edu.mx)
 */
export function isCentroEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.toLowerCase().endsWith('@centro.edu.mx');
}

// This predicate is for UI only. The server or Firestore rules authorize writes.
export function isUserAdmin(user: AppUser | null): boolean {
  return user?.role === 'admin';
}

export function mapFirebaseUser(user: FirebaseUser | null, administrator = false): AppUser | null {
  if (!user) return null;
  const isCentro = isCentroEmail(user.email);
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || user.email?.split('@')[0] || 'Estudiante',
    photoURL: user.photoURL,
    isCentroStudent: isCentro,
    role: administrator ? 'admin' : isCentro ? 'student' : 'guest',
  };
}

export async function requireCmsAdmin(): Promise<AppUser> {
  await auth.authStateReady();
  const user = auth.currentUser;
  if (!user) throw new Error('Inicia sesión con una cuenta administradora para modificar el contenido.');
  const administrator = (await getDocFromServer(doc(db, 'admins', user.uid))).exists();
  if (auth.currentUser?.uid !== user.uid || !administrator) {
    throw new Error('Esta cuenta no tiene permisos de administrador.');
  }
  return mapFirebaseUser(user, true)!;
}

/**
 * Sign in with Google Popup (preferred in iframe / dev environments)
 */
export async function signInWithGoogle(): Promise<AppUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    let administrator = false;
    try {
      administrator = (await getDocFromServer(doc(db, 'admins', user.uid))).exists();
    } catch {
      // Fail closed when the directory cannot be checked.
    }
    const appUser = mapFirebaseUser(user, administrator)!;

    // Save or update user profile document in Firestore
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Estudiante',
          photoURL: user.photoURL || '',
          isCentroStudent: appUser.isCentroStudent,
          role: appUser.role,
          lastLoginAt: new Date().toISOString(),
        },
        { merge: true }
      );

    } catch (saveError) {
      logSafeError('No se pudo actualizar el perfil en la base de datos:', saveError);
    }

    return appUser;
  } catch (error) {
    logSafeError('Error during Google sign-in:', error);
    throw error;
  }
}

/**
 * Sign out user
 */
export async function signOutApp(): Promise<void> {
  await signOut(auth);
}

/**
 * Subscribe to auth state changes
 */
export function subscribeToAuth(callback: (user: AppUser | null) => void): () => void {
  let unsubscribeAdmin: (() => void) | undefined;
  const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
    unsubscribeAdmin?.();
    if (!firebaseUser) {
      callback(null);
      return;
    }
    callback(mapFirebaseUser(firebaseUser));
    // Cached membership must not grant editor access before server verification.
    unsubscribeAdmin = onSnapshot(doc(db, 'admins', firebaseUser.uid), { includeMetadataChanges: true }, (snapshot) => {
      if (auth.currentUser?.uid === firebaseUser.uid) {
        callback(mapFirebaseUser(firebaseUser, snapshot.exists() && !snapshot.metadata.fromCache));
      }
    }, () => {
      if (auth.currentUser?.uid === firebaseUser.uid) callback(mapFirebaseUser(firebaseUser));
    });
  });
  return () => {
    unsubscribeAuth();
    unsubscribeAdmin?.();
  };
}

/**
 * Save user learning progress to Firestore
 */
export async function saveUserTopicProgress(
  userId: string,
  topicId: string,
  progress: UserProgress,
  builderState?: BuilderState
): Promise<void> {
  if (!userId || !topicId) return;

  try {
    const progressRef = doc(db, 'users', userId, 'progress', topicId);
    await setDoc(
      progressRef,
      {
        userId,
        topicId,
        completedStages: JSON.stringify(progress.stageCompleted),
        stage3CompletedExercises: JSON.stringify(progress.stage3CompletedExercises),
        stage2Placements: JSON.stringify(progress.stage2Placements),
        stage4BuilderCustomized: Boolean(progress.stage4BuilderCustomized),
        savedBuilderState: builderState ? JSON.stringify(builderState) : '',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    logSafeError('No se pudo guardar el avance en la base de datos:', error);
    throw error;
  }
}

/**
 * Load user learning progress from Firestore
 */
export async function loadUserTopicProgress(
  userId: string,
  topicId: string
): Promise<{ progress: Partial<UserProgress>; builderState?: BuilderState } | null> {
  if (!userId || !topicId) return null;

  try {
    const progressRef = doc(db, 'users', userId, 'progress', topicId);
    const snap = await getDoc(progressRef);
    if (!snap.exists()) return null;

    const data = snap.data();
    const loadedProgress: Partial<UserProgress> = {};

    if (data.completedStages) {
      try {
        loadedProgress.stageCompleted = JSON.parse(data.completedStages);
      } catch {
        // ignore
      }
    }

    if (data.stage3CompletedExercises) {
      try {
        loadedProgress.stage3CompletedExercises = JSON.parse(data.stage3CompletedExercises);
      } catch {
        // ignore
      }
    }

    if (data.stage2Placements) {
      try {
        loadedProgress.stage2Placements = JSON.parse(data.stage2Placements);
      } catch {
        // ignore
      }
    }

    if (typeof data.stage4BuilderCustomized === 'boolean') {
      loadedProgress.stage4BuilderCustomized = data.stage4BuilderCustomized;
    }

    let loadedBuilder: BuilderState | undefined;
    if (data.savedBuilderState) {
      try {
        loadedBuilder = JSON.parse(data.savedBuilderState);
      } catch {
        // ignore
      }
    }

    return { progress: loadedProgress, builderState: loadedBuilder };
  } catch (error) {
    logSafeError('No se pudo cargar el avance de la base de datos:', error);
    return null;
  }
}

/**
 * Test connectivity at boot (as recommended in skill)
 */
export async function testConnection(): Promise<void> {
  try {
    if (useMongoDB) return;
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch {
    // Expected to fail if doc doesn't exist or offline, handled gracefully
  }
}

// Test connection on startup
testConnection();
