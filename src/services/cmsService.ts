import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  writeBatch,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import {
  CmsModule,
  CmsLesson,
  CmsSection,
  CmsBlock,
  CmsSiteContent,
  CmsSiteContentCombined,
  CmsMediaResource,
  CmsRevision,
  CurriculumExportData,
} from '../types/cms';
import { TOPICS_DATA, TopicItem, TopicConcept } from '../data/topicsData';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ============================================================================
// 1. DEFAULT SITE CONTENT
// ============================================================================
export const DEFAULT_SITE_CONTENT: Record<string, CmsSiteContent> = {
  hero_headline: {
    key: 'hero_headline',
    title: 'Titular Principal (Hero)',
    section: 'portada',
    content: 'El código como herramienta de creación y experimentación creativa.',
    updatedAt: new Date().toISOString(),
  },
  hero_subtitle: {
    key: 'hero_subtitle',
    title: 'Subtítulo y Párrafo de Bienvenida',
    section: 'portada',
    content:
      'Laboratorio de Código Creativo es una herramienta educativa interactiva que, mediante ejemplos visuales, ejercicios progresivos y experimentación, facilita el aprendizaje de la programación y la comprensión de las tecnologías creativas, fomentando la autonomía de los estudiantes para explorar e incorporar estas herramientas en sus propios procesos de creación y producción.',
    updatedAt: new Date().toISOString(),
  },
  hero_badge: {
    key: 'hero_badge',
    title: 'Insignia del Banner',
    section: 'portada',
    content: 'Laboratorio de Código Creativo',
    updatedAt: new Date().toISOString(),
  },
  generative_question: {
    key: 'generative_question',
    title: 'Pregunta Pensamiento Generativo',
    section: 'pensamiento_generativo',
    content: '¿Cómo funciona el pensamiento generativo?',
    updatedAt: new Date().toISOString(),
  },
  generative_principles: {
    key: 'generative_principles',
    title: 'Cadena de Principios Generativos',
    section: 'pensamiento_generativo',
    content: '1. Código, 2. Sistema, 3. Regla, 4. Variación, 5. Forma',
    updatedAt: new Date().toISOString(),
  },
  oop_lab_title: {
    key: 'oop_lab_title',
    title: 'Título Tarjeta Laboratorio POO',
    section: 'laboratorios',
    content: 'Laboratorio de Objetos: Pelota, Burbuja y Arreglos',
    updatedAt: new Date().toISOString(),
  },
  oop_lab_summary: {
    key: 'oop_lab_summary',
    title: 'Descripción Tarjeta Laboratorio POO',
    section: 'laboratorios',
    content:
      'Aprende Programación Orientada a Objetos en Processing Java mediante la construcción progresiva: campos espaciales, constructor con argumentos, 7 métodos de estado, movimiento fluido bidimensional con ruido Perlin (noise()) y control sobre arreglos colectivos.',
    updatedAt: new Date().toISOString(),
  },
  workshop_title: {
    key: 'workshop_title',
    title: 'Título Tarjeta Taller Conceptual',
    section: 'laboratorios',
    content: 'Anatomía y Estructura de una Clase en Processing',
    updatedAt: new Date().toISOString(),
  },
  workshop_summary: {
    key: 'workshop_summary',
    title: 'Descripción Tarjeta Taller Conceptual',
    section: 'laboratorios',
    content:
      'Recorrido didáctico en 4 etapas para comprender las partes anatómicas de una clase: declaración del molde, asignación de campos en memoria, inicialización del constructor y firma de métodos.',
    updatedAt: new Date().toISOString(),
  },
  philosophy_title: {
    key: 'philosophy_title',
    title: 'Título Filosofía Didáctica',
    section: 'filosofia',
    content: 'Filosofía de Código Creativo · Generative Design',
    updatedAt: new Date().toISOString(),
  },
  footer_text: {
    key: 'footer_text',
    title: 'Párrafo de Filosofía Didáctica',
    section: 'filosofia',
    content:
      'Inspirado en los principios de Generative Design, este laboratorio aborda la programación como un medio artístico y constructivo. La riqueza visual no surge del adorno superficial, sino de la combinación disciplinada de reglas matemáticas sencillas: iteración, modulación senoidal, ruido Perlin y la arquitectura orientada a objetos de Processing.',
    updatedAt: new Date().toISOString(),
  },
};

// ============================================================================
// 2. MIGRATION & SEEDING (FROM TOPICS_DATA)
// ============================================================================

/**
 * Checks if CMS content exists in Firestore. If empty, automatically seeds
 * from existing static curriculum (TOPICS_DATA) preserving all concepts and code.
 */
