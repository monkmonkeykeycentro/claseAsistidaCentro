import { useMongoDB } from '../config/dataBackend';

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
    return `${prefix} Firebase rechazó los permisos (permission-denied). Comprueba que usas una cuenta administradora y revisa las reglas de la base configurada.`;
  }
  if (code === 'unauthenticated') {
    return `${prefix} La sesión no es válida (unauthenticated). Cierra sesión e inicia sesión de nuevo con la cuenta administradora.`;
  }
  if (code === 'unavailable' || code === 'deadline-exceeded') {
    return `${prefix} Firebase no está disponible (${code}). Comprueba la conexión y vuelve a intentarlo.`;
  }
  const message = detail instanceof Error ? detail.message : typeof detail === 'string' ? detail : '';
  return `${prefix}${code ? ` Firebase: ${code}.` : ''}${message ? ` ${message}` : ' Inténtalo de nuevo; consulta la consola del navegador si el problema continúa.'}`;
}
