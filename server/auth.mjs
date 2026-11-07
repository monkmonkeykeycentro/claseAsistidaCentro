import { fail } from './dataModel.mjs';

export async function authenticate(header) {
  if (process.env.FIREBASE_AUTH_EMULATOR_HOST && (process.env.NODE_ENV === 'production' || process.env.VERCEL)) {
    fail('El emulador de autenticación no puede usarse en producción.', 503, 'unavailable');
  }
  if (!header) return null;
  if (typeof header !== 'string' || !header.startsWith('Bearer ')) fail('Sesión no válida.', 401, 'unauthenticated');
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) fail('Configura FIREBASE_PROJECT_ID en el servidor.', 503, 'unavailable');
  // Public data and health checks do not need to load the authentication SDK.
  const [{ getApps, initializeApp }, { getAuth }] = await Promise.all([
    import('firebase-admin/app'), import('firebase-admin/auth'),
  ]);
  const app = getApps().find((app) => app.name === 'mongodb-api') || initializeApp({ projectId }, 'mongodb-api');
  try {
    // verifyIdToken validates signature, issuer, audience and expiry. The browser's
    // uid/email/role fields are never used as authentication.
    return await getAuth(app).verifyIdToken(header.slice(7));
  } catch { fail('Tu sesión expiró o no es válida. Vuelve a iniciar sesión.', 401, 'unauthenticated'); }
}
