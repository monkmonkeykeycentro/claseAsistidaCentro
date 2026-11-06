/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ClassDesignProject,
  ClassDesignerDiagnostic,
  ClassDesignerField,
  ClassDesignerParam,
  ClassDesignerMethod,
  CodeGenerationOptions,
  DEFAULT_EMPTY_PROJECT,
  JAVA_RESERVED_KEYWORDS,
  JavaPrimitiveType,
} from '../types/classDesigner';
import { db } from './firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';

const LOCAL_STORAGE_ACTIVE_KEY = 'processing_class_designer_active';
const LOCAL_STORAGE_SAVED_LIST_KEY = 'processing_class_designer_saved_list';

// Helper: identifier validity
export function isValidJavaIdentifier(name: string): boolean {
  if (!name || name.trim() === '') return false;
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name);
}

export function isPascalCase(name: string): boolean {
  return /^[A-Z][a-zA-Z0-9]*$/.test(name);
}

export function isCamelCase(name: string): boolean {
  return /^[a-z][a-zA-Z0-9]*$/.test(name);
}

/**
 * Static Analysis & Validation Engine
 * Evaluates the class design according to the 6-stage progression.
 */
export function validateClassDesign(project: ClassDesignProject): ClassDesignerDiagnostic[] {
  const diagnostics: ClassDesignerDiagnostic[] = [];

  // STAGE 1: Object Definition & Class Name
  if (!project.className || project.className.trim() === '') {
    diagnostics.push({
      id: 'diag-class-empty',
      severity: 'error',
      stage: 1,
      stageName: 'Definir el objeto',
      title: 'Nombre de clase obligatorio',
      message: 'La clase debe tener un identificador que represente el molde del objeto.'
    });
  } else {
    if (!isValidJavaIdentifier(project.className)) {
      diagnostics.push({
        id: 'diag-class-invalid',
        severity: 'error',
        stage: 1,
        stageName: 'Definir el objeto',
        title: 'Identificador no válido en Java',
        message: `"${project.className}" no es un nombre válido. No uses espacios, guiones ni comiences con números.`
      });
    } else if (JAVA_RESERVED_KEYWORDS.has(project.className.toLowerCase())) {
      diagnostics.push({
        id: 'diag-class-reserved',
        severity: 'error',
        stage: 1,
        stageName: 'Definir el objeto',
        title: 'Palabra reservada o comando protegido',
        message: `"${project.className}" coincide con una palabra clave o función nativa de Processing/Java.`
      });
    } else if (!isCamelCase(project.className)) {
      diagnostics.push({
        id: 'diag-class-camel',
        severity: 'suggestion',
        stage: 1,
        stageName: 'Definir el objeto',
        title: 'Convención camelCase',
        message: 'Usamos la convención camelCase con minúscula inicial (ej: "particula", "resorte", "criatura").'
      });
    }
  }

  // Reflection questions check
  const q = project.guidingQuestions;
  if (!q.realWorldObject?.trim() || !q.definingFeatures?.trim()) {
    diagnostics.push({
      id: 'diag-guiding-incomplete',
      severity: 'suggestion',
      stage: 1,
      stageName: 'Definir el objeto',
      title: 'Reflexión conceptual pendiente',
      message: 'Completar las preguntas guía te ayudará a separar qué es inherente al objeto y qué puede variar.'
    });
  }

  // STAGE 2: Fields Identification
  const fieldNames = new Set<string>();
  if (project.fields.length === 0) {
    diagnostics.push({
      id: 'diag-fields-empty',
      severity: 'warning',
      stage: 2,
      stageName: 'Identificar campos',
      title: 'Clase sin campos de estado',
      message: 'Un objeto sin campos no tiene estado interno. Agrega al menos una variable que defina su posición o apariencia.'
    });
  }

  project.fields.forEach((field) => {
    if (!field.name || field.name.trim() === '') {
      diagnostics.push({
        id: `diag-field-noname-${field.id}`,
        severity: 'error',
        stage: 2,
        stageName: 'Identificar campos',
        title: 'Campo sin nombre',
        message: 'Todos los campos deben tener un nombre asignado.',
        fieldId: field.id
      });
      return;
    }

    if (!isValidJavaIdentifier(field.name)) {
      diagnostics.push({
        id: `diag-field-invalid-${field.id}`,
        severity: 'error',
        stage: 2,
        stageName: 'Identificar campos',
        title: `Nombre de campo no válido: "${field.name}"`,
        message: 'Usa letras, números y camelCase sin espacios ni signos de puntuación.',
        fieldId: field.id
      });
    }

    if (JAVA_RESERVED_KEYWORDS.has(field.name)) {
      diagnostics.push({
        id: `diag-field-reserved-${field.id}`,
        severity: 'error',
        stage: 2,
        stageName: 'Identificar campos',
        title: `Palabra reservada: "${field.name}"`,
        message: `El nombre "${field.name}" coincide con una palabra clave del lenguaje.`,
        fieldId: field.id
      });
    }

    if (fieldNames.has(field.name)) {
      diagnostics.push({
        id: `diag-field-duplicate-${field.id}`,
        severity: 'error',
        stage: 2,
        stageName: 'Identificar campos',
        title: `Campo duplicado: "${field.name}"`,
        message: 'No puede haber dos variables con el mismo nombre en la misma clase.',
        fieldId: field.id
      });
    } else {
      fieldNames.add(field.name);
    }

    if (field.initStrategy === 'default-value' && (!field.defaultValue || field.defaultValue.trim() === '')) {
      diagnostics.push({
        id: `diag-field-missing-default-${field.id}`,
        severity: 'warning',
        stage: 2,
        stageName: 'Identificar campos',
        title: `Falta valor por defecto en "${field.name}"`,
        message: 'Elegiste inicialización interna fija pero no indicaste el valor predeterminado.',
        fieldId: field.id
      });
    }

    if (!isCamelCase(field.name)) {
      diagnostics.push({
        id: `diag-field-camel-${field.id}`,
        severity: 'suggestion',
        stage: 2,
        stageName: 'Identificar campos',
        title: `Usa camelCase para "${field.name}"`,
        message: 'Los nombres de campos suelen comenzar en minúscula (ej: "longitudReposo", "velocidadX").',
        fieldId: field.id
      });
    }
  });

  // STAGE 3: Constructor Configuration
  const paramNames = new Set<string>();
  const mappedFieldIds = new Set<string>();

  project.constructorParams.forEach((param) => {
    if (!param.name || param.name.trim() === '') {
      diagnostics.push({
        id: `diag-param-noname-${param.id}`,
        severity: 'error',
        stage: 3,
        stageName: 'Configurar constructor',
        title: 'Parámetro sin nombre',
        message: 'Todos los parámetros del constructor deben tener un identificador.'
      });
      return;
    }

    if (!isValidJavaIdentifier(param.name)) {
      diagnostics.push({
        id: `diag-param-invalid-${param.id}`,
        severity: 'error',
        stage: 3,
        stageName: 'Configurar constructor',
        title: `Nombre de parámetro no válido: "${param.name}"`,
        message: 'El nombre de parámetro debe ser un identificador válido en Java.'
      });
    }

    if (paramNames.has(param.name)) {
      diagnostics.push({
        id: `diag-param-dup-${param.id}`,
        severity: 'error',
        stage: 3,
        stageName: 'Configurar constructor',
        title: `Parámetro duplicado: "${param.name}"`,
        message: 'No puedes repetir el mismo nombre de parámetro en la firma del constructor.'
      });
    } else {
      paramNames.add(param.name);
    }

    if (!param.targetFieldId) {
      diagnostics.push({
        id: `diag-param-unmapped-${param.id}`,
        severity: 'warning',
        stage: 3,
        stageName: 'Configurar constructor',
        title: `Parámetro huérfano: "${param.name}"`,
        message: 'Este parámetro se recibe en el constructor pero no se asigna a ningún campo del objeto.'
      });
    } else {
      const targetField = project.fields.find((f) => f.id === param.targetFieldId);
      if (!targetField) {
        diagnostics.push({
          id: `diag-param-invalid-target-${param.id}`,
          severity: 'error',
          stage: 3,
          stageName: 'Configurar constructor',
          title: `Campo de destino no encontrado para "${param.name}"`,
          message: 'El parámetro apunta a un campo que fue eliminado.'
        });
      } else {
        mappedFieldIds.add(targetField.id);
        if (targetField.type !== param.type) {
          diagnostics.push({
            id: `diag-param-type-mismatch-${param.id}`,
            severity: 'error',
            stage: 3,
            stageName: 'Configurar constructor',
            title: `Incompatibilidad de tipos en "${param.name}"`,
            message: `El parámetro es de tipo "${param.type}" pero el campo "${targetField.name}" es de tipo "${targetField.type}".`
          });
        }
      }
    }
  });

  // Check if fields marked as 'constructor-param' are actually mapped
  project.fields.forEach((field) => {
    if (field.initStrategy === 'constructor-param' && !mappedFieldIds.has(field.id)) {
      diagnostics.push({
        id: `diag-field-unmapped-param-${field.id}`,
        severity: 'warning',
        stage: 3,
        stageName: 'Configurar constructor',
        title: `Campo "${field.name}" sin parámetro`,
        message: 'Se indicó que se inicializa por constructor, pero no tiene ningún parámetro asociado.',
        fieldId: field.id
      });
    }
  });

  // STAGE 4: Methods Design
  const methodNames = new Set<string>();
  if (project.methods.length === 0) {
    diagnostics.push({
      id: 'diag-methods-empty',
      severity: 'warning',
      stage: 4,
      stageName: 'Diseñar métodos',
      title: 'Clase sin comportamientos',
      message: 'Agrega al menos un método (como "dibujar()", "actualizar()" o "mover()") para dotar de comportamiento a tus objetos.'
    });
  }

  project.methods.forEach((method) => {
    if (!method.name || method.name.trim() === '') {
      diagnostics.push({
        id: `diag-method-noname-${method.id}`,
        severity: 'error',
        stage: 4,
        stageName: 'Diseñar métodos',
        title: 'Método sin nombre',
        message: 'Cada método debe tener un nombre representativo.',
        methodId: method.id
      });
      return;
    }

    if (!isValidJavaIdentifier(method.name)) {
      diagnostics.push({
        id: `diag-method-invalid-${method.id}`,
        severity: 'error',
        stage: 4,
        stageName: 'Diseñar métodos',
        title: `Nombre de método no válido: "${method.name}"`,
        message: 'El nombre de método debe ser un identificador válido en Java sin paréntesis ni espacios.',
        methodId: method.id
      });
    }

    if (JAVA_RESERVED_KEYWORDS.has(method.name)) {
      diagnostics.push({
        id: `diag-method-reserved-${method.id}`,
        severity: 'error',
        stage: 4,
        stageName: 'Diseñar métodos',
        title: `Palabra reservada en método: "${method.name}"`,
        message: `El nombre coincide con una palabra clave o función reservada de Processing.`,
        methodId: method.id
      });
    }

    if (methodNames.has(method.name)) {
      diagnostics.push({
        id: `diag-method-duplicate-${method.id}`,
        severity: 'error',
        stage: 4,
        stageName: 'Diseñar métodos',
        title: `Método duplicado: "${method.name}"`,
        message: 'En este ejercicio básico, evita sobrecargar o duplicar métodos con el mismo nombre.',
        methodId: method.id
      });
    } else {
      methodNames.add(method.name);
    }

    if (!isCamelCase(method.name)) {
      diagnostics.push({
        id: `diag-method-camel-${method.id}`,
        severity: 'suggestion',
        stage: 4,
        stageName: 'Diseñar métodos',
        title: `Usa verbos en camelCase para "${method.name}"`,
        message: 'Los métodos representan acciones. Se recomienda iniciar con minúscula (ej: "dibujar", "cambiarColor").',
        methodId: method.id
      });
    }

    // Method params check
    const mParamNames = new Set<string>();
    method.params.forEach((mp) => {
      if (!mp.name || !isValidJavaIdentifier(mp.name)) {
        diagnostics.push({
          id: `diag-mparam-invalid-${method.id}-${mp.id}`,
          severity: 'error',
          stage: 4,
          stageName: 'Diseñar métodos',
          title: `Parámetro de método inválido en "${method.name}"`,
          message: `El parámetro "${mp.name}" no es válido.`,
          methodId: method.id
        });
      }
      if (mParamNames.has(mp.name)) {
        diagnostics.push({
          id: `diag-mparam-dup-${method.id}-${mp.id}`,
          severity: 'error',
          stage: 4,
          stageName: 'Diseñar métodos',
          title: `Parámetro repetido en "${method.name}"`,
          message: `El parámetro "${mp.name}" está duplicado en la firma del método.`,
          methodId: method.id
        });
      } else {
        mParamNames.add(mp.name);
      }
    });
  });

  // STAGE 5: Method-Field Relations
  const existingFieldIds = new Set(project.fields.map((f) => f.id));
  project.methods.forEach((method) => {
    if (method.relatedFieldIds.length === 0) {
      diagnostics.push({
        id: `diag-relation-empty-${method.id}`,
        severity: 'suggestion',
        stage: 5,
        stageName: 'Establecer relaciones',
        title: `"${method.name}" no tiene campos relacionados`,
        message: 'Asocia qué campos lee o transforma este método para documentar el flujo de datos.',
        methodId: method.id
      });
    } else {
      const invalidFieldRel = method.relatedFieldIds.some((fId) => !existingFieldIds.has(fId));
      if (invalidFieldRel) {
        diagnostics.push({
          id: `diag-relation-ghost-${method.id}`,
          severity: 'warning',
          stage: 5,
          stageName: 'Establecer relaciones',
          title: `Relación con campo inexistente en "${method.name}"`,
          message: 'El método tiene vinculadas variables que ya no existen.',
          methodId: method.id
        });
      }
    }
  });

  return diagnostics;
}

