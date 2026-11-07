import express from 'express';
import { authenticate } from './auth.mjs';
import { connectDatabase } from './mongodb.mjs';
import { createDataService } from './dataService.mjs';

export const app = express();
app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.set({ 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin' });
  next();
});
app.use(express.json({ limit: '8mb' }));
app.get('/api/health', async (_req, res, next) => {
  try {
    const { db } = await connectDatabase();
    await db.command({ ping: 1 });
    res.json({ ok: true, backend: 'mongodb' });
  } catch (error) { next(error); }
});
app.post('/api/data', async (req, res, next) => {
  try {
    const user = await authenticate(req.headers.authorization);
    const { db, client } = await connectDatabase();
    res.json(await createDataService(db, client)(req.body, user));
  } catch (error) { next(error); }
});
app.use('/api', (_req, res) => res.status(404).json({ code: 'not-found', error: 'Ruta no encontrada.' }));
app.use((error, _req, res, _next) => {
  const status = error.status || 503;
  // Driver errors may contain infrastructure details; return only application errors.
  res.status(status).json({ code: error.code && error.status ? error.code : 'unavailable', error: error.status ? (error.type === 'entity.parse.failed' ? 'JSON no válido.' : error.message) : 'No se pudo conectar con MongoDB. Revisa la configuración del servidor.' });
});
