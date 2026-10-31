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
import { TOPICS_DATA } from '../data/topicsData';

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
  hero_title: {
    key: 'hero_title',
    title: 'Título del Encabezado Principal',
    section: 'portada',
    content: 'Código Creativo | Processing Java',
    updatedAt: new Date().toISOString(),
  },
  hero_subtitle: {
    key: 'hero_subtitle',
    title: 'Subtítulo del Banner',
    section: 'portada',
    content: 'Laboratorio de programación visual, algoritmos generativos y diseño computacional interactivo.',
    updatedAt: new Date().toISOString(),
  },
  hero_intro: {
    key: 'hero_intro',
    title: 'Texto Introductorio',
    section: 'portada',
    content: 'Explora los fundamentos del dibujo algorítmico, domina la Programación Orientada a Objetos y diseña sistemas vivos con Processing Java.',
    updatedAt: new Date().toISOString(),
  },
  footer_text: {
    key: 'footer_text',
    title: 'Pie de Página',
    section: 'footer',
    content: 'Código Creativo / CENTRO / Processing Java 4.3',
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
  try {
    const q = query(collection(db, path));
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => d.data() as CmsModule);

    const filtered = includeUnpublished
      ? list.filter((m) => m.status !== 'archived')
      : list.filter((m) => m.status === 'published' && m.visible);

    return filtered.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveCmsModule(moduleData: CmsModule): Promise<void> {
  const path = `cms_modules/${moduleData.id}`;
  try {
    const updated = {
      ...moduleData,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'cms_modules', moduleData.id), updated, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCmsModule(moduleId: string, hardDelete = false): Promise<void> {
  const path = `cms_modules/${moduleId}`;
  try {
    if (hardDelete) {
      await deleteDoc(doc(db, 'cms_modules', moduleId));
    } else {
      // Logical archive
      await setDoc(
        doc(db, 'cms_modules', moduleId),
        { status: 'archived', visible: false, updatedAt: new Date().toISOString() },
        { merge: true }
      );
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function duplicateCmsModule(moduleId: string): Promise<CmsModule> {
  const path = `cms_modules/${moduleId}`;
  try {
    const snap = await getDoc(doc(db, 'cms_modules', moduleId));
    if (!snap.exists()) throw new Error('Módulo no encontrado');
    const original = snap.data() as CmsModule;

    const newId = `mod_${Date.now()}`;
    const newModule: CmsModule = {
      ...original,
      id: newId,
      title: `${original.title} (Copia)`,
      status: 'draft',
      position: original.position + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'cms_modules', newId), newModule);

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
  try {
    const snap = await getDocs(collection(db, path));
    let list = snap.docs.map((d) => d.data() as CmsLesson);

    if (moduleId) {
      list = list.filter((l) => l.moduleId === moduleId);
    }

    const filtered = includeUnpublished
      ? list.filter((l) => l.status !== 'archived')
      : list.filter((l) => l.status === 'published' && l.visible);

    return filtered.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function getCmsLessonById(lessonId: string): Promise<CmsLesson | null> {
  const path = `cms_lessons/${lessonId}`;
  try {
    const snap = await getDoc(doc(db, 'cms_lessons', lessonId));
    if (!snap.exists()) return null;
    return snap.data() as CmsLesson;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveCmsLesson(lessonData: CmsLesson): Promise<void> {
  const path = `cms_lessons/${lessonData.id}`;
  try {
    const updated = {
      ...lessonData,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'cms_lessons', lessonData.id), updated, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCmsLesson(lessonId: string, hardDelete = false): Promise<void> {
  const path = `cms_lessons/${lessonId}`;
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
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function duplicateCmsLesson(lessonId: string, targetModuleId?: string): Promise<CmsLesson> {
  const path = `cms_lessons/${lessonId}`;
  try {
    const snap = await getDoc(doc(db, 'cms_lessons', lessonId));
    if (!snap.exists()) throw new Error('Lección no encontrada');
    const original = snap.data() as CmsLesson;

    const newId = `les_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newLesson: CmsLesson = {
      ...original,
      id: newId,
      moduleId: targetModuleId || original.moduleId,
      title: `${original.title} (Copia)`,
      status: 'draft',
      position: original.position + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'cms_lessons', newId), newLesson);

    // Duplicate all sections of this lesson
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
  try {
    const snap = await getDocs(collection(db, path));
    let list = snap.docs
      .map((d) => d.data() as CmsSection)
      .filter((s) => s.lessonId === lessonId);

    if (!includeInvisible) {
      list = list.filter((s) => s.visible !== false);
    }

    return list.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveCmsSection(sectionData: CmsSection): Promise<void> {
  const path = `cms_sections/${sectionData.id}`;
  try {
    const updated = {
      ...sectionData,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'cms_sections', sectionData.id), updated, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCmsSection(sectionId: string): Promise<void> {
  const path = `cms_sections/${sectionId}`;
  try {
    await deleteDoc(doc(db, 'cms_sections', sectionId));
    // Also remove associated blocks
    const blocks = await getCmsBlocks(sectionId);
    for (const b of blocks) {
      await deleteDoc(doc(db, 'cms_blocks', b.id));
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function duplicateCmsSection(sectionId: string, targetLessonId?: string): Promise<CmsSection> {
  const path = `cms_sections/${sectionId}`;
  try {
    const snap = await getDoc(doc(db, 'cms_sections', sectionId));
    if (!snap.exists()) throw new Error('Sección no encontrada');
    const original = snap.data() as CmsSection;

    const newId = `sec_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newSection: CmsSection = {
      ...original,
      id: newId,
      lessonId: targetLessonId || original.lessonId,
      title: `${original.title} (Copia)`,
      position: original.position + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'cms_sections', newId), newSection);

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
  try {
    const snap = await getDocs(collection(db, path));
    const list = snap.docs
      .map((d) => d.data() as CmsBlock)
      .filter((b) => b.sectionId === sectionId);

    return list.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveCmsBlock(blockData: CmsBlock): Promise<void> {
  const path = `cms_blocks/${blockData.id}`;
  try {
    const updated = {
      ...blockData,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'cms_blocks', blockData.id), updated, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCmsBlock(blockId: string): Promise<void> {
  const path = `cms_blocks/${blockId}`;
  try {
    await deleteDoc(doc(db, 'cms_blocks', blockId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function duplicateCmsBlock(blockId: string, targetSectionId?: string): Promise<CmsBlock> {
  const path = `cms_blocks/${blockId}`;
  try {
    const snap = await getDoc(doc(db, 'cms_blocks', blockId));
    if (!snap.exists()) throw new Error('Bloque no encontrado');
    const original = snap.data() as CmsBlock;

    const newId = `blk_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newBlock: CmsBlock = {
      ...original,
      id: newId,
      sectionId: targetSectionId || original.sectionId,
      position: original.position + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'cms_blocks', newId), newBlock);
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
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) {
      return DEFAULT_SITE_CONTENT;
    }
    const result: Record<string, CmsSiteContent> = { ...DEFAULT_SITE_CONTENT };
    snap.docs.forEach((d) => {
      const item = d.data() as CmsSiteContent;
      result[item.key] = item;
    });
    return result;
  } catch {
    return DEFAULT_SITE_CONTENT;
  }
}

export async function saveSiteContent(item: CmsSiteContent, userEmail?: string): Promise<void> {
  const path = `cms_site_content/${item.key}`;
  try {
    const updated: CmsSiteContent = {
      ...item,
      updatedAt: new Date().toISOString(),
      updatedBy: userEmail || auth.currentUser?.email || 'admin',
    };
    await setDoc(doc(db, 'cms_site_content', item.key), updated, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeToSiteContent(
  callback: (content: CmsSiteContentCombined) => void
): () => void {
  try {
    const unsub = onSnapshot(
      collection(db, 'cms_site_content'),
      (snap) => {
        let heroHeadline = 'Aprende a programar creando arte y sistemas visuales.';
        let heroSubtitle =
          'Descubre la programación como una herramienta para dar vida a formas, animaciones y patrones visuales. En cada paso escribes código en Processing Java y ves su resultado interactivo de inmediato.';
        let footerText =
          'Inspirado en los principios de Generative Design, este laboratorio aborda la programación como un medio artístico y constructivo. La riqueza visual no surge del adorno superficial, sino de la combinación disciplinada de reglas matemáticas sencillas: iteración, modulación senoidal, ruido Perlin y la arquitectura orientada a objetos de Processing.';
        let generativePrinciples = ['1. Código', '2. Sistema', '3. Regla', '4. Variación', '5. Forma'];

        snap.docs.forEach((d) => {
          const data = d.data() as CmsSiteContent;
          if (data.key === 'hero_headline' && data.content) heroHeadline = data.content;
          if (data.key === 'hero_subtitle' && data.content) heroSubtitle = data.content;
          if (data.key === 'footer_text' && data.content) footerText = data.content;
          if (data.key === 'generative_principles' && data.content) {
            try {
              generativePrinciples = JSON.parse(data.content);
            } catch {
              // fallback
            }
          }
        });

        callback({
          heroHeadline,
          heroSubtitle,
          footerText,
          generativePrinciples,
        });
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
    exportedBy: auth.currentUser?.email || 'admin@centro.edu.mx',
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