/**
 * Pure Deterministic Java Code Generator for the .pde Class
 * Strictly outputs orienting // TODO: comments—no auto-generated functional behavior.
 */
export function generateProcessingClassCode(
  project: ClassDesignProject,
  options: Partial<CodeGenerationOptions> = {}
): string {
  const className = project.className.trim() || 'miClase';
  const lines: string[] = [];

  // File header banner
  lines.push(`// ==========================================================`);
  lines.push(`// Clase: ${className}`);
  lines.push(`// Proyecto: ${project.projectName}`);
  if (project.conceptDescription) {
    lines.push(`// Concepto: ${project.conceptDescription}`);
  }
  lines.push(`// Generado con el Diseñador de Clases — Laboratorio de Código Creativo`);
  lines.push(`// ==========================================================`);
  lines.push('');

  // Class declaration
  lines.push(`class ${className} {`);

  // 1. Campos (Atributos / Estado)
  lines.push('  // --------------------------------------------------------');
  lines.push('  // 1. CAMPOS (Atributos o variables de estado del objeto)');
  lines.push('  // --------------------------------------------------------');
  if (project.fields.length === 0) {
    lines.push('  // TODO: Agrega campos como "float x;", "float y;", etc.');
  } else {
    project.fields.forEach((field) => {
      const fieldDesc = field.description ? ` // ${field.description}` : '';
      lines.push(`  ${field.type} ${field.name};${fieldDesc}`);
    });
  }
  lines.push('');

  // 2. Constructor
  lines.push('  // --------------------------------------------------------');
  lines.push('  // 2. CONSTRUCTOR (Inicializa el objeto al crearse con new)');
  lines.push('  // --------------------------------------------------------');
  const paramSignatures = project.constructorParams.map((p) => `${p.type} ${p.name}`).join(', ');
  lines.push(`  ${className}(${paramSignatures}) {`);

  // Constructor assignments from parameters
  const assignedFieldIds = new Set<string>();
  if (project.constructorParams.length > 0) {
    project.constructorParams.forEach((param) => {
      if (param.targetFieldId) {
        const targetField = project.fields.find((f) => f.id === param.targetFieldId);
        if (targetField) {
          assignedFieldIds.add(targetField.id);
          if (param.name === targetField.name) {
            lines.push(`    this.${targetField.name} = ${param.name};`);
          } else {
            lines.push(`    ${targetField.name} = ${param.name};`);
          }
        }
      }
    });
  }

  // Internal default assignments
  const defaultFields = project.fields.filter(
    (f) => f.initStrategy === 'default-value' && !assignedFieldIds.has(f.id)
  );
  if (defaultFields.length > 0) {
    lines.push('    // Valores predeterminados internos:');
    defaultFields.forEach((f) => {
      let defaultVal = f.defaultValue?.trim() || getFallbackValueForType(f.type);
      lines.push(`    ${f.name} = ${defaultVal};`);
    });
  }

  // Fields initialized later or needing attention
  const laterFields = project.fields.filter(
    (f) => f.initStrategy === 'later' && !assignedFieldIds.has(f.id)
  );
  if (laterFields.length > 0) {
    laterFields.forEach((f) => {
      lines.push(`    // ${f.name} se inicializará posteriormente en un método.`);
    });
  }

  lines.push('  }');
  lines.push('');

  // 3. Métodos
  lines.push('  // --------------------------------------------------------');
  lines.push('  // 3. MÉTODOS (Comportamientos y acciones que puede realizar)');
  lines.push('  // --------------------------------------------------------');
  if (project.methods.length === 0) {
    lines.push('  // TODO: Agrega métodos como "void dibujar() { ... }"');
  } else {
    project.methods.forEach((method, idx) => {
      const methodParams = method.params.map((mp) => `${mp.type} ${mp.name}`).join(', ');
      lines.push(`  ${method.returnType} ${method.name}(${methodParams}) {`);

      // Guide description as orienting comment
      if (method.description) {
        lines.push(`    // Objetivo: ${method.description}`);
      }

      // Related fields documentation
      if (method.relatedFieldIds.length > 0) {
        const relatedNames = method.relatedFieldIds
          .map((id) => project.fields.find((f) => f.id === id)?.name)
          .filter(Boolean);
        if (relatedNames.length > 0) {
          const actionWord =
            method.relationType === 'mutates'
              ? 'modifica los campos'
              : method.relationType === 'reads'
              ? 'lee los campos'
              : 'lee y modifica los campos';
          lines.push(`    // Nota de diseño: Este método ${actionWord}: ${relatedNames.join(', ')}`);
        }
      }

      // Pedagogical guidance: never write the full solution automatically
      lines.push('    // TODO: Escribe aquí la implementación específica en Processing Java.');
      if (method.returnType !== 'void') {
        const dummyReturn = getFallbackValueForType(method.returnType as JavaPrimitiveType);
        lines.push(`    return ${dummyReturn};`);
      }

      lines.push('  }');
      if (idx < project.methods.length - 1) {
        lines.push('');
      }
    });
  }

  lines.push('}');
  return lines.join('\n');
}

