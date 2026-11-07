import { test, mock } from 'node:test';
import assert from 'node:assert/strict';

// Drive the hook through navigation and delayed network replies without a DOM.
let active;
const fetches = [];
const hooks = {
  useState(initial) {
    const runner = active;
    const index = runner.cursor++;
    if (!(index in runner.slots)) runner.slots[index] = typeof initial === 'function' ? initial() : initial;
    return [runner.slots[index], (value) => { runner.slots[index] = typeof value === 'function' ? value(runner.slots[index]) : value; }];
  },
  useRef(initial) { const [ref] = hooks.useState(() => ({ current: initial })); return ref; },
  useCallback(callback, deps) {
    const ref = hooks.useRef();
    if (!ref.current || deps.some((value, index) => value !== ref.current.deps[index])) ref.current = { value: callback, deps };
    return ref.current.value;
  },
  useEffect(effect, deps) {
    const runner = active;
    const index = runner.cursor++;
    const previous = runner.slots[index];
    if (!previous || deps.some((value, i) => value !== previous.deps[i])) {
      runner.effects.push(() => { previous?.cleanup?.(); runner.slots[index] = { deps, cleanup: effect() }; });
    }
  },
};
mock.module('react', { namedExports: hooks });
mock.module('../src/services/cmsService.ts', { namedExports: {
  getAllTopicsFromCmsOrFallback: (preview) => new Promise((resolve, reject) => fetches.push({ preview, resolve, reject })),
} });
const { useCurriculumContent } = await import('../src/app/useCurriculumContent.ts');
const topic = (id) => ({ id, number: 1, title: id, summary: '', category: 'Fundamentos', badge: '', estimatedTime: '1 min', conceptsCount: 0, concepts: [] });
const settle = () => new Promise((resolve) => setImmediate(resolve));
function runner(t, args) {
  fetches.length = 0;
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;
  const listeners = new Map();
  globalThis.window = { addEventListener: (type, callback) => listeners.set(type, callback), removeEventListener: (type) => listeners.delete(type) };
  globalThis.document = { visibilityState: 'visible' };
  const state = { slots: [], cursor: 0, effects: [], args,
    render() {
      active = state; state.cursor = 0; state.effects = [];
      const result = useCurriculumContent(...state.args);
      state.effects.forEach((effect) => effect());
      return result;
    },
  };
  t.after(() => {
    for (const slot of state.slots) slot?.cleanup?.();
    if (previousWindow === undefined) delete globalThis.window; else globalThis.window = previousWindow;
    if (previousDocument === undefined) delete globalThis.document; else globalThis.document = previousDocument;
  });
  return state;
}

test('curriculum waits for saved content, reuses it across lesson navigation and retains it on refresh failure', async (t) => {
  const view = runner(t, [false, false, 'home']);
  let result = view.render();
  assert.deepEqual(result.topics, []);
  assert.equal(result.isLoading, true);
  assert.equal(fetches.length, 1);
  fetches[0].resolve([topic('published')]); await settle();
  result = view.render();
  assert.equal(result.topics[0].title, 'published');
  view.args[2] = 'topic'; view.render();
  view.args[2] = 'home'; view.render();
  assert.equal(fetches.length, 1);
  result.reload(); view.render();
  assert.equal(fetches.length, 2);
  assert.equal(view.render().isLoading, false);
  fetches[1].reject(new Error('offline')); await settle();
  result = view.render();
  assert.ok(result.error);
  assert.deepEqual(result.topics.map((item) => item.id), ['published']);
  result.reload(); view.render();
  fetches[2].resolve([topic('updated')]); await settle();
  assert.equal(view.render().topics[0].id, 'updated');
});

test('draft curriculum is hidden immediately when administrator access is lost', async (t) => {
  const view = runner(t, [true, true, 'home']);
  view.render();
  assert.equal(fetches[0].preview, true);
  fetches[0].resolve([topic('private-draft')]); await settle();
  assert.equal(view.render().topics[0].id, 'private-draft');
  view.args[0] = false;
  const result = view.render();
  assert.deepEqual(result.topics, []);
  assert.equal(result.isLoading, true);
  assert.equal(fetches[1].preview, false);
  fetches[1].resolve([topic('public')]); await settle();
  assert.deepEqual(view.render().topics.map((item) => item.id), ['public']);
});
