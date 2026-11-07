import { createRequestQueue } from './requestQueue';

// Only application requests cross this boundary. Database credentials stay on the server.
type Reference = { path: string; kind: 'document' | 'collection'; constraints?: Constraint[] };
type Constraint = { kind: 'where' | 'orderBy'; field: string; op?: string; value?: unknown; direction?: string };
type Operation = { type: 'set' | 'update' | 'delete'; path: string; data?: unknown; merge?: boolean };
type Row = { path: string; data: Record<string, any> };

export function createMongoTransport(getToken: () => Promise<string | undefined>, request = globalThis.fetch) {
  const listeners = new Map<() => void, { ref: Reference; pause: () => void; wake: () => void }>();
  const pendingReads = new Map<string, Promise<any>>();
  const runRequest = createRequestQueue(4);
  const page = typeof document === 'undefined' ? undefined : document;
  const browser = typeof window === 'undefined' ? undefined : window;
  const activePage = () => page?.visibilityState !== 'hidden' && (typeof navigator === 'undefined' || navigator.onLine !== false);
  const resume = () => listeners.forEach(({ pause, wake }) => { if (activePage()) wake(); else pause(); });
  function watchPage(watch: boolean) {
    if (watch) {
      page?.addEventListener('visibilitychange', resume);
      browser?.addEventListener('online', resume);
      browser?.addEventListener('offline', resume);
      browser?.addEventListener('focus', resume);
    } else {
      page?.removeEventListener('visibilitychange', resume);
      browser?.removeEventListener('online', resume);
      browser?.removeEventListener('offline', resume);
      browser?.removeEventListener('focus', resume);
    }
  }
  let generation = 0;
  async function call(body: { action: string; [key: string]: unknown }): Promise<any> {
    const token = await getToken();
    const serialized = JSON.stringify(body);
    // Share concurrent reads only for the same verified session. Do not retain
    // responses across requests, sign-outs, permission changes or failed reads.
    const key = `${generation}:${token || ''}:${serialized}`;
    const read = body.action === 'get' || body.action === 'list';
    if (read && pendingReads.has(key)) return pendingReads.get(key);
    const signal = AbortSignal.timeout(read ? 20000 : 60000);
    const perform = async () => {
      const response = await request('/api/data', {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: serialized, cache: 'no-store', signal,
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        const retry = Number(response.headers.get('Retry-After'));
        throw Object.assign(new Error(result.error || 'No se pudo acceder a los datos.'), {
          code: result.code || 'unavailable', retryAfterMs: Number.isFinite(retry) ? Math.min(Math.max(retry * 1000, 0), 120000) : 0,
        });
      }
      return result;
    };
    const result = runRequest(perform, signal);
    if (read) pendingReads.set(key, result);
    try { return await result; }
    finally { if (read) pendingReads.delete(key); }
  }
  function snapshot(path: string, data?: Record<string, any>) {
    return { id: path.split('/').at(-1)!, exists: () => data !== undefined, data: () => data,
      metadata: { fromCache: false }, ref: { path, kind: 'document' } };
  }
  async function getDoc(ref: Reference) {
    const result = await call({ action: 'get', path: ref.path });
    return snapshot(ref.path, result.data ?? undefined);
  }
  async function getDocs(ref: Reference) {
    const rows: Row[] = [];
    let cursor: string | undefined;
    do {
      const page = await call({ action: 'list', path: ref.path, constraints: ref.constraints || [], cursor });
      rows.push(...page.documents);
      cursor = page.cursor;
    } while (cursor);
    // Pages use the unique path cursor; sort the complete authorized result here.
    for (const constraint of [...(ref.constraints || [])].reverse()) {
      if (constraint.kind === 'orderBy') {
        const value = (row: Row) => constraint.field.split('.').reduce((data, key) => data?.[key], row.data);
        rows.sort((a, b) => (value(a) < value(b) ? -1 : value(a) > value(b) ? 1 : 0) * (constraint.direction === 'desc' ? -1 : 1));
      }
    }
    const docs = rows.map((row) => snapshot(row.path, row.data));
    return { docs, size: docs.length, empty: docs.length === 0, forEach: (fn: (doc: any) => void) => docs.forEach(fn) };
  }
  async function commit(operations: Operation[]) {
    if (!operations.length) return;
    await call({ action: 'commit', operations });
    generation++;
    listeners.forEach(({ ref }, refresh) => {
      if (operations.some((op) => ref.kind === 'document' ? ref.path === op.path : op.path.slice(0, op.path.lastIndexOf('/')) === ref.path)) refresh();
    });
  }
  function writeBatch() {
    const operations: Operation[] = [];
    const batch = {
      set(ref: Reference, data: unknown, options?: { merge?: boolean }) { operations.push({ type: 'set', path: ref.path, data, merge: options?.merge === true }); return batch; },
      update(ref: Reference, data: unknown) { operations.push({ type: 'update', path: ref.path, data }); return batch; },
      delete(ref: Reference) { operations.push({ type: 'delete', path: ref.path }); return batch; },
      commit: () => commit(operations),
    };
    return batch;
  }
  function onSnapshot(ref: Reference, ...args: any[]) {
    const callbackIndex = typeof args[0] === 'function' ? 0 : 1;
    const next = args[callbackIndex];
    const error = args[callbackIndex + 1];
    let stopped = false;
    let running = false;
    let queued = false;
    let previous: string | undefined;
    let emitted = false;
    let retryDelay = 5000;
    let blockedUntil = 0;
    let timer: ReturnType<typeof setTimeout>;
    async function refresh() {
      if (stopped || !activePage()) return;
      if (running) { queued = true; return; }
      clearTimeout(timer);
      running = true;
      let failed = false;
      let serverDelay = 0;
      let nextRetry = 0;
      try {
        const result = ref.kind === 'document' ? await getDoc(ref) : await getDocs(ref);
        const current = JSON.stringify('docs' in result ? result.docs.map((doc) => ({ id: doc.id, data: doc.data() })) : result.data());
        if (!stopped && (!emitted || current !== previous)) { next(result); previous = current; emitted = true; }
        retryDelay = 5000;
        blockedUntil = 0;
      } catch (reason) {
        // Consumers may clear content or permissions after an error. Re-emit the
        // next successful server response even when its data has not changed.
        emitted = false;
        failed = true;
        serverDelay = typeof reason === 'object' && reason && 'retryAfterMs' in reason ? Number(reason.retryAfterMs) || 0 : 0;
        // Spread recovery attempts across tabs rather than retrying in lockstep.
        nextRetry = Math.max(serverDelay, Math.min(60000, Math.round(retryDelay * (1 + Math.random() * 0.2))));
        blockedUntil = Date.now() + nextRetry;
        if (!stopped) error?.(reason);
      }
      finally {
        running = false;
        if (!stopped && activePage()) {
          const interval = ref.path.startsWith('admins/') ? 15000 : 60000;
          // Back off failures even if writes queued another refresh. A saturated
          // server must not receive a stream of immediate retries.
          const delay = failed ? nextRetry : queued ? 0 : interval;
          if (failed) retryDelay = Math.min(retryDelay * 2, 60000);
          queued = false;
          timer = setTimeout(refresh, delay);
        }
      }
    }
    if (listeners.size === 0) watchPage(true);
    listeners.set(refresh, {
      ref, pause: () => { clearTimeout(timer); queued = false; },
      wake: () => {
        if (running) return;
        const remaining = blockedUntil - Date.now();
        if (remaining > 0) { clearTimeout(timer); timer = setTimeout(refresh, remaining); }
        else void refresh();
      },
    });
    void refresh();
    return () => {
      stopped = true; clearTimeout(timer); listeners.delete(refresh);
      if (listeners.size === 0) watchPage(false);
    };
  }
  return {
    doc: (_db: unknown, ...parts: string[]): Reference => ({ path: parts.join('/'), kind: 'document' }),
    collection: (_db: unknown, ...parts: string[]): Reference => ({ path: parts.join('/'), kind: 'collection' }),
    where: (field: string, op: string, value: unknown): Constraint => ({ kind: 'where', field, op, value }),
    orderBy: (field: string, direction = 'asc'): Constraint => ({ kind: 'orderBy', field, direction }),
    query: (ref: Reference, ...constraints: Constraint[]): Reference => ({ ...ref, constraints }),
    getDoc, getDocFromServer: getDoc, getDocs, writeBatch, onSnapshot,
    setDoc: (ref: Reference, data: unknown, options?: { merge?: boolean }) => commit([{ type: 'set', path: ref.path, data, merge: options?.merge === true }]),
    deleteDoc: (ref: Reference) => commit([{ type: 'delete', path: ref.path }]),
  };
}