/**
 * Generates the companion Processing Java Test Sketch (.pde tab)
 */
export function generateProcessingMainSketch(
  project: ClassDesignProject,
  instanceName = 'miObjeto'
): string {
  const className = project.className.trim() || 'miClase';
  const lines: string[] = [];

  lines.push(`// ==========================================================`);
  lines.push(`// Sketch Principal de Prueba: sketch_${className.toLowerCase()}.pde`);
  lines.push(`// ==========================================================`);
  lines.push('');
  lines.push(`// 1. Declaración de la variable de referencia para el objeto`);
  lines.push(`${className} ${instanceName};`);
  lines.push('');
  lines.push('void setup() {');
  lines.push('  size(800, 600);');
  lines.push('  smooth();');
  lines.push('');
  lines.push('  // 2. Instanciación: creamos el objeto llamando al constructor');

  const constructorArgs = project.constructorParams.map((param) => {
    return getExampleArgumentForType(param.type, param.name);
  }).join(', ');

  lines.push(`  ${instanceName} = new ${className}(${constructorArgs});`);
  lines.push('}');
  lines.push('');
  lines.push('void draw() {');
  lines.push('  background(240);');
  lines.push('');
  lines.push('  // 3. Invocación de métodos en cada fotograma:');

  if (project.methods.length === 0) {
    lines.push('  // (No hay métodos definidos aún en la clase)');
  } else {
    project.methods.forEach((method) => {
      const args = method.params.map((p) => getExampleArgumentForType(p.type, p.name)).join(', ');
      lines.push(`  ${instanceName}.${method.name}(${args});`);
    });
  }

  lines.push('}');
  return lines.join('\n');
}

