import { fail } from './dataModel.mjs';

export async function authenticate(header) {
  if (process.env.FIREBASE_AUTH_EMULATOR_HOST && (process.env.NODE_ENV === 'production' || process.env.VERCEL)) {
    fail('El emulador de autenticación no puede usarse en producción.', 503, 'unavailable');
  }
  if (!header) return null;
  if (typeof header !== 'string' || !header.startsWith('Bearer ')) fail('Sesión no válida.', 401, 'unauthenticated');
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) fail('Configura FIREBASE_PROJECT_ID en el servidor.', 503, 'unavailable');
  let auth;
  try {
    // Public data and health checks do not need to load the authentication SDK.
    const [{ getApps, initializeApp }, { getAuth }] = await Promise.all([
      import('firebase-admin/app'), import('firebase-admin/auth'),
    ]);
    const app = getApps().find((app) => app.name === 'mongodb-api') || initializeApp({ projectId }, 'mongodb-api');
    auth = getAuth(app);
  } catch (error) {
    // Classify startup errors without returning SDK messages, paths or credentials.
    if (['ERR_REQUIRE_ESM', 'ERR_REQUIRE_ASYNC_MODULE'].includes(error?.code)) {
      fail('Una dependencia de autenticación no es compatible con el servidor. Reinstala las dependencias del lockfile y vuelve a desplegar.', 503, 'auth-dependency-incompatible');
    }
    if (['ERR_MODULE_NOT_FOUND', 'MODULE_NOT_FOUND'].includes(error?.code)) {
      fail('Falta una dependencia de autenticación en el despliegue.', 503, 'auth-dependency-missing');
    }
    fail('No se pudo inicializar la autenticación del servidor.', 503, 'auth-initialization-failed');
  }
  try {
    // verifyIdToken validates signature, issuer, audience and expiry. The browser's
    // uid/email/role fields are never used as authentication.
    return await auth.verifyIdToken(header.slice(7));
  } catch { fail('Tu sesión expiró o no es válida. Vuelve a iniciar sesión.', 401, 'unauthenticated'); }
}
