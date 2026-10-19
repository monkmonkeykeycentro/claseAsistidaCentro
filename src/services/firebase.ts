import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProgress, BuilderState } from '../types/classStructure';

// Initialize Firebase app once
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const databaseId = (firebaseConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId;
export const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
export const auth = getAuth(app);

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
  role: 'student' | 'teacher' | 'guest';
}

/**
 * Checks if the email belongs to CENTRO domain (centro.edu.mx)
 */
export function isCentroEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.toLowerCase().endsWith('@centro.edu.mx');
}

/**
 * Formats a Firebase user into our app user interface
 */
export function mapFirebaseUser(user: FirebaseUser | null): AppUser | null {
  if (!user) return null;
  const isCentro = isCentroEmail(user.email);
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || user.email?.split('@')[0] || 'Estudiante',
    photoURL: user.photoURL,
    isCentroStudent: isCentro,
    role: isCentro ? 'student' : 'guest',
  };
}

/**
 * Sign in with Google Popup (preferred in iframe / dev environments)
 */
export async function signInWithGoogle(): Promise<AppUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const appUser = mapFirebaseUser(user)!;

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
      console.warn('Could not update user profile in Firestore (non-fatal):', saveError);
    }

    return appUser;
  } catch (error) {
    console.error('Error during Google sign-in:', error);
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
  return onAuthStateChanged(auth, (firebaseUser) => {
    callback(mapFirebaseUser(firebaseUser));
  });
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
    console.warn('Error saving progress to Firestore:', error);
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
    console.warn('Error loading progress from Firestore:', error);
    return null;
  }
}

/**
 * Test connectivity at boot (as recommended in skill)
 */
export async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch {
    // Expected to fail if doc doesn't exist or offline, handled gracefully
  }
}

// Test connection on startup
testConnection();
