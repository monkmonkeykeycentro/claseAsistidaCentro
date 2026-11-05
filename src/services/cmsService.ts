import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
  onSnapshot,
} from 'firebase/firestore';
import { db, requireCmsAdmin } from './firebase';
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
 * Initialize static curriculum once, adding missing legacy documents and
 * preserving existing editorial content. Only administrators can initialize.
 */
export async function seedCmsFromExistingContentIfEmpty(): Promise<{
  seeded: boolean;
  moduleCount: number;
}> {
  await requireCmsAdmin();
  const path = 'cms_modules';
  try {
    const snap = await getDocs(collection(db, path));
    const initialized = await getDoc(doc(db, 'cms_site_content', 'curriculum_initialized'));
    if (initialized.exists()) return { seeded: false, moduleCount: snap.size };
    // Repair legacy partial initialization without overwriting authored documents.
    const existing = new Set(snap.docs.map((document) => `cms_modules/${document.id}`));
    const collections = ['cms_lessons', 'cms_sections', 'cms_blocks', 'cms_site_content'];
    const snapshots = await Promise.all(collections.map((name) => getDocs(collection(db, name))));
    snapshots.forEach((snapshot, index) => snapshot.docs.forEach((document) => existing.add(`${collections[index]}/${document.id}`)));

    console.info('🌱 Initializing CMS database from existing curriculum...');
    const now = new Date().toISOString();
    const batch = writeBatch(db);
    const seedDocument = (name: string, id: string, data: object) => {
      if (!existing.has(`${name}/${id}`)) batch.set(doc(db, name, id), cleanDocument(data));
    };

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
      seedDocument('cms_modules', moduleId, moduleDoc);

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
      seedDocument('cms_lessons', lessonId, lessonDoc);

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
        seedDocument('cms_sections', sectionId, sectionDoc);

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
        seedDocument('cms_blocks', blockTextId, blockText);

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
          seedDocument('cms_blocks', blockCodeId, blockCode);
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
          seedDocument('cms_blocks', blockTipId, blockTip);
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
          seedDocument('cms_blocks', blockMistakeId, blockMistake);
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
        seedDocument('cms_sections', challengeSectionId, challengeSec);

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
        seedDocument('cms_blocks', challengeBlockId, challengeBlock);
      }
    }

    // Seed default site texts
    for (const item of Object.values(DEFAULT_SITE_CONTENT)) {
      seedDocument('cms_site_content', item.key, item);
    }

    batch.set(doc(db, 'cms_site_content', 'curriculum_initialized'), { initialized: true });
    await batch.commit();
    console.info('✅ CMS database successfully seeded!');
    return { seeded: true, moduleCount: TOPICS_DATA.length };
  } catch (err) {
    console.error('No se pudo inicializar el CMS:', err);
    throw new Error('No se pudo inicializar el CMS en Firebase.', { cause: err });
  }
}

// Firestore is the only source of editorial data. Legacy local edits must never
// override published data or turn a rejected write into a successful save.
function cleanDocument<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

async function readCollection<T>(name: string, constraints: ReturnType<typeof where>[] = []): Promise<T[]> {
  const snapshot = await getDocs(query(collection(db, name), ...constraints));
  return snapshot.docs.map((document) => ({ ...document.data(), id: document.id }) as T);
}

async function persist(name: string, id: string, data: object): Promise<void> {
  await requireCmsAdmin();
  await setDoc(doc(db, name, id), cleanDocument(data), { merge: true });
}

const published = () => [where('status', '==', 'published'), where('visible', '==', true)];
const byPosition = <T extends { position: number }>(list: T[]) => list.sort((a, b) => a.position - b.position);

export async function getCmsModules(includeUnpublished = false): Promise<CmsModule[]> {
  if (includeUnpublished) await requireCmsAdmin();
  const list = await readCollection<CmsModule>('cms_modules', includeUnpublished ? [] : published());
  return byPosition(list.filter((item) => item.status !== 'archived'));
}

export async function getCmsLessons(moduleId?: string, includeUnpublished = false): Promise<CmsLesson[]> {
  if (includeUnpublished) await requireCmsAdmin();
  if (!includeUnpublished && !moduleId) {
    const modules = await getCmsModules();
    return (await Promise.all(modules.map((module) => getCmsLessons(module.id)))).flat();
  }
  const constraints = includeUnpublished ? [] : published();
  if (moduleId) constraints.push(where('moduleId', '==', moduleId));
  const list = await readCollection<CmsLesson>('cms_lessons', constraints);
  return byPosition(list.filter((item) => item.status !== 'archived'));
}

