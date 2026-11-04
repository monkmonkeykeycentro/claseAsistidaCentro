/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CURRICULUM_UNITS, ExerciseDefinition, UnitDefinition, UnitPublicationStatus } from '../data/unitsData';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const STORAGE_KEY_STATUS = 'curriculum_units_status_overrides';
const STORAGE_KEY_ORDER = 'curriculum_units_order_overrides';

export interface CurriculumInventorySummary {
  yaExistia: ExerciseDefinition[];
  creadoBorrador: ExerciseDefinition[];
  requiereDecisionDocente: ExerciseDefinition[];
  totalExercises: number;
}

/**
 * Returns default status map based on initial curriculum specifications:
 * - U2·02 (Cartografía del lienzo) is 'published' because it already existed and is protected.
 * - All other 13 new exercises are 'draft' waiting for teacher review.
 */
export function getDefaultStatusMap(): Record<string, UnitPublicationStatus> {
  const map: Record<string, UnitPublicationStatus> = {};
  for (const unit of CURRICULUM_UNITS) {
    for (const ex of unit.exercises) {
      map[ex.id] = ex.status;
    }
  }
  return map;
}

/**
 * Loads current publication status map from localStorage and Firestore if available.
 */
export async function loadCurriculumStatusMap(): Promise<Record<string, UnitPublicationStatus>> {
  const defaults = getDefaultStatusMap();
  let localOverrides: Record<string, UnitPublicationStatus> = {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STATUS);
    if (raw) {
      localOverrides = JSON.parse(raw);
    }
  } catch {
    // Ignore JSON error
  }

  try {
    const snap = await getDoc(doc(db, 'cms_site_content', 'units_curriculum_status'));
    if (snap.exists() && snap.data().statusMap) {
      return { ...defaults, ...localOverrides, ...snap.data().statusMap };
    }
  } catch {
    // Firestore may fail for unauthenticated visitors; return local + defaults
  }

  return { ...defaults, ...localOverrides };
}

/**
 * Saves status of an exercise (only allowed for teacher/admin).
 */
export async function saveExercisePublicationStatus(
  exerciseId: string,
  newStatus: UnitPublicationStatus,
  adminEmail?: string
): Promise<Record<string, UnitPublicationStatus>> {
  // Protection: U2·02 is permanent existing content
  if (exerciseId === 'u2-e2' && newStatus === 'draft') {
    throw new Error('El ejercicio preexistente U2·02 no puede ser despublicado ni modificado (regla no negociable).');
  }

  const current = await loadCurriculumStatusMap();
  const updated = { ...current, [exerciseId]: newStatus };

  try {
    localStorage.setItem(STORAGE_KEY_STATUS, JSON.stringify(updated));
  } catch {
    // Ignore
  }

  try {
    await setDoc(
      doc(db, 'cms_site_content', 'units_curriculum_status'),
      {
        key: 'units_curriculum_status',
        statusMap: updated,
        updatedAt: new Date().toISOString(),
        updatedBy: adminEmail || 'admin',
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Could not persist status to Firestore, saved locally:', err);
  }

  return updated;
}

/**
 * Bulk updates publication status for all exercises in a unit.
 */
export async function setUnitPublicationStatus(
  unitId: 'u1' | 'u2' | 'u3',
  newStatus: UnitPublicationStatus,
  adminEmail?: string
): Promise<Record<string, UnitPublicationStatus>> {
  const unit = CURRICULUM_UNITS.find((u) => u.id === unitId);
  if (!unit) return loadCurriculumStatusMap();

  const current = await loadCurriculumStatusMap();
  const updated = { ...current };

  for (const ex of unit.exercises) {
    if (ex.id === 'u2-e2') {
      // Keep existing published
      updated[ex.id] = 'published';
    } else {
      updated[ex.id] = newStatus;
    }
  }

  try {
    localStorage.setItem(STORAGE_KEY_STATUS, JSON.stringify(updated));
  } catch {
    // Ignore
  }

  try {
    await setDoc(
      doc(db, 'cms_site_content', 'units_curriculum_status'),
      {
        key: 'units_curriculum_status',
        statusMap: updated,
        updatedAt: new Date().toISOString(),
        updatedBy: adminEmail || 'admin',
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Could not persist status to Firestore, saved locally:', err);
  }

  return updated;
}

/**
 * Returns inventory classification summary according to document rules:
 * - Ya existía: U2·02 Coordenadas (CoordinateSystemExercise.tsx)
 * - Creado como borrador: 13 actividades nuevas
 * - Requiere decisión docente: todas las que continúan en 'draft'
 */
export function getCurriculumInventory(
  currentStatusMap: Record<string, UnitPublicationStatus>
): CurriculumInventorySummary {
  const allExercises: ExerciseDefinition[] = [];
  for (const unit of CURRICULUM_UNITS) {
    for (const ex of unit.exercises) {
      allExercises.push({
        ...ex,
        status: currentStatusMap[ex.id] || ex.status,
      });
    }
  }

  const yaExistia = allExercises.filter((e) => e.inventoryStatus === 'ya_existia');
  const creadoBorrador = allExercises.filter((e) => e.inventoryStatus === 'creado_borrador');
  const requiereDecisionDocente = allExercises.filter((e) => e.status === 'draft');

  return {
    yaExistia,
    creadoBorrador,
    requiereDecisionDocente,
    totalExercises: allExercises.length,
  };
}
