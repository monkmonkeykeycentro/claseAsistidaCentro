export default async function health(req, res) {
  try {
    const { healthHandler } = await import('../server/handlers.mjs');
    await healthHandler(req, res);
  } catch (error) {
    const reason = ['ERR_MODULE_NOT_FOUND', 'MODULE_NOT_FOUND'].includes(error?.code) ? 'dependency-missing' : 'runtime-startup-failed';
    console.error(JSON.stringify({ event: 'api_startup_failed', endpoint: 'health', reason }));
    if (res.headersSent) { res.end(); return; }
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.end(JSON.stringify({ ok: false, code: 'api-initialization-failed', reason, error: 'No se pudo iniciar la API del servidor.' }));
  }
}