export async function seedCmsFromExistingContentIfEmpty(): Promise<{
  seeded: boolean;
  moduleCount: number;
}> {
  const path = 'cms_modules';
  try {
    const snap = await getDocs(collection(db, path));
    if (!snap.empty) {
      return { seeded: false, moduleCount: snap.size };
    }

    console.info('🌱 Initializing CMS database from existing curriculum...');
    const now = new Date().toISOString();

    // Map each TOPICS_DATA item into a Module + Lesson + Sections + Blocks
    for (let i = 0; i < TOPICS_DATA.length; i++) {
      const topic = TOPICS_DATA[i];
      const moduleId = `mod_${topic.id}`;
      const lessonId = `les_${topic.id}`;

      // 1. Module
      const moduleDoc: CmsModule = {
        id: moduleId,
        title: `Módulo 0${topic.number}: ${topic.title}`,
        description: topic.summary,
        category: topic.category,
        badge: topic.badge,
        slug: topic.id,
        position: i,
        status: 'published',
        visible: true,
        createdAt: now,
        updatedAt: now,
      };
      await setDoc(doc(db, 'cms_modules', moduleId), moduleDoc);

      // 2. Lesson
      const lessonDoc: CmsLesson = {
        id: lessonId,
        moduleId: moduleId,
        title: topic.title,
        summary: topic.summary,
        badge: topic.badge,
        estimatedTime: topic.estimatedTime,
        slug: topic.id,
        position: 0,
        status: 'published',
        visible: true,
        hasInteractiveWorkshop: topic.hasInteractiveWorkshop,
        workshopType:
          topic.id === 'classes'
            ? 'classes'
            : topic.id === 'object-arrays'
            ? 'object-arrays'
            : undefined,
        createdAt: now,
        updatedAt: now,
      };
      await setDoc(doc(db, 'cms_lessons', lessonId), lessonDoc);

      // 3. Sections & Blocks (from concepts)
      for (let cIdx = 0; cIdx < topic.concepts.length; cIdx++) {
        const concept = topic.concepts[cIdx];
        const sectionId = `sec_${concept.id}`;

        const sectionDoc: CmsSection = {
          id: sectionId,
          lessonId: lessonId,
          title: concept.title,
          summary: concept.summary,
          position: cIdx,
          visible: true,
          didacticTip: concept.didacticTip,
          commonMistake: concept.commonMistake,
          createdAt: now,
          updatedAt: now,
        };
        await setDoc(doc(db, 'cms_sections', sectionId), sectionDoc);

        // Block 1: Explanation (rich-text)
        const blockTextId = `blk_${concept.id}_text`;
        const blockText: CmsBlock = {
          id: blockTextId,
          sectionId: sectionId,
          type: 'rich-text',
          content: concept.explanation,
          position: 0,
          createdAt: now,
          updatedAt: now,
        };
        await setDoc(doc(db, 'cms_blocks', blockTextId), blockText);

        // Block 2: Code Snippet (code)
        if (concept.codeSnippet) {
          const blockCodeId = `blk_${concept.id}_code`;
          const blockCode: CmsBlock = {
            id: blockCodeId,
            sectionId: sectionId,
            type: 'code',
            content: concept.codeSnippet,
            filename: `${concept.id}.pde`,
            caption: `Ejemplo Processing Java para ${concept.title}`,
            position: 1,
            createdAt: now,
            updatedAt: now,
          };
          await setDoc(doc(db, 'cms_blocks', blockCodeId), blockCode);
        }

        // Block 3: Didactic Tip (callout)
        if (concept.didacticTip) {
          const blockTipId = `blk_${concept.id}_tip`;
          const blockTip: CmsBlock = {
            id: blockTipId,
            sectionId: sectionId,
            type: 'callout',
            calloutType: 'tip',
            content: concept.didacticTip,
            caption: 'Principio estructural didáctico',
            position: 2,
            createdAt: now,
            updatedAt: now,
          };
          await setDoc(doc(db, 'cms_blocks', blockTipId), blockTip);
        }

        // Block 4: Common Mistake (callout)
        if (concept.commonMistake) {
          const blockMistakeId = `blk_${concept.id}_mistake`;
          const blockMistake: CmsBlock = {
            id: blockMistakeId,
            sectionId: sectionId,
            type: 'callout',
            calloutType: 'warning',
            content: concept.commonMistake,
            caption: 'Error frecuente de principiantes',
            position: 3,
            createdAt: now,
            updatedAt: now,
          };
          await setDoc(doc(db, 'cms_blocks', blockMistakeId), blockMistake);
        }
      }

      // Quick challenge as activity block if exists
      if (topic.quickChallenge) {
        const challengeSectionId = `sec_${topic.id}_challenge`;
        const challengeSec: CmsSection = {
          id: challengeSectionId,
          lessonId: lessonId,
          title: 'Comprobación de Comprensión',
          position: topic.concepts.length,
          visible: true,
          createdAt: now,
          updatedAt: now,
        };
        await setDoc(doc(db, 'cms_sections', challengeSectionId), challengeSec);

        const challengeBlockId = `blk_${topic.id}_challenge`;
        const challengeBlock: CmsBlock = {
          id: challengeBlockId,
          sectionId: challengeSectionId,
          type: 'activity',
          content: topic.quickChallenge.question,
          activityConfig: JSON.stringify(topic.quickChallenge),
          position: 0,
          createdAt: now,
          updatedAt: now,
        };
        await setDoc(doc(db, 'cms_blocks', challengeBlockId), challengeBlock);
      }
    }

    // Seed default site texts
    for (const item of Object.values(DEFAULT_SITE_CONTENT)) {
      await setDoc(doc(db, 'cms_site_content', item.key), item);
    }

    console.info('✅ CMS database successfully seeded!');
    return { seeded: true, moduleCount: TOPICS_DATA.length };
  } catch (err) {
    console.warn('Seeding check had an issue (handled with fallback):', err);
    return { seeded: false, moduleCount: 0 };
  }
}

// ============================================================================
// 3. MODULES CRUD
// ============================================================================