export function getFallbackValueForType(type: JavaPrimitiveType): string {
  switch (type) {
    case 'int': return '0';
    case 'float': return '0.0';
    case 'boolean': return 'false';
    case 'String': return '""';
    case 'color': return 'color(0)';
    default: return '0';
  }
}

export function getExampleArgumentForType(type: JavaPrimitiveType, paramName = ''): string {
  const lower = paramName.toLowerCase();
  if (lower.includes('color')) return 'color(64, 123, 93)';
  if (lower.includes('x')) return 'width / 2';
  if (lower.includes('y')) return 'height / 2';
  if (lower.includes('fuerza')) return '2.5';
  if (lower.includes('longitud')) return '120.0';

  switch (type) {
    case 'int': return '10';
    case 'float': return '50.0';
    case 'boolean': return 'true';
    case 'String': return '"hola"';
    case 'color': return 'color(64, 123, 93)';
    default: return '0';
  }
}

/**
 * Storage Helpers
 */
export function saveClassDesignToLocal(project: ClassDesignProject): void {
  try {
    const updated = { ...project, updatedAt: new Date().toISOString() };
    localStorage.setItem(LOCAL_STORAGE_ACTIVE_KEY, JSON.stringify(updated));

    // Also update in list of saved designs
    const savedList = listSavedDesignsFromLocal();
    const existingIdx = savedList.findIndex((p) => p.id === updated.id);
    if (existingIdx >= 0) {
      savedList[existingIdx] = updated;
    } else {
      savedList.unshift(updated);
    }
    localStorage.setItem(LOCAL_STORAGE_SAVED_LIST_KEY, JSON.stringify(savedList));
  } catch (err) {
    console.warn('No se pudo guardar localmente el diseño de clase:', err);
  }
}

