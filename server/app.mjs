import express from 'express';
import { dataHandler, healthHandler, sendApiError } from './handlers.mjs';

export const app = express();
app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.set({ 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin' });
  next();
});
app.use(express.json({ limit: '8mb' }));
app.all('/api/health', healthHandler);
app.all('/api/data', dataHandler);
app.use('/api', (_req, res) => res.status(404).json({ code: 'not-found', error: 'Ruta no encontrada.' }));
app.use((error, _req, res, _next) => {
  sendApiError(res, error);
});