export async function getCmsModules(includeUnpublished = false): Promise<CmsModule[]> {
  const path = 'cms_modules';
  let list: CmsModule[] = [];
  try {
    const q = query(collection(db, path));
    const snap = await getDocs(q);
    list = snap.docs.map((d) => d.data() as CmsModule);
  } catch (error) {
    console.warn('Notice reading cms_modules from Firestore:', error);
  }

  // Merge with local storage cache if available
  try {
    const cached = JSON.parse(localStorage.getItem('cms_modules_cache') || '{}');
    const cachedList = Object.values(cached) as CmsModule[];
    if (cachedList.length > 0) {
      const byId = new Map<string, CmsModule>();
      list.forEach((m) => byId.set(m.id, m));
      cachedList.forEach((m) => byId.set(m.id, m));
      list = Array.from(byId.values());
    }
  } catch {}

  // If still empty, synthesize from TOPICS_DATA
  if (list.length === 0) {
    list = TOPICS_DATA.map((t, idx) => ({
      id: `mod_${t.id}`,
      title: `Módulo 0${t.number}: ${t.title}`,
      description: t.summary,
      category: t.category,
      badge: t.badge,
      slug: t.id,
      position: idx,
      status: 'published',
      visible: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }

  const filtered = includeUnpublished
    ? list.filter((m) => m.status !== 'archived')
    : list.filter((m) => m.status === 'published' && m.visible);

  return filtered.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
}

export async function saveCmsModule(moduleData: CmsModule): Promise<void> {
  const path = `cms_modules/${moduleData.id}`;
  const updated = {
    ...moduleData,
    updatedAt: new Date().toISOString(),
  };

  // 1. Immediately cache locally
  try {
    const cached = JSON.parse(localStorage.getItem('cms_modules_cache') || '{}');
    cached[moduleData.id] = updated;
    localStorage.setItem('cms_modules_cache', JSON.stringify(cached));
  } catch {}

  // 2. Persist to Firestore
  try {
    await setDoc(doc(db, 'cms_modules', moduleData.id), updated, { merge: true });
  } catch (error) {
    console.warn('Notice saving module to Firestore (cached locally):', error);
  }
}

export async function deleteCmsModule(moduleId: string, hardDelete = false): Promise<void> {
  const path = `cms_modules/${moduleId}`;

  // 1. Update local cache
  try {
    const cached = JSON.parse(localStorage.getItem('cms_modules_cache') || '{}');
    if (hardDelete) {
      delete cached[moduleId];
    } else {
      if (cached[moduleId]) {
        cached[moduleId] = { ...cached[moduleId], status: 'archived', visible: false, updatedAt: new Date().toISOString() };
      } else {
        cached[moduleId] = { id: moduleId, status: 'archived', visible: false, updatedAt: new Date().toISOString() };
      }
    }
    localStorage.setItem('cms_modules_cache', JSON.stringify(cached));
  } catch {}

  // 2. Persist to Firestore
  try {
    if (hardDelete) {
      await deleteDoc(doc(db, 'cms_modules', moduleId));
    } else {
      await setDoc(
        doc(db, 'cms_modules', moduleId),
        { status: 'archived', visible: false, updatedAt: new Date().toISOString() },
        { merge: true }
      );
    }
  } catch (error) {
    console.warn('Notice deleting module in Firestore (cached locally):', error);
  }
}

export async function duplicateCmsModule(moduleId: string): Promise<CmsModule> {
  const path = `cms_modules/${moduleId}`;
  try {
    let original: CmsModule | null = null;
    const snap = await getDoc(doc(db, 'cms_modules', moduleId));
    if (snap.exists()) {
      original = snap.data() as CmsModule;
    } else {
      const cached = JSON.parse(localStorage.getItem('cms_modules_cache') || '{}');
      original = cached[moduleId] || null;
    }

    if (!original) {
      // Find from TOPICS_DATA
      const rawId = moduleId.replace(/^mod_/, '');
      const t = TOPICS_DATA.find((x) => x.id === rawId || `mod_${x.id}` === moduleId);
      if (t) {
        original = {
          id: moduleId,
          title: `Módulo 0${t.number}: ${t.title}`,
          description: t.summary,
          category: t.category,
          badge: t.badge,
          slug: t.id,
          position: 0,
          status: 'published',
          visible: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      } else {
        throw new Error('Módulo no encontrado');
      }
    }

    const newId = `mod_${Date.now()}`;
    const newModule: CmsModule = {
      ...original,
      id: newId,
      title: `${original.title} (Copia)`,
      status: 'draft',
      position: (original.position ?? 0) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveCmsModule(newModule);

    // Duplicate all lessons of this module
    const lessons = await getCmsLessons(moduleId, true);
    for (const les of lessons) {
      await duplicateCmsLesson(les.id, newId);
    }

    return newModule;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ============================================================================
// 4. LESSONS CRUD
// ============================================================================

export async function getCmsLessons(moduleId?: string, includeUnpublished = false): Promise<CmsLesson[]> {
  const path = 'cms_lessons';
  let list: CmsLesson[] = [];
  try {
    const snap = await getDocs(collection(db, path));
    list = snap.docs.map((d) => d.data() as CmsLesson);
  } catch (error) {
    console.warn('Notice reading cms_lessons from Firestore:', error);
  }

  // Merge with local storage cache
  try {
    const cached = JSON.parse(localStorage.getItem('cms_lessons_cache') || '{}');
    const cachedList = Object.values(cached) as CmsLesson[];
    if (cachedList.length > 0) {
      const byId = new Map<string, CmsLesson>();
      list.forEach((l) => byId.set(l.id, l));
      cachedList.forEach((l) => byId.set(l.id, l));
      list = Array.from(byId.values());
    }
  } catch {}

  // If still empty, build from TOPICS_DATA
  if (list.length === 0) {
    list = TOPICS_DATA.map((t, idx) => ({
      id: `les_${t.id}`,
      moduleId: `mod_${t.id}`,
      title: t.title,
      summary: t.summary,
      badge: t.badge,
      estimatedTime: t.estimatedTime,
      slug: t.id,
      position: idx,
      status: 'published',
      visible: true,
      hasInteractiveWorkshop: t.hasInteractiveWorkshop,
      workshopType:
        t.id === 'classes'
          ? 'classes'
          : t.id === 'object-arrays'
          ? 'object-arrays'
          : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }

  if (moduleId) {
    list = list.filter((l) => l.moduleId === moduleId);
  }

  const filtered = includeUnpublished
    ? list.filter((l) => l.status !== 'archived')
    : list.filter((l) => l.status === 'published' && l.visible);

  return filtered.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
}

export async function getCmsLessonById(lessonId: string): Promise<CmsLesson | null> {
  const path = `cms_lessons/${lessonId}`;
  try {
    const snap = await getDoc(doc(db, 'cms_lessons', lessonId));
    if (snap.exists()) return snap.data() as CmsLesson;
  } catch (error) {
    console.warn('Notice reading lesson by id:', error);
  }

  // Check cache
  try {
    const cached = JSON.parse(localStorage.getItem('cms_lessons_cache') || '{}');
    if (cached[lessonId]) return cached[lessonId];
  } catch {}

  // Check fallback
  const rawId = lessonId.replace(/^les_/, '');
  const t = TOPICS_DATA.find((x) => x.id === rawId || `les_${x.id}` === lessonId);
  if (t) {
    return {
      id: `les_${t.id}`,
      moduleId: `mod_${t.id}`,
      title: t.title,
      summary: t.summary,
      badge: t.badge,
      estimatedTime: t.estimatedTime,
      slug: t.id,
      position: 0,
      status: 'published',
      visible: true,
      hasInteractiveWorkshop: t.hasInteractiveWorkshop,
      workshopType:
        t.id === 'classes'
          ? 'classes'
          : t.id === 'object-arrays'
          ? 'object-arrays'
          : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  return null;
}

export async function saveCmsLesson(lessonData: CmsLesson): Promise<void> {
  const path = `cms_lessons/${lessonData.id}`;
  const updated = {
    ...lessonData,
    updatedAt: new Date().toISOString(),
  };

  try {
    const cached = JSON.parse(localStorage.getItem('cms_lessons_cache') || '{}');
    cached[lessonData.id] = updated;
    localStorage.setItem('cms_lessons_cache', JSON.stringify(cached));
  } catch {}

  try {
    await setDoc(doc(db, 'cms_lessons', lessonData.id), updated, { merge: true });
  } catch (error) {
    console.warn('Notice saving lesson to Firestore (cached locally):', error);
  }
}

export async function deleteCmsLesson(lessonId: string, hardDelete = false): Promise<void> {
  const path = `cms_lessons/${lessonId}`;
  try {
    const cached = JSON.parse(localStorage.getItem('cms_lessons_cache') || '{}');
    if (hardDelete) {
      delete cached[lessonId];
    } else {
      if (cached[lessonId]) {
        cached[lessonId] = { ...cached[lessonId], status: 'archived', visible: false, updatedAt: new Date().toISOString() };
      }
    }
    localStorage.setItem('cms_lessons_cache', JSON.stringify(cached));
  } catch {}

  try {
    if (hardDelete) {
      await deleteDoc(doc(db, 'cms_lessons', lessonId));
    } else {
      await setDoc(
        doc(db, 'cms_lessons', lessonId),
        { status: 'archived', visible: false, updatedAt: new Date().toISOString() },
        { merge: true }
      );
    }
  } catch (error) {
    console.warn('Notice deleting lesson in Firestore (cached locally):', error);
  }
}

export async function duplicateCmsLesson(lessonId: string, targetModuleId?: string): Promise<CmsLesson> {
  const path = `cms_lessons/${lessonId}`;
  try {
    const original = await getCmsLessonById(lessonId);
    if (!original) throw new Error('Lección no encontrada');

    const newId = `les_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newLesson: CmsLesson = {
      ...original,
      id: newId,
      moduleId: targetModuleId || original.moduleId,
      title: `${original.title} (Copia)`,
      status: 'draft',
      position: (original.position ?? 0) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveCmsLesson(newLesson);

    // Duplicate sections and blocks
    const sections = await getCmsSections(lessonId, true);
    for (const sec of sections) {
      await duplicateCmsSection(sec.id, newId);
    }

    return newLesson;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ============================================================================
// 5. SECTIONS CRUD
// ============================================================================

export async function getCmsSections(lessonId: string, includeInvisible = false): Promise<CmsSection[]> {
  const path = 'cms_sections';
  let list: CmsSection[] = [];
  try {
    const snap = await getDocs(collection(db, path));
    list = snap.docs
      .map((d) => d.data() as CmsSection)
      .filter((s) => s.lessonId === lessonId);
  } catch (error) {
    console.warn('Notice reading cms_sections from Firestore:', error);
  }

  // Merge with localStorage
  try {
    const cached = JSON.parse(localStorage.getItem('cms_sections_cache') || '{}');
    const cachedForLesson = (Object.values(cached) as CmsSection[]).filter((s) => s.lessonId === lessonId);
    if (cachedForLesson.length > 0) {
      const byId = new Map<string, CmsSection>();
      list.forEach((s) => byId.set(s.id, s));
      cachedForLesson.forEach((s) => byId.set(s.id, s));
      list = Array.from(byId.values());
    }
  } catch {}

  // If empty, synthesize from TOPICS_DATA concepts!
  if (list.length === 0) {
    const rawTopicId = lessonId.replace(/^les_/, '');
    const topic = TOPICS_DATA.find((t) => t.id === rawTopicId || `les_${t.id}` === lessonId);
    if (topic && topic.concepts) {
      list = topic.concepts.map((concept, cIdx) => ({
        id: `sec_${concept.id}`,
        lessonId: lessonId,
        title: concept.title,
        summary: concept.summary,
        position: cIdx,
        visible: true,
        didacticTip: concept.didacticTip,
        commonMistake: concept.commonMistake,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    }
  }

  if (!includeInvisible) {
    list = list.filter((s) => s.visible !== false);
  }

  return list.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
}

export async function saveCmsSection(sectionData: CmsSection): Promise<void> {
  const path = `cms_sections/${sectionData.id}`;
  const updated = {
    ...sectionData,
    updatedAt: new Date().toISOString(),
  };

  try {
    const cached = JSON.parse(localStorage.getItem('cms_sections_cache') || '{}');
    cached[sectionData.id] = updated;
    localStorage.setItem('cms_sections_cache', JSON.stringify(cached));
  } catch {}

  try {
    await setDoc(doc(db, 'cms_sections', sectionData.id), updated, { merge: true });
  } catch (error) {
    console.warn('Notice saving section to Firestore (cached locally):', error);
  }
}

export async function deleteCmsSection(sectionId: string): Promise<void> {
  const path = `cms_sections/${sectionId}`;
  try {
    const cached = JSON.parse(localStorage.getItem('cms_sections_cache') || '{}');
    delete cached[sectionId];
    localStorage.setItem('cms_sections_cache', JSON.stringify(cached));
  } catch {}

  try {
    await deleteDoc(doc(db, 'cms_sections', sectionId));
    // Also remove associated blocks
    const blocks = await getCmsBlocks(sectionId);
    for (const b of blocks) {
      await deleteDoc(doc(db, 'cms_blocks', b.id));
    }
  } catch (error) {
    console.warn('Notice deleting section from Firestore (cached locally):', error);
  }
}

export async function duplicateCmsSection(sectionId: string, targetLessonId?: string): Promise<CmsSection> {
  const path = `cms_sections/${sectionId}`;
  try {
    let original: CmsSection | null = null;
    const snap = await getDoc(doc(db, 'cms_sections', sectionId));
    if (snap.exists()) {
      original = snap.data() as CmsSection;
    } else {
      const cached = JSON.parse(localStorage.getItem('cms_sections_cache') || '{}');
      original = cached[sectionId] || null;
    }

    if (!original) {
      // Find concept
      const rawConceptId = sectionId.replace(/^sec_/, '');
      for (const topic of TOPICS_DATA) {
        const c = topic.concepts.find((x) => x.id === rawConceptId || `sec_${x.id}` === sectionId);
        if (c) {
          original = {
            id: sectionId,
            lessonId: targetLessonId || `les_${topic.id}`,
            title: c.title,
            summary: c.summary,
            position: 0,
            visible: true,
            didacticTip: c.didacticTip,
            commonMistake: c.commonMistake,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          break;
        }
      }
    }

    if (!original) throw new Error('Sección no encontrada');

    const newId = `sec_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newSection: CmsSection = {
      ...original,
      id: newId,
      lessonId: targetLessonId || original.lessonId,
      title: `${original.title} (Copia)`,
      position: (original.position ?? 0) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveCmsSection(newSection);

    // Duplicate blocks
    const blocks = await getCmsBlocks(sectionId);
    for (const blk of blocks) {
      await duplicateCmsBlock(blk.id, newId);
    }

    return newSection;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ============================================================================
// 6. CONTENT BLOCKS CRUD
// ============================================================================

export async function getCmsBlocks(sectionId: string): Promise<CmsBlock[]> {
  const path = 'cms_blocks';
  let list: CmsBlock[] = [];
  try {
    const snap = await getDocs(collection(db, path));
    list = snap.docs
      .map((d) => d.data() as CmsBlock)
      .filter((b) => b.sectionId === sectionId);
  } catch (error) {
    console.warn('Notice reading cms_blocks from Firestore:', error);
  }

  // Merge with localStorage
  try {
    const cached = JSON.parse(localStorage.getItem('cms_blocks_cache') || '{}');
    const cachedForSection = (Object.values(cached) as CmsBlock[]).filter((b) => b.sectionId === sectionId);
    if (cachedForSection.length > 0) {
      const byId = new Map<string, CmsBlock>();
      list.forEach((b) => byId.set(b.id, b));
      cachedForSection.forEach((b) => byId.set(b.id, b));
      list = Array.from(byId.values());
    }
  } catch {}

  // If empty, synthesize from TOPICS_DATA matching concept!
  if (list.length === 0) {
    const rawConceptId = sectionId.replace(/^sec_/, '');
    let matchedConcept = null;
    for (const topic of TOPICS_DATA) {
      const c = topic.concepts.find((x) => x.id === rawConceptId || `sec_${x.id}` === sectionId);
      if (c) {
        matchedConcept = c;
        break;
      }
    }
    if (matchedConcept) {
      let pos = 0;
      if (matchedConcept.explanation) {
        list.push({
          id: `blk_${matchedConcept.id}_text`,
          sectionId,
          type: 'rich-text',
          content: matchedConcept.explanation,
          position: pos++,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      if (matchedConcept.codeSnippet) {
        list.push({
          id: `blk_${matchedConcept.id}_code`,
          sectionId,
          type: 'code',
          content: matchedConcept.codeSnippet,
          caption: 'Código de ejemplo en Processing Java',
          position: pos++,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
  }

  return list.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
}

export async function saveCmsBlock(blockData: CmsBlock): Promise<void> {
  const path = `cms_blocks/${blockData.id}`;
  const updated = {
    ...blockData,
    updatedAt: new Date().toISOString(),
  };

  try {
    const cached = JSON.parse(localStorage.getItem('cms_blocks_cache') || '{}');
    cached[blockData.id] = updated;
    localStorage.setItem('cms_blocks_cache', JSON.stringify(cached));
  } catch {}

  try {
    await setDoc(doc(db, 'cms_blocks', blockData.id), updated, { merge: true });
  } catch (error) {
    console.warn('Notice saving block to Firestore (cached locally):', error);
  }
}

export async function deleteCmsBlock(blockId: string): Promise<void> {
  const path = `cms_blocks/${blockId}`;
  try {
    const cached = JSON.parse(localStorage.getItem('cms_blocks_cache') || '{}');
    delete cached[blockId];
    localStorage.setItem('cms_blocks_cache', JSON.stringify(cached));
  } catch {}

  try {
    await deleteDoc(doc(db, 'cms_blocks', blockId));
  } catch (error) {
    console.warn('Notice deleting block from Firestore (cached locally):', error);
  }
}

export async function duplicateCmsBlock(blockId: string, targetSectionId?: string): Promise<CmsBlock> {
  const path = `cms_blocks/${blockId}`;
  try {
    let original: CmsBlock | null = null;
    const snap = await getDoc(doc(db, 'cms_blocks', blockId));
    if (snap.exists()) {
      original = snap.data() as CmsBlock;
    } else {
      const cached = JSON.parse(localStorage.getItem('cms_blocks_cache') || '{}');
      original = cached[blockId] || null;
    }

    if (!original) throw new Error('Bloque no encontrado');

    const newId = `blk_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newBlock: CmsBlock = {
      ...original,
      id: newId,
      sectionId: targetSectionId || original.sectionId,
      position: (original.position ?? 0) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveCmsBlock(newBlock);
    return newBlock;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ============================================================================
// 7. ORDERING SYSTEM (DRAG & DROP OR BUTTONS)
// ============================================================================

export async function reorderCmsItems(
  collectionName: 'cms_modules' | 'cms_lessons' | 'cms_sections' | 'cms_blocks',
  orderedIds: string[]
): Promise<void> {
  try {
    const batch = writeBatch(db);
    orderedIds.forEach((id, index) => {
      const ref = doc(db, collectionName, id);
      batch.update(ref, { position: index, updatedAt: new Date().toISOString() });
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, collectionName);
  }
}

// ============================================================================
// 8. SITE GENERAL CONTENT (Textos Generales)
// ============================================================================

export async function getAllSiteContent(): Promise<Record<string, CmsSiteContent>> {
  const path = 'cms_site_content';
  const result: Record<string, CmsSiteContent> = { ...DEFAULT_SITE_CONTENT };

  // 1. Check local storage cache
  try {
    const cached = JSON.parse(localStorage.getItem('cms_site_content_cache') || '{}');
    Object.entries(cached).forEach(([k, item]) => {
      result[k] = {
        ...(result[k] || {}),
        ...(item as CmsSiteContent),
      };
    });
  } catch {}

  // 2. Fetch from Firestore
  try {
    const snap = await getDocs(collection(db, path));
    snap.docs.forEach((d) => {
      const item = d.data() as CmsSiteContent;
      result[item.key] = {
        ...(result[item.key] || {}),
        ...item,
      };
    });
  } catch (err) {
    console.warn('Notice loading site content from Firestore (using cache/defaults):', err);
  }

  return result;
}

export async function saveSiteContent(item: CmsSiteContent, userEmail?: string): Promise<void> {
  const path = `cms_site_content/${item.key}`;
  const updated: CmsSiteContent = {
    ...item,
    updatedAt: new Date().toISOString(),
    updatedBy: userEmail || auth.currentUser?.email || 'admin',
  };

  // 1. Save to local cache
  try {
    const cached = JSON.parse(localStorage.getItem('cms_site_content_cache') || '{}');
    cached[item.key] = updated;
    localStorage.setItem('cms_site_content_cache', JSON.stringify(cached));
  } catch {}

  // 2. Save to Firestore
  try {
    await setDoc(doc(db, 'cms_site_content', item.key), updated, { merge: true });
  } catch (error) {
    console.warn('Notice saving site content to Firestore (cached locally):', error);
  }
}

export function subscribeToSiteContent(
  callback: (content: CmsSiteContentCombined) => void
): () => void {
  const parseAndEmit = (sourceObj: Record<string, CmsSiteContent>) => {
    let heroHeadline = sourceObj.hero_headline?.content || DEFAULT_SITE_CONTENT.hero_headline.content;
    let heroSubtitle = sourceObj.hero_subtitle?.content || DEFAULT_SITE_CONTENT.hero_subtitle.content;
    let heroBadge = sourceObj.hero_badge?.content || DEFAULT_SITE_CONTENT.hero_badge.content;
    let generativeQuestion = sourceObj.generative_question?.content || DEFAULT_SITE_CONTENT.generative_question.content;
    let generativePrinciples = ['1. Código', '2. Sistema', '3. Regla', '4. Variación', '5. Forma'];
    let oopLabTitle = sourceObj.oop_lab_title?.content || DEFAULT_SITE_CONTENT.oop_lab_title.content;
    let oopLabSummary = sourceObj.oop_lab_summary?.content || DEFAULT_SITE_CONTENT.oop_lab_summary.content;
    let workshopTitle = sourceObj.workshop_title?.content || DEFAULT_SITE_CONTENT.workshop_title.content;
    let workshopSummary = sourceObj.workshop_summary?.content || DEFAULT_SITE_CONTENT.workshop_summary.content;
    let philosophyTitle = sourceObj.philosophy_title?.content || DEFAULT_SITE_CONTENT.philosophy_title.content;
    let footerText = sourceObj.footer_text?.content || DEFAULT_SITE_CONTENT.footer_text.content;

    if (sourceObj.generative_principles?.content) {
      const raw = sourceObj.generative_principles.content;
      try {
        if (raw.startsWith('[')) {
          generativePrinciples = JSON.parse(raw);
        } else {
          generativePrinciples = raw.split(',').map((s) => s.trim()).filter(Boolean);
        }
      } catch {
        generativePrinciples = raw.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }

    callback({
      heroHeadline,
      heroSubtitle,
      heroBadge,
      generativeQuestion,
      generativePrinciples,
      oopLabTitle,
      oopLabSummary,
      workshopTitle,
      workshopSummary,
      philosophyTitle,
      footerText,
    });
  };

  // Emit initial combined content from cache + defaults immediately
  try {
    getAllSiteContent().then((initial) => {
      parseAndEmit(initial);
    });
  } catch {}

  try {
    const unsub = onSnapshot(
      collection(db, 'cms_site_content'),
      (snap) => {
        const combined: Record<string, CmsSiteContent> = { ...DEFAULT_SITE_CONTENT };
        try {
          const cached = JSON.parse(localStorage.getItem('cms_site_content_cache') || '{}');
          Object.assign(combined, cached);
        } catch {}

        snap.docs.forEach((d) => {
          const data = d.data() as CmsSiteContent;
          combined[data.key] = data;
        });

        parseAndEmit(combined);
      },
      (err) => {
        console.warn('Site content subscription notice:', err);
      }
    );
    return unsub;
  } catch {
    return () => {};
  }
}

// ============================================================================
// 9. MEDIA ASSET RESOURCES
// ============================================================================

export async function getCmsMediaResources(): Promise<CmsMediaResource[]> {
  const path = 'cms_media';
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs
      .map((d) => d.data() as CmsMediaResource)
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  } catch {
    return [];
  }
}

export async function saveCmsMediaResource(resource: CmsMediaResource): Promise<void> {
  const path = `cms_media/${resource.id}`;
  try {
    await setDoc(doc(db, 'cms_media', resource.id), resource);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCmsMediaResource(mediaId: string): Promise<void> {
  const path = `cms_media/${mediaId}`;
  try {
    await deleteDoc(doc(db, 'cms_media', mediaId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ============================================================================
// 10. REVISIONS & FULL BACKUP EXPORT / IMPORT
// ============================================================================

export async function createCmsRevision(
  entityType: 'module' | 'lesson' | 'section' | 'full_backup',
  entityId: string,
  snapshot: unknown,
  note = 'Guardado editorial'
): Promise<CmsRevision> {
  const revId = `rev_${Date.now()}`;
  const rev: CmsRevision = {
    id: revId,
    entityType,
    entityId,
    snapshotJson: JSON.stringify(snapshot),
    note,
    createdBy: auth.currentUser?.email || 'admin',
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'cms_revisions', revId), rev);
  return rev;
}

export async function getCmsRevisions(entityId?: string): Promise<CmsRevision[]> {
  const path = 'cms_revisions';
  try {
    const snap = await getDocs(collection(db, path));
    let list = snap.docs.map((d) => d.data() as CmsRevision);
    if (entityId) {
      list = list.filter((r) => r.entityId === entityId);
    }
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

export async function exportCurriculumBackup(): Promise<CurriculumExportData> {
  const modules = await getCmsModules(true);
  const lessons = await getCmsLessons(undefined, true);
  const sectionsSnap = await getDocs(collection(db, 'cms_sections'));
  const sections = sectionsSnap.docs.map((d) => d.data() as CmsSection);
  const blocksSnap = await getDocs(collection(db, 'cms_blocks'));
  const blocks = blocksSnap.docs.map((d) => d.data() as CmsBlock);
  const siteContentObj = await getAllSiteContent();
  const media = await getCmsMediaResources();

  const backup: CurriculumExportData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    exportedBy: auth.currentUser?.email || 'admin@codigocreativo.edu',
    modules,
    lessons,
    sections,
    blocks,
    siteContent: Object.values(siteContentObj),
    media,
  };

  // Record a full backup revision
  await createCmsRevision('full_backup', 'curriculum', backup, 'Exportación de respaldo general');

  return backup;
}

export async function importCurriculumBackup(backup: CurriculumExportData): Promise<void> {
  if (!backup || !backup.modules || !backup.lessons) {
    throw new Error('El archivo no contiene un formato de respaldo válido de Código Creativo');
  }

  // Create a rollback point before overwriting
  const currentBackup = await exportCurriculumBackup();
  await createCmsRevision('full_backup', 'pre_import', currentBackup, 'Punto de restauración previo a importación');

  // Import modules
  for (const mod of backup.modules) {
    await setDoc(doc(db, 'cms_modules', mod.id), mod);
  }
  // Import lessons
  for (const les of backup.lessons) {
    await setDoc(doc(db, 'cms_lessons', les.id), les);
  }
  // Import sections
  if (backup.sections) {
    for (const sec of backup.sections) {
      await setDoc(doc(db, 'cms_sections', sec.id), sec);
    }
  }
  // Import blocks
  if (backup.blocks) {
    for (const blk of backup.blocks) {
      await setDoc(doc(db, 'cms_blocks', blk.id), blk);
    }
  }
  // Import site texts
  if (backup.siteContent) {
    for (const item of backup.siteContent) {
      await setDoc(doc(db, 'cms_site_content', item.key), item);
    }
  }
  // Import media
  if (backup.media) {
    for (const m of backup.media) {
      await setDoc(doc(db, 'cms_media', m.id), m);
    }
  }
}

// ============================================================================
// 11. DYNAMIC TOPIC ADAPTER (READ CMS EDITS IN STUDENT VIEWS)
// ============================================================================

export async function getTopicFromCmsOrFallback(
  topicId: string,
  includeUnpublished = false
): Promise<TopicItem> {
  const fallback = TOPICS_DATA.find((t) => t.id === topicId) || TOPICS_DATA[0];
  try {
    const lessonIdCandidates = [`les_${topicId}`, topicId];
    let lesson: CmsLesson | null = null;
    let foundLessonId = '';

    for (const cand of lessonIdCandidates) {
      const snap = await getDoc(doc(db, 'cms_lessons', cand));
      if (snap.exists()) {
        lesson = snap.data() as CmsLesson;
        foundLessonId = cand;
        break;
      }
    }

    if (!lesson) {
      return fallback;
    }

    // Check visibility / status if not previewing
    if (!includeUnpublished && (lesson.status !== 'published' || !lesson.visible)) {
      return fallback;
    }

    const sections = await getCmsSections(foundLessonId, includeUnpublished);
    if (!sections || sections.length === 0) {
      return {
        ...fallback,
        title: lesson.title || fallback.title,
        summary: lesson.summary || fallback.summary,
        badge: lesson.badge || fallback.badge,
        estimatedTime: lesson.estimatedTime || fallback.estimatedTime,
      };
    }

    const concepts: TopicConcept[] = [];
    let quickChallenge = fallback.quickChallenge;

    for (const sec of sections) {
      const blocks = await getCmsBlocks(sec.id);
      const textBlock = blocks.find((b) => b.type === 'rich-text');
      const codeBlock = blocks.find((b) => b.type === 'code');
      const tipBlock = blocks.find((b) => b.type === 'callout' && (b.calloutType === 'tip' || b.calloutType === 'info'));
      const mistakeBlock = blocks.find((b) => b.type === 'callout' && b.calloutType === 'warning');
      const activityBlock = blocks.find((b) => b.type === 'activity');

      if (activityBlock && activityBlock.activityConfig) {
        try {
          quickChallenge = JSON.parse(activityBlock.activityConfig);
        } catch {
          // ignore
        }
      }

      concepts.push({
        id: sec.id.replace('sec_', ''),
        title: sec.title,
        summary: sec.summary || '',
        explanation: textBlock ? textBlock.content : (sec.summary || ''),
        codeSnippet: codeBlock ? codeBlock.content : '',
        didacticTip: sec.didacticTip || (tipBlock ? tipBlock.content : ''),
        commonMistake: sec.commonMistake || (mistakeBlock ? mistakeBlock.content : undefined),
      });
    }

    return {
      ...fallback,
      title: lesson.title || fallback.title,
      summary: lesson.summary || fallback.summary,
      badge: lesson.badge || fallback.badge,
      estimatedTime: lesson.estimatedTime || fallback.estimatedTime,
      conceptsCount: concepts.length,
      concepts: concepts.length > 0 ? concepts : fallback.concepts,
      quickChallenge,
    };
  } catch (err) {
    console.warn('Notice loading dynamic CMS topic (using fallback):', err);
    return fallback;
  }
}

export async function getAllTopicsFromCmsOrFallback(
  includeUnpublished = false
): Promise<TopicItem[]> {
  try {
    const modules = await getCmsModules(includeUnpublished);
    if (!modules || modules.length === 0) {
      return TOPICS_DATA;
    }

    const result: TopicItem[] = [];
    for (const mod of modules) {
      const rawId = mod.slug || mod.id.replace(/^mod_/, '');
      const staticTopic = TOPICS_DATA.find((t) => t.id === rawId || `mod_${t.id}` === mod.id);

      if (staticTopic) {
        const dynamicTopic = await getTopicFromCmsOrFallback(staticTopic.id, includeUnpublished);
        result.push({
          ...dynamicTopic,
          title: mod.title.replace(/^Módulo \d+:\s*/, '') || dynamicTopic.title,
          summary: mod.description || dynamicTopic.summary,
          category: (mod.category as TopicItem['category']) || dynamicTopic.category,
          badge: mod.badge || dynamicTopic.badge,
        });
      } else {
        // Custom created module
        const lessons = await getCmsLessons(mod.id, includeUnpublished);
        const mainLesson = lessons[0];
        result.push({
          id: rawId,
          number: (mod.position ?? result.length) + 1,
          title: mod.title.replace(/^Módulo \d+:\s*/, '') || mod.title,
          summary: mod.description || '',
          category: (mod.category as TopicItem['category']) || 'Fundamentos',
          badge: mod.badge || 'Módulo',
          estimatedTime: mainLesson?.estimatedTime || '30 min',
          conceptsCount: 1,
          concepts: [],
          hasInteractiveWorkshop: false,
        });
      }
    }
    return result;
  } catch {
    return TOPICS_DATA;
  }
}
