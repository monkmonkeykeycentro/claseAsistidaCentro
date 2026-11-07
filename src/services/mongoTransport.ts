// Only application requests cross this boundary. Database credentials stay on the server.
type Reference = { path: string; kind: 'document' | 'collection'; constraints?: Constraint[] };
type Constraint = { kind: 'where' | 'orderBy'; field: string; op?: string; value?: unknown; direction?: string };
type Operation = { type: 'set' | 'update' | 'delete'; path: string; data?: unknown; merge?: boolean };
type Row = { path: string; data: Record<string, any> };

export function createMongoTransport(getToken: () => Promise<string | undefined>, request = globalThis.fetch) {
  const listeners = new Set<() => void>();
  async function call(body: unknown): Promise<any> {
    const token = await getToken();
    const response = await request('/api/data', {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body), cache: 'no-store',
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw Object.assign(new Error(result.error || 'No se pudo acceder a los datos.'), { code: result.code || 'unavailable' });
    return result;
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
    listeners.forEach((refresh) => refresh());
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
    let timer: ReturnType<typeof setTimeout>;
    async function refresh() {
      if (stopped) return;
      if (running) { queued = true; return; }
      clearTimeout(timer);
      running = true;
      try {
        const result = ref.kind === 'document' ? await getDoc(ref) : await getDocs(ref);
        const current = JSON.stringify('docs' in result ? result.docs.map((doc) => ({ id: doc.id, data: doc.data() })) : result.data());
        if (!stopped && (!emitted || current !== previous)) { next(result); previous = current; emitted = true; }
      } catch (reason) {
        // Consumers may clear content or permissions after an error. Re-emit the
        // next successful server response even when its data has not changed.
        emitted = false;
        if (!stopped) error?.(reason);
      }
      finally {
        running = false;
        if (!stopped) {
          const delay = queued ? 0 : 15000;
          queued = false;
          timer = setTimeout(refresh, delay);
        }
      }
    }
    listeners.add(refresh);
    void refresh();
    return () => { stopped = true; clearTimeout(timer); listeners.delete(refresh); };
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