export function loadClassDesignFromLocal(): ClassDesignProject {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_ACTIVE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.className && Array.isArray(parsed.fields)) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_EMPTY_PROJECT;
}

export function listSavedDesignsFromLocal(): ClassDesignProject[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_SAVED_LIST_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // fallback
  }
  return [DEFAULT_EMPTY_PROJECT];
}

export async function saveClassDesignToFirestore(
  userId: string,
  project: ClassDesignProject
): Promise<void> {
  const safeDocId = project.id.replace(/[^a-zA-Z0-9_-]/g, '_') || 'diseno_principal';
  const designRef = doc(db, 'users', userId, 'class_designs', safeDocId);
  const dataToSave = {
    ...project,
    userId,
    updatedAt: new Date().toISOString(),
  };
  await setDoc(designRef, dataToSave, { merge: true });
}

export async function loadClassDesignsFromFirestore(
  userId: string
): Promise<ClassDesignProject[]> {
  try {
    const colRef = collection(db, 'users', userId, 'class_designs');
    const q = query(colRef, orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);
    const list: ClassDesignProject[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as ClassDesignProject);
    });
    return list;
  } catch (err) {
    console.warn('Error loading designs from Firestore:', err);
    return [];
  }
}

export async function deleteClassDesignFromFirestore(
  userId: string,
  designId: string
): Promise<void> {
  const safeDocId = designId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const designRef = doc(db, 'users', userId, 'class_designs', safeDocId);
  await deleteDoc(designRef);
}

