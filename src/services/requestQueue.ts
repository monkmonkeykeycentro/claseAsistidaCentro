// Bound browser bursts so opening a catalogue does not start a serverless
// invocation for every document at once. Queued requests retain their deadline.
export function createRequestQueue(limit: number) {
  let active = 0;
  const waiting: Array<() => void> = [];
  function release() {
    active--;
    waiting.shift()?.();
  }
  function acquire(signal: AbortSignal): Promise<() => void> {
    if (signal.aborted) return Promise.reject(signal.reason);
    if (active < limit) { active++; return Promise.resolve(release); }
    return new Promise((resolve, reject) => {
      const start = () => {
        signal.removeEventListener('abort', abort);
        active++;
        resolve(release);
      };
      const abort = () => {
        const index = waiting.indexOf(start);
        if (index !== -1) waiting.splice(index, 1);
        reject(signal.reason);
      };
      signal.addEventListener('abort', abort, { once: true });
      waiting.push(start);
    });
  }
  return async function run<T>(operation: () => Promise<T>, signal: AbortSignal): Promise<T> {
    const free = await acquire(signal);
    try { signal.throwIfAborted(); return await operation(); }
    finally { free(); }
  };
}
