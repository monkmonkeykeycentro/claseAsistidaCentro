/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { test, mock } from 'node:test';
import assert from 'node:assert/strict';

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
    GoogleAuthProvider: class { setCustomParameters() {} },
    signInWithPopup: async () => ({ user: null }),
    signOut: async () => {},
    onAuthStateChanged: () => () => {},
  },
});
mock.module('firebase/firestore', {
  namedExports: {
    getFirestore: () => ({}),
    doc: (_db, ...parts) => ({ path: parts.join('/') }),
    collection: (_db, path) => ({ path }),
    query: (ref) => ref,
    orderBy: () => ({}),
    getDoc: async () => ({ exists: () => false, data: () => null }),
    getDocFromServer: async () => ({ exists: () => false, data: () => null }),
    getDocs: async () => ({ forEach: () => {} }),
    setDoc: async () => {},
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
} = await import('../src/services/classDesignerService.ts');

const {
  RESORTE_EXAMPLE_PROJECT,
  DEFAULT_EMPTY_PROJECT,
} = await import('../src/types/classDesigner.ts');

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
  assert.ok(code.includes('class resorte {'), 'Must include class declaration');

  // Check field declarations
  assert.ok(code.includes('float x;'), 'Must include float x');
  assert.ok(code.includes('float longitudReposo;'), 'Must include float longitudReposo');
  assert.ok(code.includes('color colorResorte;'), 'Must include color colorResorte');

  // Check constructor
  assert.ok(code.includes('resorte(float xInicial, float yInicial, float longitudInicial, color colorInicial) {'), 'Must include constructor signature');
  assert.ok(code.includes('x = xInicial;'), 'Must map xInicial to x');
  assert.ok(code.includes('longitudReposo = 140.0;'), 'Must assign default value for strategy B');

  // Check methods
  assert.ok(code.includes('void mostrar() {'), 'Must include mostrar method');
  assert.ok(code.includes('void estirar(float fuerza) {'), 'Must include estirar with float parameter');
  assert.ok(code.includes('// TODO: Escribe aquí la implementación específica en Processing Java.'), 'Must preserve student autonomy');

  // Must not have leaked auto-generated functional behavior
  assert.ok(!code.includes('ellipse(x, y'), 'Must not auto-generate graphic code for the student');
});

test('Suggests camelCase when class name starts with uppercase', () => {
  const upperProject = {
    ...DEFAULT_EMPTY_PROJECT,
    className: 'Particula',
  };
  const diagnostics = validateClassDesign(upperProject);
  assert.ok(diagnostics.some((d) => d.id === 'diag-class-camel' && d.severity === 'suggestion'));
});

test('Sketch generator outputs companion test sketch with setup, draw, and method calls', () => {
  const sketch = generateProcessingMainSketch(RESORTE_EXAMPLE_PROJECT, 'miResorte');

  assert.ok(sketch.includes('resorte miResorte;'), 'Must declare instance reference');
  assert.ok(sketch.includes('void setup() {'), 'Must include setup()');
  assert.ok(sketch.includes('size(800, 600);'), 'Must define canvas size');
  assert.ok(sketch.includes('miResorte = new resorte('), 'Must instantiate with new');
  assert.ok(sketch.includes('void draw() {'), 'Must include draw()');
  assert.ok(sketch.includes('miResorte.mostrar();'), 'Must invoke mostrar()');
});

test('Class designer exports complete editable structure as JSON and re-imports cleanly for ongoing editing', () => {
  const jsonString = exportClassDesignAsJson(RESORTE_EXAMPLE_PROJECT);
  assert.ok(typeof jsonString === 'string', 'Export must return a string');
  assert.ok(jsonString.includes('laboratorio-codigo-creativo-class-design'), 'Must include format identifier');
  assert.ok(jsonString.includes('"className": "resorte"'), 'Must contain class name in structure');

  // Re-import from exported envelope
  const importResult = importClassDesignFromJson(jsonString);
  assert.equal(importResult.success, true, 'Import of exported JSON envelope must succeed');
  assert.ok(importResult.project, 'Imported result must provide project structure');
  assert.equal(importResult.project.className, 'resorte');
  assert.equal(importResult.project.fields.length, RESORTE_EXAMPLE_PROJECT.fields.length);
  assert.equal(importResult.project.methods.length, RESORTE_EXAMPLE_PROJECT.methods.length);
  assert.equal(importResult.project.constructorParams.length, RESORTE_EXAMPLE_PROJECT.constructorParams.length);

  // Import raw project JSON directly without envelope
  const rawProjectJson = JSON.stringify(DEFAULT_EMPTY_PROJECT);
  const rawImportResult = importClassDesignFromJson(rawProjectJson);
  assert.equal(rawImportResult.success, true, 'Import of raw project structure must succeed');
  assert.equal(rawImportResult.project.className, 'particula');
  assert.equal(rawImportResult.project.fields.length, DEFAULT_EMPTY_PROJECT.fields.length);

  // Robust error handling on corrupted or empty input
  const emptyResult = importClassDesignFromJson('');
  assert.equal(emptyResult.success, false, 'Empty input must safely return failure');
  assert.ok(emptyResult.error);

  const corruptedResult = importClassDesignFromJson('{ invalid json');
  assert.equal(corruptedResult.success, false, 'Invalid JSON must safely return failure');
  assert.ok(corruptedResult.error);
});
