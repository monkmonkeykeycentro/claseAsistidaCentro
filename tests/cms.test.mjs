import { test, mock, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { parseAppRoute, routeHash } from '../src/app/routeState.ts';
import { getLessonProgressPercentage, getLessonStatus, getLessonUnitId, getUnitEvaluationSummary, inferUnitId, normalizeTopic } from '../src/types/learning.ts';
import { areUnitPrerequisitesComplete, normalizeUnit } from '../src/types/learning.ts';
import { DEFAULT_HOME_CONFIG } from '../src/types/cms.ts';
import { HomePresentation } from '../src/components/HomePresentation.tsx';

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
mock.module('../src/config/firebaseRuntime.ts', { namedExports: {
  firebaseRuntime: { useEmulators: false, config: { projectId: 'test-project', firestoreDatabaseId: 'test-database' } },
} });
mock.module('firebase/app', { namedExports: { initializeApp: () => ({}), getApps: () => [], getApp: () => ({}) } });
mock.module('firebase/auth', { namedExports: {
  connectAuthEmulator: () => {},
  getAuth: () => auth, GoogleAuthProvider: class { setCustomParameters() {} },
  signInWithPopup: async () => ({ user: auth.currentUser }), signOut: async () => { auth.currentUser = null; },
  onAuthStateChanged: (_auth, callback) => { state.authCallback = callback; callback(auth.currentUser); return () => { state.authCallback = null; }; },
} });
mock.module('firebase/firestore', { namedExports: {
  connectFirestoreEmulator: () => {},
  getFirestore: () => ({}), doc: (_db, ...parts) => ({ path: parts.join('/') }), collection: (_db, path) => ({ path }),
  query: (ref, ...constraints) => ({ ...ref, constraints }), where: (field, op, value) => ({ field, op, value }),
  orderBy: (field, direction) => ({ field, direction }),
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
const designerContent = await import('../src/services/classDesignerContentService.ts');
const { DEFAULT_CLASS_DESIGNER_CONTENT } = await import('../src/data/classDesignerContent.ts');
const { ClassDesignerContentContext, ClassDesignerStepIntro } = await import('../src/components/classDesigner/ClassDesignerContentContext.tsx');
const { Step1ObjectDefinition } = await import('../src/components/classDesigner/Step1ObjectDefinition.tsx');
const { ClassDesignerContentBlocks } = await import('../src/components/classDesigner/ClassDesignerContentBlocks.tsx');
const { normalizeClassDesignerBlocks } = await import('../src/utils/classDesignerBlocks.ts');

const account = (email, uid = 'user-1', emailVerified = true) => ({ uid, email, emailVerified, displayName: 'Test', photoURL: null });
const administrator = () => { auth.currentUser = account('admin@example.test'); state.documents.set('admins/user-1', {}); };
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

test('only administrators can save the tool content, and saved changes are included in CMS backups', async () => {
  const content = structuredClone(DEFAULT_CLASS_DESIGNER_CONTENT);
  content.title = 'Diseñador de criaturas';
  content.steps[1].title = '¿Qué criatura quieres construir?';
  content.questions.realWorldObject.label = 'Describe el habitante de tu mundo';
  content.defaultProject.className = 'criatura';
  for (const user of [null, account('student@centro.edu.mx')]) {
    auth.currentUser = user;
    await assert.rejects(designerContent.saveClassDesignerContent(content));
  }
  assert.equal(state.writes.length, 0);
  administrator();
  await designerContent.saveClassDesignerContent(content);
  const saved = await designerContent.getClassDesignerContent();
  assert.equal(saved.title, content.title);
  assert.equal(saved.steps[1].title, content.steps[1].title);
  assert.equal(saved.questions.realWorldObject.label, content.questions.realWorldObject.label);
  assert.equal(saved.defaultProject.className, 'criatura');
  const backup = await cms.exportCurriculumBackup();
  assert.equal(JSON.parse(backup.siteContent.find((item) => item.key === 'class_designer_config').content).title, content.title);
});

test('tool content subscriptions update instructions, rendering uses edited questions, and template instances are independent', async () => {
  const content = structuredClone(DEFAULT_CLASS_DESIGNER_CONTENT);
  content.steps[1].title = 'Diseña tu {{className}}';
  content.questions.realWorldObject.label = 'Pregunta de la docente';
  const received = [];
  const unsubscribe = designerContent.subscribeToClassDesignerContent((value) => received.push(value), (error) => { throw error; });
  assert.equal(received[0].title, DEFAULT_CLASS_DESIGNER_CONTENT.title);
  state.documents.set('cms_site_content/class_designer_config', { content: JSON.stringify(content) });
  state.listeners.at(-1).callback(snapshot('cms_site_content/class_designer_config'));
  assert.equal(received.at(-1).steps[1].title, 'Diseña tu {{className}}');
  const project = content.defaultProject;
  const markup = renderToStaticMarkup(React.createElement(ClassDesignerContentContext.Provider, { value: received.at(-1) },
    React.createElement(Step1ObjectDefinition, { project, onChange: () => {} })));
  assert.match(markup, /Diseña tu Particula/);
  assert.match(markup, /Pregunta de la docente/);
  const copy = designerContent.instantiateClassDesignerTemplate({ ...project, userId: 'author' });
  assert.notEqual(copy.id, project.id);
  assert.equal(copy.userId, undefined);
  copy.fields[0].name = 'editado';
  assert.equal(project.fields[0].name, 'x');
  unsubscribe();
  assert.equal(state.listeners.length, 0);
});

test('tool configuration handles partial legacy data and reports read and save failures', async () => {
  const partial = designerContent.normalizeClassDesignerContent({ title: 'Título anterior', steps: { 2: { title: 'Campos editados' } }, examples: [] });
  assert.equal(partial.steps[2].title, 'Campos editados');
  assert.equal(partial.steps[1].title, DEFAULT_CLASS_DESIGNER_CONTENT.steps[1].title);
  assert.deepEqual(partial.examples, []);
  assert.deepEqual(partial.blocks, []);
  assert.deepEqual(partial.steps[1].blocks, []);
  administrator();
  state.writeError = Object.assign(new Error('offline'), { code: 'unavailable' });
  await assert.rejects(designerContent.saveClassDesignerContent(partial), { code: 'unavailable' });
  state.writeError = null;
  state.documents.set('cms_site_content/class_designer_config', { content: '{malformed' });
  await assert.rejects(designerContent.getClassDesignerContent, SyntaxError);
  await assert.rejects(designerContent.saveClassDesignerContent({ ...partial, title: '' }), /título/);
});

test('tool blocks persist their content, visibility and order and are included in CMS backups', async () => {
  administrator();
  const content = structuredClone(DEFAULT_CLASS_DESIGNER_CONTENT);
  content.blocks = [
    { ...block, id: 'intro-video', type: 'video', content: 'https://youtu.be/abc123', position: 1, visible: true },
    { ...block, id: 'intro-text', content: 'Explicación inicial', position: 0 },
  ];
  content.steps[3].blocks = [{ ...block, id: 'constructor-iframe', type: 'iframe', content: '<iframe src="https://example.com/embed"></iframe>', iframeTitle: 'Demostración del constructor', iframeHeight: 720, visible: false }];
  await designerContent.saveClassDesignerContent(content);
  const saved = await designerContent.getClassDesignerContent();
  assert.deepEqual(saved.blocks.map((item) => item.id), ['intro-text', 'intro-video']);
  assert.deepEqual(saved.blocks.map((item) => item.position), [0, 1]);
  assert.equal(saved.steps[3].blocks[0].iframeHeight, 720);
  assert.equal(saved.steps[3].blocks[0].visible, false);
  assert.equal(saved.steps[3].blocks[0].sectionId, 'class-designer-step-3');
  const backup = await cms.exportCurriculumBackup();
  const exported = JSON.parse(backup.siteContent.find((item) => item.key === 'class_designer_config').content);
  assert.equal(exported.blocks[0].content, 'Explicación inicial');
  assert.equal(exported.steps[3].blocks[0].iframeTitle, 'Demostración del constructor');
});

test('tool block rendering respects visibility and renders images, direct video and bounded embeds', () => {
  const content = structuredClone(DEFAULT_CLASS_DESIGNER_CONTENT);
  content.steps[1].blocks = normalizeClassDesignerBlocks([
    { ...block, id: 'image', type: 'image', content: 'https://example.com/diagram.png', caption: 'Diagrama del objeto', position: 1 },
    { ...block, id: 'text', type: 'rich-text', content: 'Explicación antes de la imagen', position: 0 },
    { ...block, id: 'hidden', type: 'rich-text', content: 'Texto oculto', visible: false, position: 2 },
    { ...block, id: 'movie', type: 'video', content: 'https://example.com/demo.mp4?download=1', position: 3 },
    { ...block, id: 'frame', type: 'iframe', content: 'https://example.com/demo', iframeHeight: 99999, position: 4 },
    { ...block, id: 'unsafe', type: 'iframe', content: 'javascript:alert(1)', position: 5 },
  ], 'step-1');
  const markup = renderToStaticMarkup(React.createElement(ClassDesignerContentContext.Provider, { value: content }, React.createElement(ClassDesignerStepIntro, { step: 1 })));
  assert.ok(markup.indexOf('Explicación antes') < markup.indexOf('diagram.png'));
  assert.match(markup, /<img[^>]+src="https:\/\/example.com\/diagram.png"/);
  assert.match(markup, /<video/);
  assert.match(markup, /height:1200px/);
  assert.match(markup, /sandbox="allow-scripts allow-forms allow-popups"/);
  assert.doesNotMatch(markup, /Texto oculto|src="javascript:/);
  const empty = renderToStaticMarkup(React.createElement(ClassDesignerContentBlocks, { blocks: [], label: 'Vacío' }));
  assert.equal(empty, '');
});

test('tool block normalization repairs repeated IDs and rejects unknown block types', () => {
  const normalized = normalizeClassDesignerBlocks([
    { ...block, id: 'repeated', position: 0 },
    { ...block, id: 'repeated', type: 'code', contentP5: 'function setup() {}', showInteractiveExecution: true, position: 1 },
    { ...block, type: 'unknown', position: 2 }, null,
  ], 'editorial');
  assert.equal(normalized.length, 2);
  assert.notEqual(normalized[0].id, normalized[1].id);
  assert.equal(normalized[1].contentP5, 'function setup() {}');
  assert.equal(normalized[1].showInteractiveExecution, true);
  assert.equal(normalized[0].sectionId, 'editorial');
});

test('visitors, students and admin-prefixed emails cannot perform CMS mutations', async () => {
  for (const user of [null, account('student@centro.edu.mx'), account('admin@example.com'), account('admin@example.test', 'unverified', false)]) {
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
  assert.equal([...state.documents.keys()].filter((key) => !key.startsWith('admins/')).length, 0);
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
  assert.equal([...state.documents.keys()].filter((key) => !key.startsWith('admins/')).length, 0);
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

test('published composable lessons are preferred over legacy curriculum', async () => {
  curriculum();
  const composableModule = { ...node, id: 'node_module_mod_custom', type: 'container', title: 'Módulo composable', metadata: { category: 'Fundamentos', badge: 'Nuevo' } };
  const composableLesson = { ...node, id: 'node_lesson_les_custom', type: 'lesson', title: 'Lección composable', description: 'Contenido desde nodos', metadata: { legacyId: 'les_custom', estimatedTime: '15 min' } };
  const composableSection = { ...node, id: 'node_section_sec_custom', type: 'section', title: 'Sección composable', description: 'Sección normalizada', metadata: { didacticTip: 'Experimenta' } };
  state.documents.set(`cms_nodes/${composableModule.id}`, composableModule);
  state.documents.set(`cms_nodes/${composableLesson.id}`, composableLesson);
  state.documents.set(`cms_nodes/${composableSection.id}`, composableSection);
  state.documents.set('cms_node_relations/rel_module_lesson', { ...nodeRelation, id: 'rel_module_lesson', parentId: composableModule.id, childId: composableLesson.id });
  state.documents.set('cms_node_relations/rel_lesson_section', { ...nodeRelation, id: 'rel_lesson_section', parentId: composableLesson.id, childId: composableSection.id });
  state.documents.set('cms_node_blocks/block_composable', { ...nodeBlock, id: 'block_composable', nodeId: composableSection.id, data: { content: 'Contenido composable real' } });

  const [topic] = await cms.getAllTopicsFromCmsOrFallback();
  assert.equal(topic.title, 'Lección composable');
  assert.equal(topic.concepts[0].blocks[0].content, 'Contenido composable real');
});

test('migrated lessons use current CMS preview settings without replacing their composable content', async () => {
  curriculum();
  const composableLesson = { ...node, id: 'node_lesson_les_custom', type: 'lesson', metadata: { legacyId: lesson.id } };
  const composableSection = { ...node, id: 'node_section_sec_custom', type: 'section', metadata: {} };
  state.documents.set(`cms_nodes/${composableLesson.id}`, composableLesson);
  state.documents.set(`cms_nodes/${composableSection.id}`, composableSection);
  state.documents.set('cms_node_relations/rel_lesson_section', { ...nodeRelation, parentId: composableLesson.id, childId: composableSection.id });
  state.documents.set('cms_node_blocks/old_demo', {
    ...nodeBlock, nodeId: composableSection.id, type: 'code',
    data: { contentP5: 'function setup() { createCanvas(100, 100); }', repositoryUrl: 'https://github.com/usuario/otro', repositoryEntry: 'Otro_p5/sketch.js' },
  });
  const current = {
    ...lesson, thumbnailP5: 'function setup() { createCanvas(900, 504); }',
    repositoryUrl: 'https://github.com/usuario/ejemplos/tree/main/d1', repositoryEntry: 'd1/noise_p5/noise_p5.js',
  };
  state.documents.set(`cms_lessons/${lesson.id}`, current);
  let topic = (await cms.getAllTopicsFromCmsOrFallback()).find((item) => item.id === 'custom');
  assert.equal(topic.thumbnailP5, current.thumbnailP5);
  assert.equal(topic.repositoryUrl, current.repositoryUrl);
  assert.equal(topic.repositoryEntry, current.repositoryEntry);
  assert.equal(topic.concepts[0].codeSnippetP5, 'function setup() { createCanvas(100, 100); }');
  state.documents.set(`cms_lessons/${lesson.id}`, { ...current, repositoryEntry: undefined });
  topic = (await cms.getAllTopicsFromCmsOrFallback()).find((item) => item.id === 'custom');
  assert.equal(topic.repositoryEntry, undefined, 'A lesson repository must not inherit a different section entry');
  state.documents.set(`cms_lessons/${lesson.id}`, { ...lesson });
  topic = (await cms.getAllTopicsFromCmsOrFallback()).find((item) => item.id === 'custom');
  assert.equal(topic.thumbnailP5, topic.concepts[0].codeSnippetP5);
  assert.equal(topic.repositoryUrl, 'https://github.com/usuario/otro');
  assert.equal(topic.repositoryEntry, 'Otro_p5/sketch.js');
});

test('published legacy lessons remain visible alongside composable lessons', async () => {
  curriculum();
  const composableModule = { ...node, id: 'node_module_other', type: 'container', title: 'Otro módulo', metadata: { category: 'Fundamentos' } };
  const composableLesson = { ...node, id: 'node_lesson_other', type: 'lesson', title: 'Lección adicional', description: 'Contenido adicional', metadata: { legacyId: 'les_other' } };
  const composableSection = { ...node, id: 'node_section_other', type: 'section', title: 'Sección adicional', description: 'Sección adicional', metadata: {} };
  state.documents.set(`cms_nodes/${composableModule.id}`, composableModule);
  state.documents.set(`cms_nodes/${composableLesson.id}`, composableLesson);
  state.documents.set(`cms_nodes/${composableSection.id}`, composableSection);
  state.documents.set('cms_node_relations/rel_other_module_lesson', { ...nodeRelation, id: 'rel_other_module_lesson', parentId: composableModule.id, childId: composableLesson.id });
  state.documents.set('cms_node_relations/rel_other_lesson_section', { ...nodeRelation, id: 'rel_other_lesson_section', parentId: composableLesson.id, childId: composableSection.id });

  const topics = await cms.getAllTopicsFromCmsOrFallback();
  assert.deepEqual(topics.map((topic) => topic.id).sort(), ['les_custom', 'other']);
});

test('categories provide defaults and can be persisted by administrators', async () => {
  const defaults = await cms.getCmsCategories();
  assert.deepEqual(defaults.map((category) => category.name), [
    'Fundamentos',
    'Control y Lógica',
    'Modularidad',
    'Programación Orientada a Objetos',
  ]);
  administrator();
  await cms.saveCmsCategory({
    id: 'cat_generativo',
    name: 'Código generativo',
    slug: 'codigo-generativo',
    position: 4,
    visible: true,
    createdAt: '',
    updatedAt: '',
  });


  assert.equal(state.documents.get('cms_categories/cat_generativo').name, 'Código generativo');
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

test('a resumed lesson starts in the saved section before recording a visit', () => {
  const topic = {
    id: 'resume-test', title: 'Lección con progreso', number: 1, category: 'Control y Lógica',
    sections: [
      { id: 'first', title: 'Primera sección', blocks: [], didacticTip: '' },
      { id: 'saved', title: 'Sección guardada', blocks: [], didacticTip: '' },
    ],
  };
  const html = renderToStaticMarkup(React.createElement(TopicViewer, {
    topic, onNavigateTopic() {}, onOpenCatalogue() {},
    lessonProgress: { completedSections: ['saved'], currentSectionId: 'saved', lastVisitedAt: '2026-11-06T00:00:00.000Z' },
  }));
  assert.match(html, /<h2\b[^>]*>\s*Sección guardada\s*<\/h2>/);
});

test('CMS controls are absent for visitors and students and visible for verified admins', () => {
  for (const user of [null, identity.mapFirebaseUser(account('admin@example.com')), identity.mapFirebaseUser(account('student@centro.edu.mx'))]) {
    const header = renderToStaticMarkup(React.createElement(Header, { currentView: 'home', currentUser: user, onNavigateAdmin() {} }));
    assert.doesNotMatch(header, /Administrar contenidos/);
    assert.equal(renderToStaticMarkup(React.createElement(AdminDashboard, { currentUser: user })), '');
  }
  const header = renderToStaticMarkup(React.createElement(Header, { currentView: 'home', currentUser: identity.mapFirebaseUser(account('admin@example.test'), true), onNavigateAdmin() {} }));
  assert.match(header, /Administrar contenidos/);
});

test('an explicitly empty public catalogue never restores the static curriculum', () => {
  const home = renderToStaticMarkup(React.createElement(HomeView, { topics: [] }));
  assert.doesNotMatch(home, /Lienzo y Ciclo de Vida/);
  const catalogue = renderToStaticMarkup(React.createElement(TopicsCatalogueModal, { isOpen: true, topics: [], onClose() {}, onSelectTopic() {} }));
  assert.match(catalogue, /0 lecciones disponibles/);
  assert.doesNotMatch(catalogue, /Lienzo y Ciclo de Vida/);
});

test('the home presentation preserves editorial order, resolves legacy IDs once and hides the filter bar', () => {
  const makeTopic = (id, title) => ({ id, title, number: 1, category: 'Fundamentos', summary: 'Descripción', sections: [], estimatedTime: '30 min' });
  const topics = [makeTopic('noise', 'Noise seleccionado'), makeTopic('other', 'Contenido ajeno'), makeTopic('coordinates', 'Alias de coordenadas'), makeTopic('les_coordinates', 'Coordenadas seleccionadas'), makeTopic('random', 'Random seleccionado')];
  const presentation = { enabled: true, title: 'Selección docente', description: '', items: [
    { type: 'lesson', id: 'les_coordinates' }, { type: 'lesson', id: 'coordinates' },
    { type: 'lesson', id: 'random' }, { type: 'lesson', id: 'noise' }, { type: 'class-designer', id: 'class-designer' },
  ] };
  const config = { ...DEFAULT_HOME_CONFIG, sections: Object.fromEntries(Object.keys(DEFAULT_HOME_CONFIG.sections).map((key) => [key, false])), showSectionNavigator: false, presentation };
  const html = renderToStaticMarkup(React.createElement(HomeView, { homeConfig: config, topics, onSelectTopic() {}, onOpenWorkshop() {}, currentUser: null }));
  const headings = [...html.matchAll(/<h3\b[^>]*>(.*?)<\/h3>/g)].map((match) => match[1]);
  assert.deepEqual(headings, ['Coordenadas seleccionadas', 'Random seleccionado', 'Noise seleccionado', 'Diseñador POO']);
  assert.doesNotMatch(html, /Filtros del laboratorio|Todo el Laboratorio|Contenido ajeno/);
  assert.match(html, /href="#\/lecciones\/les_coordinates"/);
  assert.match(html, /href="#\/herramientas"/);
});

test('unavailable presentation lessons do not expose unrelated lessons or restore the static catalogue', () => {
  const html = renderToStaticMarkup(React.createElement(HomePresentation, {
    config: { enabled: true, title: 'Selección', description: '', items: [{ type: 'lesson', id: 'missing' }] },
    topics: [{ id: 'other', title: 'No seleccionado' }],
  }));
  assert.match(html, /cuando se publiquen sus contenidos/);
  assert.doesNotMatch(html, /No seleccionado|Lienzo y Ciclo/);
});

test('home selection settings survive saving and subscriptions while older home configurations keep their defaults', async () => {
  state.documents.set('cms_site_content/home_config', { content: JSON.stringify({ sections: { hero: false } }) });
  const previous = await cms.getHomeConfig();
  assert.equal(previous.showSectionNavigator, true);
  assert.equal(previous.presentation.enabled, false);
  administrator();
  const selected = { ...previous, showSectionNavigator: false, presentation: { enabled: true, title: 'Recorrido', description: 'Del inicio a los objetos', items: [{ type: 'lesson', id: 'custom' }, { type: 'class-designer', id: 'class-designer' }] } };
  await cms.saveHomeConfig(selected);
  assert.deepEqual(await cms.getHomeConfig(), selected);
  let live;
  const stop = cms.subscribeToHomeConfig((value) => { live = value; });
  assert.deepEqual(live, selected);
  stop();
  const backup = await cms.exportCurriculumBackup();
  assert.deepEqual(JSON.parse(backup.siteContent.find((item) => item.key === 'home_config').content).presentation, selected.presentation);
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
      assert.doesNotMatch(message, /test-project|test-database/);
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

test('educational routes preserve lessons and units across reloads', () => {
  const lessonRoute = parseAppRoute(new URL('http://localhost:3000/#/lecciones/puntillismo'));
  assert.deepEqual(lessonRoute, { view: 'topic', topicId: 'puntillismo' });
  assert.equal(routeHash(lessonRoute), '#/lecciones/puntillismo');

  const exerciseRoute = parseAppRoute(new URL('http://localhost:3000/#/unidades/u2/actividad-3'));
  assert.deepEqual(exerciseRoute, { view: 'units', unitId: 'u2', exerciseId: 'actividad-3' });
  assert.equal(routeHash(exerciseRoute), '#/unidades/u2/actividad-3');
});

test('legacy topic data is normalized to the learning lesson contract', async () => {
  const { TOPICS_DATA } = await import('../src/data/topicsData.ts');
  const lesson = normalizeTopic(TOPICS_DATA[0]);
  assert.equal(lesson.id, TOPICS_DATA[0].id);
  assert.equal(lesson.sections.length, TOPICS_DATA[0].concepts.length);
  assert.equal(lesson.sections[0]?.id, TOPICS_DATA[0].concepts[0]?.id);
});

test('lesson status is derived from known visited sections', () => {
  const lesson = {
    sections: [{ id: 'one' }, { id: 'two' }],
  };
  assert.equal(getLessonStatus(lesson), 'not-started');
  assert.equal(getLessonStatus(lesson, { completedSections: ['one'], lastVisitedAt: '' }), 'in-progress');
  assert.equal(getLessonStatus(lesson, { completedSections: ['one', 'two', 'stale'], lastVisitedAt: '' }), 'completed');
  assert.equal(getLessonStatus(lesson, undefined, true), 'blocked');
  assert.equal(getLessonProgressPercentage(lesson, { completedSections: ['one', 'stale'], lastVisitedAt: '' }), 50);
});

test('lessons expose explicit unit relationships', async () => {
  const { TOPICS_DATA } = await import('../src/data/topicsData.ts');
  assert.equal(getLessonUnitId('canvas'), 'u1');
  assert.equal(getLessonUnitId('variables'), 'u2');
  assert.equal(getLessonUnitId('loops'), 'u3');
  assert.equal(normalizeTopic(TOPICS_DATA.find((topic) => topic.id === 'functions')).unitId, 'u2');
  assert.equal(inferUnitId('puntillismo', 'Fundamentos'), 'u1');
});

test('unit completion is based on passed activities, not lesson reading', async () => {
  const { CURRICULUM_UNITS } = await import('../src/data/unitsData.ts');
  const unit = CURRICULUM_UNITS.find((item) => item.id === 'u1');
  const first = unit.exercises[0];
  const summary = getUnitEvaluationSummary(unit, {
    [first.id]: {
      unitId: 'u1',
      attempts: 2,
      passed: true,
      bestScore: 100,
      lastAttemptAt: '',
    },
  });
  assert.equal(summary.completedActivities, 1);
  assert.equal(summary.totalActivities, unit.exercises.length);
  assert.equal(summary.isComplete, false);
  assert.equal(summary.percentage, Math.round((1 / unit.exercises.length) * 100));
});

test('units expose explicit prerequisites without coupling views to storage', async () => {
  const { CURRICULUM_UNITS } = await import('../src/data/unitsData.ts');
  const unit = normalizeUnit(CURRICULUM_UNITS.find((item) => item.id === 'u3'));
  assert.deepEqual(unit.prerequisiteUnitIds, ['u2']);
  assert.equal(areUnitPrerequisitesComplete(unit, ['u1']), false);
  assert.equal(areUnitPrerequisitesComplete(unit, ['u1', 'u2']), true);
});

test('a block with its own GitHub folder never inherits the lesson entry from another folder', async () => {
  curriculum();
  state.documents.set('cms_lessons/les_custom', { ...lesson, repositoryUrl: 'https://github.com/usuario/repo', repositoryEntry: 'Raiz_p5/sketch.js' });
  state.documents.set('cms_blocks/blk_custom', { ...block, type: 'code', codeSource: 'github', repositoryUrl: 'https://github.com/usuario/repo/tree/main/a1' });
  const [topic] = await cms.getAllTopicsFromCmsOrFallback();
  assert.equal(topic.concepts[0].blocks[0].repositoryEntry, undefined);
  assert.equal(topic.concepts[0].repositoryEntry, undefined);
});

test('formatted CMS prose survives saving, publishing and backups and is sanitized in the student view', async () => {
  administrator();
  curriculum();
  const formatted = { ...block, contentFormat: 'html', content: '<p><strong>Explicación</strong> <em>importante</em> <span style="color:#cc0000">roja</span></p><script>evil()</script>' };
  await cms.saveCmsLessonContent(lesson, [section], { [section.id]: [formatted] });
  assert.equal(state.documents.get(`cms_blocks/${block.id}`).contentFormat, 'html');
  const [topic] = await cms.getAllTopicsFromCmsOrFallback();
  const html = renderToStaticMarkup(React.createElement(TopicViewer, { topic, onNavigateTopic() {}, onOpenCatalogue() {} }));
  assert.match(html, /<strong>Explicación<\/strong>/);
  assert.match(html, /<em>importante<\/em>/);
  assert.match(html, /color:#cc0000/);
  assert.doesNotMatch(html, /evil\(\)/);
  const backup = await cms.exportCurriculumBackup();
  assert.equal(backup.blocks.find((item) => item.id === block.id).contentFormat, 'html');
});

test('tool text, callouts and activity instructions preserve their formatting through normalization and backups', async () => {
  administrator();
  const content = structuredClone(DEFAULT_CLASS_DESIGNER_CONTENT);
  content.blocks = ['rich-text', 'callout', 'activity'].map((type, position) => ({ ...block, id: `format-${type}`, type, position, contentFormat: 'html', content: '<p><strong>Texto con formato</strong></p>' }));
  await designerContent.saveClassDesignerContent(content);
  const saved = await designerContent.getClassDesignerContent();
  assert.ok(saved.blocks.every((item) => item.contentFormat === 'html'));
  const html = renderToStaticMarkup(React.createElement(ClassDesignerContentBlocks, { blocks: saved.blocks, label: 'Formato' }));
  assert.equal(html.match(/<strong>Texto con formato<\/strong>/g).length, 3);
  const backup = await cms.exportCurriculumBackup();
  const exported = JSON.parse(backup.siteContent.find((item) => item.key === 'class_designer_config').content);
  assert.ok(exported.blocks.every((item) => item.contentFormat === 'html'));
});

test('legacy-to-composable migration retains the rich text format in public content', async () => {
  administrator();
  curriculum();
  state.documents.set(`cms_blocks/${block.id}`, { ...block, contentFormat: 'html', content: '<p><strong>Migración con formato</strong></p>' });
  await cms.migrateLegacyContentToComposable();
  const migrated = [...state.documents.entries()].find(([path, item]) => path.startsWith('cms_node_blocks/') && item.data.content?.includes('Migración con formato'))[1];
  assert.equal(migrated.data.contentFormat, 'html');
  const topics = await cms.getAllTopicsFromCmsOrFallback();
  const rich = topics.flatMap((topic) => topic.concepts.flatMap((concept) => concept.blocks || [])).find((item) => item.content.includes('Migración con formato'));
  assert.equal(rich.contentFormat, 'html');
});

test('CMS v2 backups include categories, the composable graph and raw configuration markers, excluding accounts and personal designs', async () => {
  administrator(); curriculum();
  const category = { id: 'cat_backup', name: 'Categoría guardada', position: 0, visible: true };
  state.documents.set('cms_categories/cat_backup', category);
  state.documents.set(`cms_nodes/${node.id}`, node);
  state.documents.set(`cms_node_relations/${nodeRelation.id}`, nodeRelation);
  state.documents.set(`cms_node_blocks/${nodeBlock.id}`, nodeBlock);
  state.documents.set('cms_site_content/home_config', { content: '{"footer":{"text":"Pie editado"}}' });
  state.documents.set('cms_site_content/units_curriculum_status', { statusMap: { 'u1-e1': 'published' } });
  state.documents.set('users/student-1', { privateData: 'NO_EXPORTAR' });
  state.documents.set('admins/admin-1', { email: 'NO_EXPORTAR' });
  state.documents.set('users/student-1/class_designs/design-1', { id: 'design-1', owner: 'NO_EXPORTAR' });
  const backup = await cms.exportCurriculumBackup();
  assert.equal(backup.version, '2.0.0');
  assert.equal(backup.source.projectId, 'test-project');
  assert.equal(backup.source.databaseId, 'test-database');
  assert.equal(backup.categories[0].id, category.id);
  assert.equal(backup.nodes[0].id, node.id);
  assert.equal(backup.nodeRelations[0].id, nodeRelation.id);
  assert.equal(backup.nodeBlocks[0].id, nodeBlock.id);
  assert.equal(backup.siteContent.find((item) => item.key === 'curriculum_initialized').initialized, true);
  assert.equal(backup.siteContent.find((item) => item.key === 'home_config').content, '{"footer":{"text":"Pie editado"}}');
  assert.deepEqual(backup.siteContent.find((item) => item.key === 'units_curriculum_status').statusMap, { 'u1-e1': 'published' });
  assert.ok(!JSON.stringify(backup).includes('NO_EXPORTAR'));
});

test('a complete CMS backup restores editorial data and creates a destination backup first without deleting extra records', async () => {
  administrator(); curriculum();
  state.documents.set('cms_categories/cat_source', { id: 'cat_source', name: 'Local', position: 0, visible: true });
  state.documents.set(`cms_nodes/${node.id}`, node);
  state.documents.set(`cms_node_relations/${nodeRelation.id}`, nodeRelation);
  state.documents.set(`cms_node_blocks/${nodeBlock.id}`, nodeBlock);
  state.documents.set('cms_site_content/class_designer_config', { content: '{"title":"Diseñador editado"}' });
  const backup = await cms.exportCurriculumBackup();
  state.documents.clear(); state.writes = [];
  state.documents.set('cms_modules/extra_module', { ...moduleData, id: 'extra_module' });
  state.documents.set('users/student-1', { privateData: 'original' });
  await cms.importCurriculumBackup(backup);
  assert.ok(state.writes[0].path.startsWith('cms_revisions/'));
  const destinationSnapshot = JSON.parse(state.writes[0].data.snapshotJson);
  assert.deepEqual(destinationSnapshot.modules.map((item) => item.id), ['extra_module']);
  for (const path of [`cms_modules/${moduleData.id}`, 'cms_categories/cat_source', `cms_nodes/${node.id}`, `cms_node_relations/${nodeRelation.id}`, `cms_node_blocks/${nodeBlock.id}`, 'cms_site_content/curriculum_initialized']) assert.ok(state.documents.has(path), path);
  assert.equal(state.documents.get('cms_site_content/class_designer_config').content, '{"title":"Diseñador editado"}');
  assert.ok(state.documents.has('cms_modules/extra_module'));
  assert.equal(state.documents.get('users/student-1').privateData, 'original');
});

test('v1 CMS backups remain importable and leave new collections untouched', async () => {
  administrator();
  state.documents.set(`cms_nodes/${node.id}`, node);
  state.documents.set('cms_categories/cat_existing', { id: 'cat_existing', name: 'Existente' });
  await cms.importCurriculumBackup({ version: '1.0.0', modules: [moduleData], lessons: [lesson], sections: [section], blocks: [block], siteContent: [], media: [] });
  assert.equal(state.documents.get(`cms_modules/${moduleData.id}`).title, moduleData.title);
  assert.ok(state.documents.has(`cms_nodes/${node.id}`));
  assert.ok(state.documents.has('cms_categories/cat_existing'));
});

test('malformed backups cannot partially write data or create revisions', async () => {
  administrator();
  const base = { version: '2.0.0', modules: [moduleData], lessons: [] };
  for (const invalid of [{ ...base, nodes: {} }, { ...base, categories: [{ id: '../admins/attacker' }] }, { ...base, modules: [moduleData, moduleData] }, { ...base, siteContent: [{ content: 'missing-key' }] }]) {
    await assert.rejects(cms.importCurriculumBackup(invalid), /Respaldo no válido/);
    assert.equal(state.writes.length, 0);
  }
  auth.currentUser = null;
  await assert.rejects(cms.importCurriculumBackup(base));
  assert.equal(state.writes.length, 0);
});