export interface ClassDesignExportPackage {
  format: 'laboratorio-codigo-creativo-class-design';
  version: '1.0';
  exportedAt: string;
  tool: string;
  project: ClassDesignProject;
}

/**
 * Serializes the complete editable class design structure into a formatted JSON string.
 */
export function exportClassDesignAsJson(project: ClassDesignProject): string {
  const exportPackage: ClassDesignExportPackage = {
    format: 'laboratorio-codigo-creativo-class-design',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    tool: 'Diseñador de Clases POO · Laboratorio de Código Creativo',
    project: {
      ...project,
      updatedAt: new Date().toISOString(),
    },
  };
  return JSON.stringify(exportPackage, null, 2);
}

/**
 * Triggers a browser download of the class design as a .json file.
 */
export function downloadClassDesignJson(project: ClassDesignProject): void {
  const json = exportClassDesignAsJson(project);
  const safeName = (project.className || 'clase').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  const filename = `diseno_${safeName}.json`;
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parses and validates an imported JSON string into an editable ClassDesignProject.
 * Supports both the packaged envelope ({ format, project }) and raw ClassDesignProject objects.
 */
export function importClassDesignFromJson(jsonString: string): {
  success: boolean;
  project?: ClassDesignProject;
  error?: string;
} {
  try {
    if (!jsonString || typeof jsonString !== 'string' || jsonString.trim() === '') {
      return { success: false, error: 'El contenido JSON está vacío.' };
    }

    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'El archivo no contiene un objeto JSON válido.' };
    }

    // Extract project if wrapped in export envelope
    const rawProject =
      parsed.format === 'laboratorio-codigo-creativo-class-design' && parsed.project
        ? parsed.project
        : parsed;

    if (!rawProject || typeof rawProject !== 'object') {
      return { success: false, error: 'No se encontró la estructura de diseño en el archivo.' };
    }

    // Basic structural validation
    const className = typeof rawProject.className === 'string' ? rawProject.className.trim() : '';
    const projectName =
      typeof rawProject.projectName === 'string' && rawProject.projectName.trim() !== ''
        ? rawProject.projectName.trim()
        : className
        ? `Proyecto ${className}`
        : 'Diseño Importado';

    // Sanitize fields
    const fields: ClassDesignerField[] = Array.isArray(rawProject.fields)
      ? rawProject.fields.map((f: any, idx: number) => ({
          id: typeof f?.id === 'string' && f.id ? f.id : `f-imp-${idx}-${Date.now()}`,
          name: typeof f?.name === 'string' ? f.name.trim() : `campo${idx + 1}`,
          type: (['int', 'float', 'boolean', 'String', 'color'].includes(f?.type)
            ? f.type
            : 'float') as JavaPrimitiveType,
          description: typeof f?.description === 'string' ? f.description : '',
          initStrategy: (['constructor-param', 'default-value', 'later'].includes(f?.initStrategy)
            ? f.initStrategy
            : 'constructor-param') as any,
          defaultValue: typeof f?.defaultValue === 'string' ? f.defaultValue : undefined,
        }))
      : [];

    // Sanitize constructorParams
    const constructorParams: ClassDesignerParam[] = Array.isArray(rawProject.constructorParams)
      ? rawProject.constructorParams.map((p: any, idx: number) => ({
          id: typeof p?.id === 'string' && p.id ? p.id : `p-imp-${idx}-${Date.now()}`,
          name: typeof p?.name === 'string' ? p.name.trim() : `param${idx + 1}`,
          type: (['int', 'float', 'boolean', 'String', 'color'].includes(p?.type)
            ? p.type
            : 'float') as JavaPrimitiveType,
          targetFieldId: typeof p?.targetFieldId === 'string' ? p.targetFieldId : undefined,
          description: typeof p?.description === 'string' ? p.description : undefined,
        }))
      : [];

    // Sanitize methods
    const methods: ClassDesignerMethod[] = Array.isArray(rawProject.methods)
      ? rawProject.methods.map((m: any, idx: number) => ({
          id: typeof m?.id === 'string' && m.id ? m.id : `m-imp-${idx}-${Date.now()}`,
          name: typeof m?.name === 'string' ? m.name.trim() : `metodo${idx + 1}`,
          returnType: (['void', 'int', 'float', 'boolean', 'String', 'color'].includes(m?.returnType)
            ? m.returnType
            : 'void') as any,
          description: typeof m?.description === 'string' ? m.description : '',
          params: Array.isArray(m?.params)
            ? m.params.map((mp: any, mpIdx: number) => ({
                id: typeof mp?.id === 'string' && mp.id ? mp.id : `mp-imp-${mpIdx}-${Date.now()}`,
                name: typeof mp?.name === 'string' ? mp.name.trim() : `arg${mpIdx + 1}`,
                type: (['int', 'float', 'boolean', 'String', 'color'].includes(mp?.type)
                  ? mp.type
                  : 'float') as JavaPrimitiveType,
              }))
            : [],
          relatedFieldIds: Array.isArray(m?.relatedFieldIds)
            ? m.relatedFieldIds.filter((id: any) => typeof id === 'string')
            : [],
          relationType: (['reads', 'mutates', 'both'].includes(m?.relationType)
            ? m.relationType
            : 'mutates') as any,
        }))
      : [];

    // Sanitize guiding questions
    const gq = rawProject.guidingQuestions || {};
    const guidingQuestions = {
      realWorldObject: typeof gq.realWorldObject === 'string' ? gq.realWorldObject : '',
      definingFeatures: typeof gq.definingFeatures === 'string' ? gq.definingFeatures : '',
      changeableFeatures: typeof gq.changeableFeatures === 'string' ? gq.changeableFeatures : '',
      actionsAndBehaviors: typeof gq.actionsAndBehaviors === 'string' ? gq.actionsAndBehaviors : '',
    };

    const sanitizedProject: ClassDesignProject = {
      id: typeof rawProject.id === 'string' && rawProject.id ? rawProject.id : `diseno-imp-${Date.now()}`,
      userId: typeof rawProject.userId === 'string' ? rawProject.userId : undefined,
      projectName,
      className: className || 'objetoCreativo',
      conceptDescription:
        typeof rawProject.conceptDescription === 'string'
          ? rawProject.conceptDescription
          : 'Diseño importado para continuar edición.',
      guidingQuestions,
      fields,
      constructorParams,
      methods,
      createdAt: typeof rawProject.createdAt === 'string' ? rawProject.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      project: sanitizedProject,
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Error al procesar el archivo JSON: ${err?.message || 'Estructura no válida'}`,
    };
  }
}

