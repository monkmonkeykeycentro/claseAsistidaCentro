// Read-only checks. The deliberately invalid token never represents a user.
const target = process.argv[2];
if (!target || !/^https?:\/\//.test(target)) {
  console.error('Uso: npm run production:check -- https://TU_DOMINIO');
  process.exitCode = 1;
} else {
  const probes = [
    { name: 'MongoDB', path: '/api/health', expected: 200, accepts: (body) => body.ok === true && body.backend === 'mongodb' },
    { name: 'Autenticación (token inválido)', path: '/api/data', expected: 401, accepts: (body) => body.code === 'unauthenticated',
      options: { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer diagnostic-invalid-token' },
        body: JSON.stringify({ action: 'get', path: 'admins/diagnostic' }) } },
  ];
  for (const probe of probes) {
    try {
      const response = await fetch(new URL(probe.path, target), { ...probe.options, signal: AbortSignal.timeout(20000), redirect: 'error' });
      const body = await response.json().catch(() => ({}));
      const ok = response.status === probe.expected && probe.accepts(body);
      // Only print our labels and HTTP status, never arbitrary remote responses.
      console.log(`${ok ? 'OK' : 'FALLO'}: ${probe.name}: HTTP ${response.status}; esperado ${probe.expected}.`);
      if (!ok) process.exitCode = 1;
    } catch {
      console.error(`FALLO: ${probe.name}: no se pudo obtener una respuesta JSON de la API.`);
      process.exitCode = 1;
    }
  }
}
