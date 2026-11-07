import { authenticate } from './auth.mjs';
import { connectDatabase } from './mongodb.mjs';
import { createDataService } from './dataService.mjs';
import { fail } from './dataModel.mjs';

export function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.end(JSON.stringify(body));
}

export function sendApiError(res, error) {
  let status = 503;
  let code = 'unavailable';
  let message = 'No se pudo completar la operación del servidor.';
  if (error?.type === 'entity.parse.failed') {
    status = 400;
    code = 'invalid-argument';
    message = 'JSON no válido.';
  } else if (error?.type === 'entity.too.large') {
    status = 413;
    code = 'invalid-argument';
    message = 'La solicitud supera el tamaño permitido.';
  } else if (error?.isApplicationError === true && Number.isInteger(error.status) && error.status >= 400 && error.status <= 599) {
    status = error.status;
    code = error.code;
    message = error.message;
  } else if (['ERR_MODULE_NOT_FOUND', 'MODULE_NOT_FOUND'].includes(error?.code)) {
    code = 'dependency-missing';
    message = 'Falta una dependencia de la API en el despliegue.';
  } else if (error?.name === 'MongoParseError' || error?.name === 'MongoInvalidArgumentError') {
    code = 'database-configuration-invalid';
    message = 'Revisa el formato de MONGODB_URI y MONGODB_DB en el servidor.';
  } else if (error?.name === 'MongoServerError' && [18, 8000].includes(error.code)) {
    code = 'database-authentication-failed';
    message = 'Atlas rechazó las credenciales del usuario de base de datos.';
  } else if (error?.name === 'MongoServerError' && error.code === 13) {
    code = 'database-permission-denied';
    message = 'El usuario de base de datos no tiene acceso a la base configurada.';
  } else if (error?.name === 'MongoWaitQueueTimeoutError') {
    code = 'database-busy';
    message = 'La base de datos está ocupada. Vuelve a intentarlo en unos segundos.';
  } else if (['MongoServerSelectionError', 'MongoNetworkError', 'MongoNetworkTimeoutError'].includes(error?.name) || ['ENOTFOUND', 'ECONNREFUSED', 'ETIMEDOUT', 'EAI_AGAIN', 'EREFUSED'].includes(error?.code)) {
    code = 'database-unreachable';
    message = 'La API no pudo conectar con Atlas. Revisa acceso de red, DNS y disponibilidad del clúster.';
  }
  // Do not log SDK errors: messages/causes may contain URIs, tokens and identities.
  if (code === 'database-busy') res.setHeader('Retry-After', '5');
  if (status >= 500) console.error(JSON.stringify({ event: 'api_request_failed', code, status }));
  sendJson(res, status, { ok: false, code, error: message });
}

async function readJson(req) {
  const maximum = 8 * 1024 * 1024;
  let body = req.body; // Vercel can provide an already parsed body.
  if (body === undefined) {
    if (Number(req.headers['content-length']) > maximum) fail('La solicitud supera el tamaño permitido.', 413, 'invalid-argument');
    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
      size += Buffer.byteLength(chunk);
      if (size > maximum) fail('La solicitud supera el tamaño permitido.', 413, 'invalid-argument');
      chunks.push(Buffer.from(chunk));
    }
    body = Buffer.concat(chunks).toString('utf8');
  }
  if (Buffer.isBuffer(body)) body = body.toString('utf8');
  if (typeof body === 'string') {
    if (Buffer.byteLength(body) > maximum) fail('La solicitud supera el tamaño permitido.', 413, 'invalid-argument');
    try { body = JSON.parse(body); } catch { fail('JSON no válido.'); }
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) fail('La solicitud debe contener un objeto JSON.');
  return body;
}

export async function healthHandler(req, res) {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.setHeader('Allow', 'GET, HEAD');
    sendJson(res, 405, { code: 'method-not-allowed', error: 'Usa GET para comprobar el servidor.' });
    return;
  }
  const missing = ['MONGODB_URI', 'MONGODB_DB', 'FIREBASE_PROJECT_ID'].filter((name) => !process.env[name]?.trim());
  if (missing.length) {
    sendJson(res, 503, { ok: false, code: 'server-configuration-missing', missing, error: 'Faltan variables del servidor en este despliegue.' });
    return;
  }
  if (process.env.VITE_FIREBASE_PROJECT_ID && process.env.FIREBASE_PROJECT_ID !== process.env.VITE_FIREBASE_PROJECT_ID) {
    sendJson(res, 503, { ok: false, code: 'firebase-project-mismatch', error: 'El proyecto de Firebase del servidor no coincide con el del cliente.' });
    return;
  }
  if (process.env.FIREBASE_AUTH_EMULATOR_HOST && (process.env.NODE_ENV === 'production' || process.env.VERCEL)) {
    sendJson(res, 503, { ok: false, code: 'auth-emulator-not-allowed', error: 'Quita FIREBASE_AUTH_EMULATOR_HOST del entorno de producción.' });
    return;
  }
  try {
    const { db } = await connectDatabase();
    await db.command({ ping: 1 });
    sendJson(res, 200, { ok: true, backend: 'mongodb' });
  } catch (error) { sendApiError(res, error); }
}

export async function dataHandler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    sendJson(res, 405, { code: 'method-not-allowed', error: 'Usa POST para consultar la API.' });
    return;
  }
  try {
    const body = await readJson(req);
    const user = await authenticate(req.headers.authorization);
    const { db, client } = await connectDatabase();
    sendJson(res, 200, await createDataService(db, client)(body, user));
  } catch (error) { sendApiError(res, error); }
}
