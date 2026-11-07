// An explicit allowlist prevents a future VITE_* secret from being published.
export const publicEnvironmentNames = [
  'VITE_DATA_BACKEND', 'VITE_GOOGLE_CLIENT_ID', 'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_APP_ID', 'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_FIRESTORE_DATABASE_ID', 'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID', 'VITE_FIREBASE_MEASUREMENT_ID',
];
export function publicEnvironment(environment) {
  return Object.fromEntries(publicEnvironmentNames.map((name) => [name, environment[name] || '']));
}
export function validateProductionEnvironment(environment) {
  const required = ['VITE_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_APP_ID', 'VITE_FIREBASE_AUTH_DOMAIN'];
  const missing = required.filter((name) => !environment[name]);
  if (missing.length) throw new Error(`Faltan variables públicas de Firebase para compilar: ${missing.join(', ')}.`);
  if (environment.VITE_DATA_BACKEND !== 'mongodb') throw new Error('La publicación requiere VITE_DATA_BACKEND=mongodb para aplicar la protección de datos de la API.');
  if (environment.FIREBASE_PROJECT_ID && environment.FIREBASE_PROJECT_ID !== environment.VITE_FIREBASE_PROJECT_ID) throw new Error('FIREBASE_PROJECT_ID y VITE_FIREBASE_PROJECT_ID deben corresponder al mismo proyecto.');
  if (environment.VERCEL === '1') {
    const serverMissing = ['MONGODB_URI', 'MONGODB_DB', 'FIREBASE_PROJECT_ID'].filter((name) => !environment[name]?.trim());
    if (serverMissing.length) throw new Error(`Faltan variables privadas del servidor en Vercel: ${serverMissing.join(', ')}. Configúralas para este entorno y vuelve a desplegar.`);
    if (!/^mongodb(?:\+srv)?:\/\/\S+$/.test(environment.MONGODB_URI)) throw new Error('MONGODB_URI debe comenzar por mongodb:// o mongodb+srv://, sin comillas exteriores ni espacios.');
  }
}
