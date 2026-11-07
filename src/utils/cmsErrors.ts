<<<<<<< Updated upstream
import { useMongoDB } from '../config/dataBackend';
=======
import { firebaseRuntime } from '../config/firebaseRuntime';

const firebaseConfig = firebaseRuntime.config;
>>>>>>> Stashed changes

export function describeCmsError(error: unknown, operation = 'cargar el CMS'): string {
  let detail = error;
  // Initialization adds context while preserving the original Firebase error.
  for (let depth = 0; depth < 5; depth++) {
    if (!detail || typeof detail !== 'object' || !('cause' in detail) || !detail.cause) break;
    detail = detail.cause;
  }
  const code = detail && typeof detail === 'object' && 'code' in detail
    ? String(detail.code).replace(/^firestore\//, '') : '';
  const prefix = `No se pudo ${operation}.`;
  if (useMongoDB) {
    if (code === 'permission-denied') return `${prefix} Esta cuenta no tiene permisos para acceder a este contenido.`;
    if (code === 'unauthenticated') return `${prefix} Inicia sesión de nuevo con tu cuenta administradora.`;
    return `${prefix} No se pudo completar la operación en MongoDB. Comprueba la conexión y vuelve a intentarlo.`;
  }
  if (code === 'permission-denied') {
<<<<<<< Updated upstream
    return `${prefix} Firebase rechazó los permisos (permission-denied). Comprueba que usas una cuenta administradora y revisa las reglas de la base configurada.`;
=======
    if (firebaseRuntime.useEmulators) {
      return `${prefix} El emulador rechazó los permisos (permission-denied). Comprueba tu usuario local y el documento admins/<UID> en http://127.0.0.1:4000. Las reglas locales se cargan desde firestore.rules.`;
    }
    return `${prefix} Firebase rechazó los permisos (permission-denied). Comprueba que usas una cuenta administradora y publica firestore.rules en la base ${firebaseConfig.firestoreDatabaseId} del proyecto ${firebaseConfig.projectId}.`;
>>>>>>> Stashed changes
  }
  if (code === 'unauthenticated') {
    return `${prefix} La sesión no es válida (unauthenticated). Cierra sesión e inicia sesión de nuevo con la cuenta administradora.`;
  }
  if (code === 'unavailable' || code === 'deadline-exceeded') {
    if (firebaseRuntime.useEmulators) {
      return `${prefix} El emulador local no está disponible (${code}). Inicia npm run dev:local y comprueba http://127.0.0.1:4000.`;
    }
    return `${prefix} Firebase no está disponible (${code}). Comprueba la conexión y vuelve a intentarlo.`;
  }
  const message = detail instanceof Error ? detail.message : typeof detail === 'string' ? detail : '';
  return `${prefix}${code ? ` Firebase: ${code}.` : ''}${message ? ` ${message}` : ' Inténtalo de nuevo; consulta la consola del navegador si el problema continúa.'}`;
}
