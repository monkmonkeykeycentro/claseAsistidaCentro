/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { test, mock, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const persistence = { writes: [], error: null, documents: [] };
beforeEach(() => { persistence.writes = []; persistence.error = null; persistence.documents = []; });

// Mock Firebase SDK so no lingering sockets remain
mock.module('firebase/app', {
  namedExports: {
    initializeApp: () => ({}),
    getApps: () => [],
    getApp: () => ({}),
  },
});
mock.module('firebase/auth', {
  namedExports: {
    getAuth: () => ({ currentUser: null }),
    connectAuthEmulator: () => {},
    GoogleAuthProvider: class { setCustomParameters() {} },
    signInWithPopup: async () => ({ user: null }),
    signOut: async () => {},
    onAuthStateChanged: () => () => {},
  },
});
mock.module('firebase/firestore', {
  namedExports: {
    getFirestore: () => ({}),
    connectFirestoreEmulator: () => {},
    doc: (_db, ...parts) => ({ path: parts.join('/') }),
    collection: (_db, ...parts) => ({ path: parts.join('/') }),
    query: (ref) => ref,
    orderBy: () => ({}),
    getDoc: async () => ({ exists: () => false, data: () => null }),
    getDocFromServer: async () => ({ exists: () => false, data: () => null }),
    getDocs: async () => { if (persistence.error) throw persistence.error; return { docs: persistence.documents }; },
    setDoc: async (ref, data) => { if (persistence.error) throw persistence.error; persistence.writes.push({ ref, data }); },
    deleteDoc: async () => {},
    onSnapshot: () => () => {},
  },
});

const {
  isValidJavaIdentifier,
  isPascalCase,
  isCamelCase,
  validateClassDesign,
  generateProcessingClassCode,
  generateProcessingMainSketch,
  exportClassDesignAsJson,
  importClassDesignFromJson,
  saveClassDesignToFirestore,
  loadClassDesignsFromFirestore,
  loadClassDesignFromLocal,
} = await import('../src/services/classDesignerService.ts');

const {
  RESORTE_EXAMPLE_PROJECT,
  DEFAULT_EMPTY_PROJECT,
} = await import('../src/types/classDesigner.ts');
const { ClassDesignerRoot } = await import('../src/components/classDesigner/ClassDesignerRoot.tsx');

test('designer waits for the editorial template before editing or saving a draft', () => {
  const markup = renderToStaticMarkup(React.createElement(ClassDesignerRoot, {
    onBackToHome: () => {}, currentUser: { uid: 'local-admin', role: 'admin' },
  }));
  assert.match(markup, /Cargando contenido del diseñador/);
  assert.doesNotMatch(markup, /Sincronizado/);
});

test('database saves accept imported projects with optional undefined fields and retain the complete design', async () => {
  const imported = importClassDesignFromJson(exportClassDesignAsJson(DEFAULT_EMPTY_PROJECT));
  assert.equal(imported.success, true);
  await saveClassDesignToFirestore('local-admin', imported.project);
  const [{ ref, data }] = persistence.writes;
  assert.equal(ref.path, `users/local-admin/class_designs/${data.id}`);
  assert.equal(data.userId, 'local-admin');
  assert.deepEqual(data.fields, JSON.parse(JSON.stringify(imported.project.fields)));
  assert.deepEqual(data.methods, imported.project.methods);
  assert.deepEqual(data.constructorParams, JSON.parse(JSON.stringify(imported.project.constructorParams)));
  assert.equal(data.fields[0].defaultValue, undefined);
  assert.equal(Object.hasOwn(data.fields[0], 'defaultValue'), false);
});

test('database failures are reported for both saves and lists', async () => {
  persistence.error = Object.assign(new Error('Missing or insufficient permissions.'), { code: 'permission-denied' });
  await assert.rejects(saveClassDesignToFirestore('local-admin', DEFAULT_EMPTY_PROJECT), { code: 'permission-denied' });
  await assert.rejects(loadClassDesignsFromFirestore('local-admin'), { code: 'permission-denied' });
  await assert.rejects(saveClassDesignToFirestore('', DEFAULT_EMPTY_PROJECT), /Inicia sesión/);
});

test('saved designs use their database document ID and fresh drafts have unique IDs', async () => {
  persistence.documents = [{ id: 'saved-id', data: () => ({ ...DEFAULT_EMPTY_PROJECT, id: 'stale-id' }) }];
  assert.equal((await loadClassDesignsFromFirestore('local-admin'))[0].id, 'saved-id');
  assert.notEqual(loadClassDesignFromLocal().id, loadClassDesignFromLocal().id);
});

test('Java Identifier and Case validation helpers', () => {
  assert.equal(isValidJavaIdentifier('MiClase'), true);
  assert.equal(isValidJavaIdentifier('x'), true);
  assert.equal(isValidJavaIdentifier('longitudReposo'), true);
  assert.equal(isValidJavaIdentifier('123Invalido'), false);
  assert.equal(isValidJavaIdentifier('nombre con espacios'), false);
  assert.equal(isValidJavaIdentifier('variable-con-guion'), false);

  assert.equal(isPascalCase('Resorte'), true);
  assert.equal(isPascalCase('resorte'), false);
  assert.equal(isCamelCase('longitudReposo'), true);
  assert.equal(isCamelCase('LongitudReposo'), false);
});

test('RESORTE_EXAMPLE_PROJECT produces zero blocking errors', () => {
  const diagnostics = validateClassDesign(RESORTE_EXAMPLE_PROJECT);
  const errors = diagnostics.filter((d) => d.severity === 'error');
  assert.equal(errors.length, 0, `Expected 0 errors in Resorte example, got: ${JSON.stringify(errors)}`);
});

test('Validates class name errors when missing or invalid identifier', () => {
  const badProject = {
    ...DEFAULT_EMPTY_PROJECT,
    className: '123_Invalida',
  };
  const diagnostics = validateClassDesign(badProject);
  assert.ok(diagnostics.some((d) => d.severity === 'error' && d.id === 'diag-class-invalid'));
});

test('Validates type mismatch between constructor parameter and target field', () => {
  const mismatchedProject = {
    ...DEFAULT_EMPTY_PROJECT,
    fields: [
      {
        id: 'f-1',
        name: 'x',
        type: 'float',
        description: 'pos X',
        initStrategy: 'constructor-param',
      },
    ],
    constructorParams: [
      {
        id: 'p-1',
        name: 'xTexto',
        type: 'String',
        targetFieldId: 'f-1',
      },
    ],
  };
  const diagnostics = validateClassDesign(mismatchedProject);
  assert.ok(diagnostics.some((d) => d.severity === 'error' && d.id.includes('type-mismatch')));
});

test('Code generator outputs valid Processing Java class structure with pedagogical orienting comments', () => {
  const code = generateProcessingClassCode(RESORTE_EXAMPLE_PROJECT);

  // Check class declaration
  assert.ok(code.includes('class Resorte {'), 'Must include class declaration');

  // Check field declarations
  assert.ok(code.includes('float x;'), 'Must include float x');
  assert.ok(code.includes('float longitudReposo;'), 'Must include float longitudReposo');
  assert.ok(code.includes('color colorResorte;'), 'Must include color colorResorte');

  // Check constructor
  assert.ok(code.includes('Resorte(float xInicial, float yInicial, float longitudInicial, color colorInicial) {'), 'Must include constructor signature');
  assert.ok(code.includes('x = xInicial;'), 'Must map xInicial to x');
  assert.ok(code.includes('longitudReposo = 140.0;'), 'Must assign default value for strategy B');

  // Check methods
  assert.ok(code.includes('void mostrar() {'), 'Must include mostrar method');
  assert.ok(code.includes('void estirar(float fuerza) {'), 'Must include estirar with float parameter');
  assert.ok(code.includes('// TODO: Escribe aquí la implementación específica en Processing Java.'), 'Must preserve student autonomy');

  // Must not have leaked auto-generated functional behavior
  assert.ok(!code.includes('ellipse(x, y'), 'Must not auto-generate graphic code for the student');
});

test('PascalCase class names are accepted and only lowercase class names receive a PascalCase suggestion', () => {
  const upperProject = {
    ...DEFAULT_EMPTY_PROJECT,
    className: 'Particula',
  };
  const diagnostics = validateClassDesign(upperProject);
  assert.ok(!diagnostics.some((d) => d.id.startsWith('diag-class-')));
  const lowercase = validateClassDesign({ ...upperProject, className: 'particula' });
  assert.ok(lowercase.some((d) => d.id === 'diag-class-pascal' && d.severity === 'suggestion'));
  assert.ok(!lowercase.some((d) => d.id === 'diag-class-camel'));
  assert.ok(!validateClassDesign({ ...upperProject, className: 'Class' }).some((d) => d.id === 'diag-class-reserved'));
  assert.ok(validateClassDesign({ ...upperProject, className: 'class' }).some((d) => d.id === 'diag-class-reserved'));
});

test('field and method names retain camelCase guidance, while the class field displays PascalCase', async () => {
  const project = structuredClone(DEFAULT_EMPTY_PROJECT);
  project.fields[0].name = 'PosicionX';
  project.methods[0].name = 'Dibujar';
  const diagnostics = validateClassDesign(project);
  assert.ok(diagnostics.some((d) => d.id.startsWith('diag-field-camel-')));
  assert.ok(diagnostics.some((d) => d.id.startsWith('diag-method-camel-')));
  const { Step1ObjectDefinition } = await import('../src/components/classDesigner/Step1ObjectDefinition.tsx');
  const markup = renderToStaticMarkup(React.createElement(Step1ObjectDefinition, { project, onChange: () => {} }));
  assert.match(markup, /Nombre válido en PascalCase/);
  assert.doesNotMatch(markup, /camelCase/);
});

test('Sketch generator outputs companion test sketch with setup, draw, and method calls', () => {
  const sketch = generateProcessingMainSketch(RESORTE_EXAMPLE_PROJECT, 'miResorte');

  assert.ok(sketch.includes('Resorte miResorte;'), 'Must declare instance reference');
  assert.ok(sketch.includes('void setup() {'), 'Must include setup()');
  assert.ok(sketch.includes('size(800, 600);'), 'Must define canvas size');
  assert.ok(sketch.includes('miResorte = new Resorte('), 'Must instantiate with new');
  assert.ok(sketch.includes('void draw() {'), 'Must include draw()');
  assert.ok(sketch.includes('miResorte.mostrar();'), 'Must invoke mostrar()');
});

test('Class designer exports complete editable structure as JSON and re-imports cleanly for ongoing editing', () => {
  const jsonString = exportClassDesignAsJson(RESORTE_EXAMPLE_PROJECT);
  assert.ok(typeof jsonString === 'string', 'Export must return a string');
  assert.ok(jsonString.includes('laboratorio-codigo-creativo-class-design'), 'Must include format identifier');
  assert.ok(jsonString.includes('"className": "Resorte"'), 'Must contain class name in structure');

  // Re-import from exported envelope
  const importResult = importClassDesignFromJson(jsonString);
  assert.equal(importResult.success, true, 'Import of exported JSON envelope must succeed');
  assert.ok(importResult.project, 'Imported result must provide project structure');
  assert.equal(importResult.project.className, 'Resorte');
  assert.equal(importResult.project.fields.length, RESORTE_EXAMPLE_PROJECT.fields.length);
  assert.equal(importResult.project.methods.length, RESORTE_EXAMPLE_PROJECT.methods.length);
  assert.equal(importResult.project.constructorParams.length, RESORTE_EXAMPLE_PROJECT.constructorParams.length);

  // Import raw project JSON directly without envelope
  const rawProjectJson = JSON.stringify(DEFAULT_EMPTY_PROJECT);
  const rawImportResult = importClassDesignFromJson(rawProjectJson);
  assert.equal(rawImportResult.success, true, 'Import of raw project structure must succeed');
  assert.equal(rawImportResult.project.className, 'Particula');
  assert.equal(rawImportResult.project.fields.length, DEFAULT_EMPTY_PROJECT.fields.length);

  // Robust error handling on corrupted or empty input
  const emptyResult = importClassDesignFromJson('');
  assert.equal(emptyResult.success, false, 'Empty input must safely return failure');
  assert.ok(emptyResult.error);

  const corruptedResult = importClassDesignFromJson('{ invalid json');
  assert.equal(corruptedResult.success, false, 'Invalid JSON must safely return failure');
  assert.ok(corruptedResult.error);
});
