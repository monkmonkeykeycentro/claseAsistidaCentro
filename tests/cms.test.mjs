import { test, mock, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Exercise the real auth/service code against an in-memory Firebase SDK boundary.
// These tests do not replace running firestore.rules in the Firebase emulator.
const state = { documents: new Map(), writes: [], writeError: null, readError: null, authCallback: null, listeners: [] };
const auth = { currentUser: null, authStateReady: async () => {} };
const snapshot = (path) => ({ id: path.split('/').at(-1), exists: () => state.documents.has(path), data: () => state.documents.get(path), metadata: { fromCache: false } });
const read = async ({ path }) => { if (state.readError) throw state.readError; return snapshot(path); };
function store({ path }, data, options) {
  state.writes.push({ path, data });
  state.documents.set(path, options?.merge ? { ...state.documents.get(path), ...data } : data);
}
function list(ref) {
  const docs = [...state.documents.entries()]
    .filter(([path, data]) => path.startsWith(ref.path + '/') && path.split('/').length === 2 && (ref.constraints || []).every(({ field, value }) => data[field] === value))
    .map(([path]) => snapshot(path));
  return { docs, empty: docs.length === 0, size: docs.length };
}
mock.module('firebase/app', { namedExports: { initializeApp: () => ({}), getApps: () => [], getApp: () => ({}) } });
mock.module('firebase/auth', { namedExports: {
  getAuth: () => auth, GoogleAuthProvider: class { setCustomParameters() {} },
  signInWithPopup: async () => ({ user: auth.currentUser }), signOut: async () => { auth.currentUser = null; },
  onAuthStateChanged: (_auth, callback) => { state.authCallback = callback; callback(auth.currentUser); return () => { state.authCallback = null; }; },
} });
mock.module('firebase/firestore', { namedExports: {
  getFirestore: () => ({}), doc: (_db, ...parts) => ({ path: parts.join('/') }), collection: (_db, path) => ({ path }),
  query: (ref, ...constraints) => ({ ...ref, constraints }), where: (field, op, value) => ({ field, op, value }),
  getDoc: read, getDocFromServer: read, getDocs: async (ref) => { if (state.readError) throw state.readError; return list(ref); },
  setDoc: async (ref, data, options) => { if (state.writeError) throw state.writeError; store(ref, data, options); },
  deleteDoc: async (ref) => { if (state.writeError) throw state.writeError; state.documents.delete(ref.path); },
  writeBatch: () => {
    const pending = [];
    return {
      set: (...args) => pending.push(() => store(...args)),
      update: (ref, data) => pending.push(() => store(ref, data, { merge: true })),
      delete: (ref) => pending.push(() => state.documents.delete(ref.path)),
      commit: async () => { if (state.writeError) throw state.writeError; pending.forEach((write) => write()); },
    };
  },
  onSnapshot: (ref, optionsOrCallback, callbackOrError, errorCallback) => {
    const callback = typeof optionsOrCallback === 'function' ? optionsOrCallback : callbackOrError;
    const error = typeof optionsOrCallback === 'function' ? callbackOrError : errorCallback;
    const listener = { ref, callback, error };
    state.listeners.push(listener);
    callback(ref.path.includes('/') ? snapshot(ref.path) : list(ref));
    return () => { state.listeners = state.listeners.filter((item) => item !== listener); };
  },
} });
const cms = await import('../src/services/cmsService.ts');
const identity = await import('../src/services/firebase.ts');
const { Header } = await import('../src/components/Header.tsx');
const { AdminDashboard } = await import('../src/components/admin/AdminDashboard.tsx');
const { TopicViewer } = await import('../src/components/TopicViewer.tsx');
const { HomeView } = await import('../src/components/HomeView.tsx');
const { TopicsCatalogueModal } = await import('../src/components/TopicsCatalogueModal.tsx');
const { CmsBlockView } = await import('../src/components/CmsBlockView.tsx');
const { describeCmsError } = await import('../src/utils/cmsErrors.ts');

const account = (email, uid = 'user-1', emailVerified = true) => ({ uid, email, emailVerified, displayName: 'Test', photoURL: null });
const administrator = () => { auth.currentUser = account('jmartineza@centro.edu.mx'); };
const moduleData = { id: 'mod_custom', title: 'Arte', description: 'Sistemas creativos', category: 'Fundamentos', position: 0, status: 'published', visible: true, createdAt: '', updatedAt: '' };
const lesson = { id: 'les_custom', moduleId: moduleData.id, title: 'Nueva lección publicada', summary: 'Resumen', position: 0, status: 'published', visible: true, createdAt: '', updatedAt: '' };
const section = { id: 'sec_custom', lessonId: lesson.id, title: 'Sección nueva', position: 0, visible: true, createdAt: '', updatedAt: '' };
const block = { id: 'blk_custom', sectionId: section.id, type: 'rich-text', content: 'Contenido real del CMS', position: 0, createdAt: '', updatedAt: '' };
const node = { id: 'node_unit', type: 'unit', title: 'Unidad composable', description: 'Unidad editable', status: 'published', visible: true, position: 0, capabilities: ['content', 'container'], metadata: {}, createdAt: '', updatedAt: '' };
const childNode = { id: 'node_tool', type: 'tool', title: 'Herramienta', status: 'draft', visible: true, position: 0, capabilities: ['interactive', 'tool'], metadata: {}, createdAt: '', updatedAt: '' };
const nodeRelation = { id: 'rel_unit_tool', parentId: node.id, childId: childNode.id, relationType: 'contains', position: 0, createdAt: '', updatedAt: '' };
const nodeBlock = { id: 'node_block', nodeId: node.id, type: 'rich-text', position: 0, data: { text: 'Contenido composable' }, createdAt: '', updatedAt: '' };
function curriculum() {
  for (const [name, data] of [['cms_modules', moduleData], ['cms_lessons', lesson], ['cms_sections', section], ['cms_blocks', block]]) state.documents.set(`${name}/${data.id}`, { ...data });
  state.documents.set('cms_site_content/curriculum_initialized', { initialized: true });
}
beforeEach(() => {
  auth.currentUser = null;
  state.documents.clear(); state.writes = []; state.writeError = null; state.readError = null; state.listeners = [];
});

test('visitors, students and admin-prefixed emails cannot perform CMS mutations', async () => {
  for (const user of [null, account('student@centro.edu.mx'), account('admin@example.com'), account('jmartineza@centro.edu.mx', 'unverified', false)]) {
    auth.currentUser = user;
    for (const operation of [
      () => cms.saveCmsModule(moduleData), () => cms.saveCmsLesson(lesson), () => cms.saveCmsSection(section),
      () => cms.saveCmsBlock(block), () => cms.deleteCmsModule(moduleData.id), () => cms.deleteCmsLesson(lesson.id),
      () => cms.deleteCmsSection(section.id), () => cms.deleteCmsBlock(block.id), () => cms.reorderCmsItems('cms_modules', [moduleData.id]),
      () => cms.seedCmsFromExistingContentIfEmpty(), () => cms.exportCurriculumBackup(),
      () => cms.saveSiteContent(cms.DEFAULT_SITE_CONTENT.hero_headline),
      () => cms.saveCmsMediaResource({ id: 'media_1' }), () => cms.deleteCmsMediaResource('media_1'),
    ]) await assert.rejects(operation);
  }
  assert.equal(state.writes.length, 0);
});

test('composable CMS nodes support mixed capabilities, relations and generic blocks', async () => {
  administrator();
  await cms.saveCmsNode(node);
  await cms.saveCmsNode(childNode);
  await cms.saveCmsNodeRelation(nodeRelation);
  await cms.saveCmsNodeBlock(nodeBlock);

  assert.deepEqual((await cms.getCmsNodes()).map(({ id }) => id), [node.id]);
  assert.deepEqual((await cms.getCmsNodes(true)).map(({ id }) => id), [node.id, childNode.id]);
  assert.deepEqual((await cms.getCmsNodeRelations(node.id)).map(({ childId }) => childId), [childNode.id]);
  assert.deepEqual((await cms.getCmsNodeBlocks(node.id)).map(({ id }) => id), [nodeBlock.id]);

  await cms.deleteCmsNode(node.id, true);
  assert.equal(state.documents.has(`cms_nodes/${node.id}`), false);
  assert.equal(state.documents.has(`cms_node_relations/${nodeRelation.id}`), false);
  assert.equal(state.documents.has(`cms_node_blocks/${nodeBlock.id}`), false);
});

test('legacy content migration is idempotent and preserves source collections', async () => {
  administrator();
  state.documents.set(`cms_modules/${moduleData.id}`, { ...moduleData });
  state.documents.set(`cms_lessons/${lesson.id}`, { ...lesson });
  state.documents.set(`cms_sections/${section.id}`, { ...section });
  state.documents.set(`cms_blocks/${block.id}`, { ...block });
  state.documents.set('cms_media/media_miro', {
    id: 'media_miro',
    title: 'Tablero Miro',
    url: 'https://miro.com/app/board/example',
    category: 'tableros',
    createdAt: '',
  });

  const first = await cms.migrateLegacyContentToComposable();
  const second = await cms.migrateLegacyContentToComposable();

  assert.equal(first.migrated, true);
  assert.equal(second.migrated, false);
  assert.ok(first.nodes >= 4);
  assert.ok(first.relations >= 2);
  assert.ok(first.blocks >= 2);
  assert.equal(state.documents.has(`cms_modules/${moduleData.id}`), true);
  assert.equal(state.documents.has(`cms_blocks/${block.id}`), true);
  assert.equal(state.documents.has('cms_nodes/node_resource_media_miro'), true);
});

test('administrator directory grants access, ignores self-assigned profile roles, and revokes access', async () => {
  auth.currentUser = account('teacher@example.com');
  state.documents.set('users/user-1', { role: 'admin' });
  await assert.rejects(identity.requireCmsAdmin);
  state.documents.set('admins/user-1', { email: auth.currentUser.email });
  assert.equal((await identity.requireCmsAdmin()).role, 'admin');
  await cms.saveCmsModule(moduleData);
  state.documents.delete('admins/user-1');
  await assert.rejects(() => cms.saveCmsLesson(lesson));
});

test('auth subscription follows grants and revocations and unsubscribes', () => {
  auth.currentUser = account('teacher@example.com');
  const roles = [];
  const unsubscribe = identity.subscribeToAuth((user) => roles.push(user?.role));
  state.documents.set('admins/user-1', {});
  state.listeners[0].callback(snapshot('admins/user-1'));
  state.documents.delete('admins/user-1');
  state.listeners[0].callback(snapshot('admins/user-1'));
  assert.deepEqual(roles, ['guest', 'guest', 'admin', 'guest']);
  unsubscribe(); assert.equal(state.listeners.length, 0);
});

test('failed Firebase writes reject without creating local success data', async () => {
  administrator();
  state.writeError = new Error('permission-denied');
  for (const operation of [() => cms.saveCmsModule(moduleData), () => cms.saveCmsLesson(lesson), () => cms.saveCmsSection(section), () => cms.saveCmsBlock(block), () => cms.saveSiteContent(cms.DEFAULT_SITE_CONTENT.hero_headline)]) await assert.rejects(operation, /permission-denied/);
  assert.equal(state.documents.size, 0);
});

test('saving a lesson commits metadata, sections and all blocks together and removes undefined fields', async () => {
  administrator();
  await cms.saveCmsLessonContent(lesson, [section], { [section.id]: [{ ...block, filename: undefined }] });
  assert.equal(state.writes.length, 3);
  assert.equal(Object.hasOwn(state.documents.get('cms_blocks/blk_custom'), 'filename'), false);
  state.writeError = new Error('offline');
  await assert.rejects(() => cms.saveCmsLessonContent({ ...lesson, title: 'Rejected title' }, [section], { [section.id]: [block] }));
  assert.equal(state.documents.get('cms_lessons/les_custom').title, lesson.title);
});

test('seeding is administrator-only, atomic, bounded, and idempotent', async () => {
  administrator();
  const result = await cms.seedCmsFromExistingContentIfEmpty();
  assert.equal(result.seeded, true);
  assert.ok(state.writes.length < 500);
  const count = state.writes.length;
  await cms.seedCmsFromExistingContentIfEmpty();
  assert.equal(state.writes.length, count);
  assert.ok(state.documents.has('cms_site_content/curriculum_initialized'));
});

test('failed initialization leaves no partial curriculum', async () => {
  administrator(); state.writeError = new Error('offline');
  const originalError = console.error; console.error = () => {};
  try { await assert.rejects(cms.seedCmsFromExistingContentIfEmpty, /inicializar/); }
  finally { console.error = originalError; }
  assert.equal(state.documents.size, 0);
});

test('published custom lessons retain their identity, sections and every ordered block', async () => {
  curriculum();
  state.documents.set('cms_blocks/blk_second', { ...block, id: 'blk_second', type: 'image', content: 'https://example.com/image.png', position: 1 });
  state.documents.set('cms_lessons/les_second', { ...lesson, id: 'les_second', title: 'Segunda lección', position: 1 });
  const topics = await cms.getAllTopicsFromCmsOrFallback();
  assert.deepEqual(topics.map((topic) => topic.id), ['les_custom', 'les_second']);
  assert.deepEqual(topics[0].concepts[0].blocks.map((item) => item.type), ['rich-text', 'image']);
  assert.equal((await cms.getTopicFromCmsOrFallback('les_custom')).title, lesson.title);
  const html = renderToStaticMarkup(React.createElement(TopicViewer, { topic: topics[0], onNavigateTopic() {}, onOpenCatalogue() {} }));
  assert.match(html, /Contenido real del CMS/); assert.match(html, /https:\/\/example.com\/image.png/);
});

test('topic code blocks can opt into a larger interactive execution', async () => {
  curriculum();
  state.documents.set('cms_blocks/blk_custom', {
    ...block,
    type: 'code',
    contentJava: 'void setup() {}',
    contentP5: 'function setup() { createCanvas(320, 180); }',
    showInteractiveExecution: true,
  });
  const [topic] = await cms.getAllTopicsFromCmsOrFallback();
  const html = renderToStaticMarkup(React.createElement(TopicViewer, { topic, onNavigateTopic() {}, onOpenCatalogue() {} }));
  assert.match(html, /Ejecución interactiva/);
  assert.match(html, /Código p5\.js ejecutándose en el tema/);
});

test('drafts, hidden lessons, hidden sections, archived lessons and hidden modules are excluded publicly', async () => {
  curriculum();
  for (const [id, status, visible] of [['draft', 'draft', true], ['hidden', 'published', false], ['archived', 'archived', true]]) {
    state.documents.set(`cms_lessons/${id}`, { ...lesson, id, status, visible });
  }
  state.documents.set('cms_sections/hidden', { ...section, id: 'hidden', visible: false });
  let topics = await cms.getAllTopicsFromCmsOrFallback();
  assert.equal(topics.length, 1); assert.equal(topics[0].concepts.length, 1);
  state.documents.set('cms_modules/mod_custom', { ...moduleData, visible: false });
  topics = await cms.getAllTopicsFromCmsOrFallback();
  assert.deepEqual(topics, []);
  assert.equal(await cms.getTopicFromCmsOrFallback('les_custom'), null);
});

test('preview requires administrator access and includes drafts', async () => {
  curriculum();
  state.documents.set('cms_lessons/les_custom', { ...lesson, status: 'draft' });
  assert.deepEqual(await cms.getAllTopicsFromCmsOrFallback(), []);
  await assert.rejects(() => cms.getCmsLessons(undefined, true));
  administrator();
  assert.equal((await cms.getAllTopicsFromCmsOrFallback(true))[0].title, lesson.title);
});

test('empty lessons render without crashing', async () => {
  curriculum(); state.documents.delete('cms_sections/sec_custom');
  const [topic] = await cms.getAllTopicsFromCmsOrFallback();
  assert.match(renderToStaticMarkup(React.createElement(TopicViewer, { topic, onNavigateTopic() {}, onOpenCatalogue() {} })), /aún no tiene contenido/);
});

test('CMS controls are absent for visitors and students and visible for verified admins', () => {
  for (const user of [null, identity.mapFirebaseUser(account('admin@example.com')), identity.mapFirebaseUser(account('student@centro.edu.mx'))]) {
    const header = renderToStaticMarkup(React.createElement(Header, { currentView: 'home', currentUser: user, onNavigateAdmin() {} }));
    assert.doesNotMatch(header, /Administrar contenidos/);
    assert.equal(renderToStaticMarkup(React.createElement(AdminDashboard, { currentUser: user })), '');
  }
  const header = renderToStaticMarkup(React.createElement(Header, { currentView: 'home', currentUser: identity.mapFirebaseUser(account('jmartineza@centro.edu.mx'), true), onNavigateAdmin() {} }));
  assert.match(header, /Administrar contenidos/);
});

test('an explicitly empty public catalogue never restores the static curriculum', () => {
  const home = renderToStaticMarkup(React.createElement(HomeView, { topics: [] }));
  assert.doesNotMatch(home, /Lienzo y Ciclo de Vida/);
  const catalogue = renderToStaticMarkup(React.createElement(TopicsCatalogueModal, { isOpen: true, topics: [], onClose() {}, onSelectTopic() {} }));
  assert.match(catalogue, /0 lecciones disponibles/);
  assert.doesNotMatch(catalogue, /Lienzo y Ciclo de Vida/);
});

test('unsafe media and resource protocols are not rendered', () => {
  for (const type of ['image', 'video', 'resources']) {
    const html = renderToStaticMarkup(React.createElement(CmsBlockView, { block: { ...block, type, content: 'javascript:alert(1)' } }));
    assert.doesNotMatch(html, /(?:src|href)="javascript:/);
  }
});

test('initialization repairs partial legacy data without overwriting editorial changes', async () => {
  administrator();
  state.documents.set('cms_modules/mod_canvas', { ...moduleData, id: 'mod_canvas', title: 'Título editado', visible: false });
  state.documents.set('cms_site_content/hero_headline', { ...cms.DEFAULT_SITE_CONTENT.hero_headline, content: 'Titular editado' });
  await cms.seedCmsFromExistingContentIfEmpty();
  assert.equal(state.documents.get('cms_modules/mod_canvas').title, 'Título editado');
  assert.equal(state.documents.get('cms_modules/mod_canvas').visible, false);
  assert.equal(state.documents.get('cms_site_content/hero_headline').content, 'Titular editado');
  assert.ok(state.documents.has('cms_lessons/les_canvas'));
});

test('cached administrator membership cannot grant access before server verification', () => {
  auth.currentUser = account('teacher@example.com');
  const roles = [];
  const unsubscribe = identity.subscribeToAuth((user) => roles.push(user?.role));
  state.documents.set('admins/user-1', {});
  state.listeners[0].callback({ ...snapshot('admins/user-1'), metadata: { fromCache: true } });
  assert.equal(roles.at(-1), 'guest');
  state.listeners[0].callback(snapshot('admins/user-1'));
  assert.equal(roles.at(-1), 'admin');
  unsubscribe();
});

test('a missing administrator directory or a connectivity error fails closed', async () => {
  auth.currentUser = account('teacher@example.com');
  state.documents.set('admins/user-1', {});
  state.readError = new Error('offline');
  await assert.rejects(identity.requireCmsAdmin, /offline/);
  assert.equal(state.writes.length, 0);
});

test('initialization retains the Firebase error code for diagnosis', async () => {
  administrator();
  const denied = Object.assign(new Error('Missing or insufficient permissions.'), { code: 'permission-denied' });
  state.readError = denied;
  const originalError = console.error;
  console.error = () => {};
  try {
    await assert.rejects(cms.seedCmsFromExistingContentIfEmpty, (error) => {
      assert.equal(error.cause, denied);
      const message = describeCmsError(error, 'inicializar el temario');
      assert.match(message, /permission-denied/);
      assert.match(message, /ai-studio-estructuradeunac-271cf9fa-0600-48d9-85d5-b75dad4b646f/);
      assert.match(message, /rugged-precept-406017/);
      return true;
    });
  } finally { console.error = originalError; }
});

test('connection and session failures give their own corrective instructions', () => {
  const unavailable = describeCmsError(Object.assign(new Error('offline'), { code: 'unavailable' }));
  assert.match(unavailable, /conexión/);
  assert.doesNotMatch(unavailable, /firestore.rules/);
  const unauthenticated = describeCmsError(Object.assign(new Error('expired'), { code: 'unauthenticated' }));
  assert.match(unauthenticated, /inicia sesión/);
  const unknown = describeCmsError(new Error('Unexpected document format'));
  assert.match(unknown, /Unexpected document format/);
});

test('code blocks and lessons execute p5 live thumbnail while displaying Processing Java code', async () => {
  curriculum();
  const dualLesson = {
    ...lesson,
    id: 'les_dual',
    title: 'Lección Dual p5 y Java',
    thumbnailP5: 'function setup() { createCanvas(200, 100); } function draw() { background(100); }',
    displayCodeJava: 'void setup() { size(200, 100); }\nvoid draw() { background(100); }',
  };
  const dualSection = {
    ...section,
    id: 'sec_dual',
    lessonId: 'les_dual',
    title: 'Sección con código dual',
  };
  const dualBlock = {
    id: 'blk_dual',
    sectionId: 'sec_dual',
    type: 'code',
    filename: 'dual_sketch.pde',
    content: 'void setup() { size(400, 400); }\nvoid draw() { circle(mouseX, mouseY, 20); }',
    contentJava: 'void setup() { size(400, 400); }\nvoid draw() { circle(mouseX, mouseY, 20); }',
    contentP5: 'function setup() { createCanvas(400, 400); } function draw() { circle(mouseX, mouseY, 20); }',
    position: 0,
    createdAt: '',
    updatedAt: '',
  };
  state.documents.set('cms_lessons/les_dual', dualLesson);
  state.documents.set('cms_sections/sec_dual', dualSection);
  state.documents.set('cms_blocks/blk_dual', dualBlock);

  const topics = await cms.getAllTopicsFromCmsOrFallback();
  const found = topics.find((t) => t.id === 'les_dual');
  assert.ok(found);
  assert.equal(found.thumbnailP5, dualLesson.thumbnailP5);
  assert.equal(found.displayCodeJava, dualLesson.displayCodeJava);
  assert.equal(found.concepts[0].codeSnippetJava, dualBlock.contentJava);
  assert.equal(found.concepts[0].codeSnippetP5, dualBlock.contentP5);
  assert.equal(found.concepts[0].defaultLanguage, 'processing');

  // Code blocks keep the interactive execution opt-in and still display Processing Java.
  const hiddenInteractiveHtml = renderToStaticMarkup(React.createElement(CmsBlockView, { block: dualBlock }));
  assert.doesNotMatch(hiddenInteractiveHtml, /Ejecución interactiva/);
  assert.match(hiddenInteractiveHtml, /Processing/);

  const blockHtml = renderToStaticMarkup(React.createElement(CmsBlockView, {
    block: { ...dualBlock, showInteractiveExecution: true },
  }));
  assert.match(blockHtml, /Ejecución interactiva/);
  assert.match(blockHtml, /circle\(mouseX, mouseY, 20\)/);
});

test('iframe blocks render safe URLs with bounded height', () => {
  const iframeHtml = renderToStaticMarkup(React.createElement(CmsBlockView, {
    block: {
      id: 'blk_iframe',
      sectionId: 'sec_dual',
      type: 'iframe',
      content: 'https://example.com/embed',
      iframeTitle: 'Demo externo',
      iframeHeight: 5000,
      caption: 'Demostración',
      position: 0,
      createdAt: '',
      updatedAt: '',
    },
  }));
  assert.match(iframeHtml, /title="Demo externo"/);
  assert.match(iframeHtml, /height:1200px/);
  assert.match(iframeHtml, /sandbox="allow-scripts allow-forms allow-popups"/);

  const unsafeHtml = renderToStaticMarkup(React.createElement(CmsBlockView, {
    block: {
      id: 'blk_unsafe_iframe',
      sectionId: 'sec_dual',
      type: 'iframe',
      content: 'javascript:alert(1)',
      position: 0,
      createdAt: '',
      updatedAt: '',
    },
  }));
  assert.match(unsafeHtml, /La URL del iframe no es válida/);
});

test('Miro board links are converted to embeddable view-only URLs', () => {
  const miroHtml = renderToStaticMarkup(React.createElement(CmsBlockView, {
    block: {
      id: 'blk_miro',
      sectionId: 'sec_dual',
      type: 'iframe',
      content: 'https://miro.com/app/board/uXjVExampleBoard/',
      iframeTitle: 'Pizarra Miro',
      position: 0,
      createdAt: '',
      updatedAt: '',
    },
  }));
  assert.match(miroHtml, /https:\/\/miro\.com\/app\/live-embed\/uXjVExampleBoard\/\?embedMode=view_only/);
  assert.match(miroHtml, /allow-same-origin/);
  assert.match(miroHtml, /clipboard-read/);

  const embedCodeHtml = renderToStaticMarkup(React.createElement(CmsBlockView, {
    block: {
      id: 'blk_miro_embed_code',
      sectionId: 'sec_dual',
      type: 'iframe',
      content: '<iframe src="https://miro.com/app/live-embed/uXjVExampleBoard/?embedMode=view_only"></iframe>',
      position: 0,
      createdAt: '',
      updatedAt: '',
    },
  }));
  assert.match(embedCodeHtml, /https:\/\/miro\.com\/app\/live-embed\/uXjVExampleBoard\/\?embedMode=view_only/);
});