export async function getCmsLessonById(lessonId: string): Promise<CmsLesson | null> {
  const snapshot = await getDoc(doc(db, 'cms_lessons', lessonId));
  return snapshot.exists() ? { ...snapshot.data(), id: snapshot.id } as CmsLesson : null;
}

export async function saveCmsModule(data: CmsModule): Promise<void> {
  if (!data.title.trim()) throw new Error('El módulo necesita un título.');
  await persist('cms_modules', data.id, { ...data, updatedAt: new Date().toISOString() });
}

export async function saveCmsLesson(data: CmsLesson): Promise<void> {
  if (!data.title.trim() || !data.moduleId) throw new Error('La lección necesita un título y un módulo.');
  await persist('cms_lessons', data.id, { ...data, updatedAt: new Date().toISOString() });
}

export async function deleteCmsModule(id: string, hardDelete = false): Promise<void> {
  await requireCmsAdmin();
  if (hardDelete) await deleteDoc(doc(db, 'cms_modules', id));
  else await persist('cms_modules', id, { status: 'archived', visible: false, updatedAt: new Date().toISOString() });
}

export async function deleteCmsLesson(id: string, hardDelete = false): Promise<void> {
  await requireCmsAdmin();
  if (hardDelete) await deleteDoc(doc(db, 'cms_lessons', id));
  else await persist('cms_lessons', id, { status: 'archived', visible: false, updatedAt: new Date().toISOString() });
}

function copyData<T extends { id: string; createdAt: string; updatedAt: string }>(data: T, prefix: string): T {
  return { ...data, id: `${prefix}_${crypto.randomUUID()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
}

export async function duplicateCmsModule(moduleId: string): Promise<CmsModule> {
  await requireCmsAdmin();
  const snapshot = await getDoc(doc(db, 'cms_modules', moduleId));
  if (!snapshot.exists()) throw new Error('Módulo no encontrado.');
  const original = snapshot.data() as CmsModule;
  const copy = { ...copyData(original, 'mod'), title: `${original.title} (Copia)`, status: 'draft' as const };
  await saveCmsModule(copy);
  for (const lesson of await getCmsLessons(moduleId, true)) await duplicateCmsLesson(lesson.id, copy.id);
  return copy;
}

export async function duplicateCmsLesson(lessonId: string, targetModuleId?: string): Promise<CmsLesson> {
  await requireCmsAdmin();
  const original = await getCmsLessonById(lessonId);
  if (!original) throw new Error('Lección no encontrada.');
  const copy = { ...copyData(original, 'les'), moduleId: targetModuleId || original.moduleId, title: `${original.title} (Copia)`, status: 'draft' as const };
  await saveCmsLesson(copy);
  for (const section of await getCmsSections(lessonId, true)) await duplicateCmsSection(section.id, copy.id);
  return copy;
}

export async function getCmsSections(lessonId: string, includeInvisible = false): Promise<CmsSection[]> {
  if (includeInvisible) await requireCmsAdmin();
  const constraints = [where('lessonId', '==', lessonId)];
  if (!includeInvisible) constraints.push(where('visible', '==', true));
  return byPosition(await readCollection<CmsSection>('cms_sections', constraints));
}

export async function saveCmsSection(data: CmsSection): Promise<void> {
  await persist('cms_sections', data.id, { ...data, updatedAt: new Date().toISOString() });
}

export async function deleteCmsSection(id: string): Promise<void> {
  await requireCmsAdmin();
  const blocks = await getCmsBlocks(id);
  const batch = writeBatch(db);
  blocks.forEach((block) => batch.delete(doc(db, 'cms_blocks', block.id)));
  batch.delete(doc(db, 'cms_sections', id));
  await batch.commit();
}

export async function duplicateCmsSection(sectionId: string, targetLessonId?: string): Promise<CmsSection> {
  await requireCmsAdmin();
  const snapshot = await getDoc(doc(db, 'cms_sections', sectionId));
  if (!snapshot.exists()) throw new Error('Sección no encontrada.');
  const original = snapshot.data() as CmsSection;
  const copy = { ...copyData(original, 'sec'), lessonId: targetLessonId || original.lessonId };
  await saveCmsSection(copy);
  for (const block of await getCmsBlocks(sectionId)) await duplicateCmsBlock(block.id, copy.id);
  return copy;
}

export async function getCmsBlocks(sectionId: string): Promise<CmsBlock[]> {
  return byPosition(await readCollection<CmsBlock>('cms_blocks', [where('sectionId', '==', sectionId)]));
}

export async function saveCmsBlock(data: CmsBlock): Promise<void> {
  await persist('cms_blocks', data.id, { ...data, updatedAt: new Date().toISOString() });
}

export async function deleteCmsBlock(id: string): Promise<void> {
  await requireCmsAdmin();
  await deleteDoc(doc(db, 'cms_blocks', id));
}

export async function duplicateCmsBlock(blockId: string, targetSectionId?: string): Promise<CmsBlock> {
  await requireCmsAdmin();
  const snapshot = await getDoc(doc(db, 'cms_blocks', blockId));
  if (!snapshot.exists()) throw new Error('Bloque no encontrado.');
  const original = snapshot.data() as CmsBlock;
  const copy = { ...copyData(original, 'blk'), sectionId: targetSectionId || original.sectionId };
  await saveCmsBlock(copy);
  return copy;
}

export async function saveCmsLessonContent(lesson: CmsLesson, sections: CmsSection[], blocks: Record<string, CmsBlock[]>): Promise<void> {
  await requireCmsAdmin();
  if (!lesson.title.trim()) throw new Error('La lección necesita un título.');
  const batch = writeBatch(db);
  batch.set(doc(db, 'cms_lessons', lesson.id), cleanDocument(lesson));
  for (const section of sections) {
    batch.set(doc(db, 'cms_sections', section.id), cleanDocument(section));
    for (const block of blocks[section.id] || []) batch.set(doc(db, 'cms_blocks', block.id), cleanDocument(block));
  }
  await batch.commit();
}

export async function reorderCmsItems(collectionName: 'cms_modules' | 'cms_lessons' | 'cms_sections' | 'cms_blocks', orderedIds: string[]): Promise<void> {
  await requireCmsAdmin();
  const batch = writeBatch(db);
  orderedIds.forEach((id, position) => batch.update(doc(db, collectionName, id), { position, updatedAt: new Date().toISOString() }));
  await batch.commit();
}

export async function getAllSiteContent(): Promise<Record<string, CmsSiteContent>> {
  const result = { ...DEFAULT_SITE_CONTENT };
  const snapshot = await getDocs(collection(db, 'cms_site_content'));
  snapshot.docs.forEach((document) => { if (document.id !== 'curriculum_initialized') result[document.id] = document.data() as CmsSiteContent; });
  return result;
}

export async function saveSiteContent(item: CmsSiteContent, _userEmail?: string): Promise<void> {
  const user = await requireCmsAdmin();
  await persist('cms_site_content', item.key, { ...item, updatedAt: new Date().toISOString(), updatedBy: user.email });
}

export function subscribeToSiteContent(callback: (content: CmsSiteContentCombined) => void): () => void {
  const emit = (source: Record<string, CmsSiteContent>) => {
    const content = (key: string) => (source[key] ?? DEFAULT_SITE_CONTENT[key]).content;
    let principles = content('generative_principles').split(',').map((item) => item.trim()).filter(Boolean);
    try {
      const parsed = JSON.parse(content('generative_principles'));
      if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) principles = parsed;
    } catch { /* The default format is comma-separated text. */ }
    callback({
      heroHeadline: content('hero_headline'), heroSubtitle: content('hero_subtitle'), heroBadge: content('hero_badge'),
      generativeQuestion: content('generative_question'), generativePrinciples: principles,
      oopLabTitle: content('oop_lab_title'), oopLabSummary: content('oop_lab_summary'),
      workshopTitle: content('workshop_title'), workshopSummary: content('workshop_summary'),
      philosophyTitle: content('philosophy_title'), footerText: content('footer_text'),
    });
  };
  emit(DEFAULT_SITE_CONTENT);
  return onSnapshot(collection(db, 'cms_site_content'), (snapshot) => {
    const source: Record<string, CmsSiteContent> = {};
    snapshot.docs.forEach((document) => { source[document.id] = document.data() as CmsSiteContent; });
    emit(source);
  }, (error) => console.warn('No se pudieron cargar los textos del sitio:', error));
}

export async function getCmsMediaResources(): Promise<CmsMediaResource[]> {
  return (await readCollection<CmsMediaResource>('cms_media')).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export async function saveCmsMediaResource(data: CmsMediaResource): Promise<void> {
  await persist('cms_media', data.id, data);
}
export async function deleteCmsMediaResource(id: string): Promise<void> {
  await requireCmsAdmin();
  await deleteDoc(doc(db, 'cms_media', id));
}
export async function createCmsRevision(entityType: CmsRevision['entityType'], entityId: string, snapshot: unknown, note = 'Guardado editorial'): Promise<CmsRevision> {
  const user = await requireCmsAdmin();
  const revision: CmsRevision = {
    id: `rev_${crypto.randomUUID()}`, entityType, entityId, snapshotJson: JSON.stringify(snapshot),
    note, createdBy: user.email || user.uid, createdAt: new Date().toISOString(),
  };
  await persist('cms_revisions', revision.id, revision);
  return revision;
}
export async function getCmsRevisions(entityId?: string): Promise<CmsRevision[]> {
  await requireCmsAdmin();
  return (await readCollection<CmsRevision>('cms_revisions'))
    .filter((item) => !entityId || item.entityId === entityId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export async function exportCurriculumBackup(): Promise<CurriculumExportData> {
  const user = await requireCmsAdmin();
  const [modules, lessons, sections, blocks, siteContent, media] = await Promise.all([
    readCollection<CmsModule>('cms_modules'), readCollection<CmsLesson>('cms_lessons'),
    readCollection<CmsSection>('cms_sections'), readCollection<CmsBlock>('cms_blocks'),
    getAllSiteContent(), getCmsMediaResources(),
  ]);
  const backup = { version: '1.0.0', exportedAt: new Date().toISOString(), exportedBy: user.email || user.uid,
    modules, lessons, sections, blocks, siteContent: Object.values(siteContent), media };
  await createCmsRevision('full_backup', 'curriculum', backup, 'Exportación de respaldo general');
  return backup;
}
export async function importCurriculumBackup(backup: CurriculumExportData): Promise<void> {
  await requireCmsAdmin();
  if (!backup || !Array.isArray(backup.modules) || !Array.isArray(backup.lessons)) throw new Error('Respaldo no válido.');
  await exportCurriculumBackup();
  const groups: [string, { id?: string; key?: string }[]][] = [
    ['cms_modules', backup.modules], ['cms_lessons', backup.lessons], ['cms_sections', backup.sections || []],
    ['cms_blocks', backup.blocks || []], ['cms_site_content', backup.siteContent || []], ['cms_media', backup.media || []],
  ];
  for (const [name, items] of groups) {
    for (const item of items) await persist(name, (name === 'cms_site_content' ? item.key : item.id)!, item);
  }
}

async function lessonToTopic(lesson: CmsLesson, module: CmsModule, preview: boolean): Promise<TopicItem> {
  const original = TOPICS_DATA.find((topic) => `les_${topic.id}` === lesson.id);
  const sections = await getCmsSections(lesson.id, preview);
  let quickChallenge = original?.quickChallenge;
  const concepts: TopicConcept[] = await Promise.all(sections.map(async (section) => {
    const blocks = await getCmsBlocks(section.id);
    const activity = blocks.find((block) => block.type === 'activity' && block.activityConfig);
    if (activity) {
      try { quickChallenge = JSON.parse(activity.activityConfig!); } catch { /* Plain text activity. */ }
    }
    return {
      id: section.id, title: section.title, summary: section.summary || '',
      explanation: blocks.filter((block) => block.type === 'rich-text').map((block) => block.content).join('\n\n'),
      codeSnippet: blocks.find((block) => block.type === 'code')?.content || '',
      didacticTip: section.didacticTip || '', commonMistake: section.commonMistake, blocks,
    };
  }));
  return {
    id: original?.id || lesson.id, number: module.position + 1, title: lesson.title, summary: lesson.summary,
    category: module.category as TopicItem['category'], badge: lesson.badge || module.badge || '',
    estimatedTime: lesson.estimatedTime || '20 min', conceptsCount: concepts.length, concepts,
    hasInteractiveWorkshop: original?.hasInteractiveWorkshop || false, quickChallenge,
  };
}

export async function getAllTopicsFromCmsOrFallback(includeUnpublished = false): Promise<TopicItem[]> {
  try {
    const modules = await getCmsModules(includeUnpublished);
    if (modules.length === 0) {
      // Empty published results may mean everything was deliberately hidden.
      const initialized = await getDoc(doc(db, 'cms_site_content', 'curriculum_initialized'));
      return initialized.exists() ? [] : TOPICS_DATA;
    }
    const groups = await Promise.all(modules.map(async (module) => {
      const lessons = await getCmsLessons(module.id, includeUnpublished);
      return Promise.all(lessons.map((lesson) => lessonToTopic(lesson, module, includeUnpublished)));
    }));
    return groups.flat();
  } catch (error) {
    if (includeUnpublished) throw error;
    console.warn('No se pudo cargar el temario del CMS:', error);
    return TOPICS_DATA;
  }
}

export async function getTopicFromCmsOrFallback(topicId: string, includeUnpublished = false): Promise<TopicItem | null> {
  const topics = await getAllTopicsFromCmsOrFallback(includeUnpublished);
  return topics.find((topic) => topic.id === topicId) || null;
}
