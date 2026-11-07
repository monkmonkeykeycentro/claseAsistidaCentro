import { logSafeError } from '../utils/safeError';
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
} from './database';
import { db, requireCmsAdmin } from './firebase';
import { databaseSource, useMongoDB } from '../config/dataBackend';
import {
  CmsModule,
  CmsCategory,
  CmsLesson,
  CmsSection,
  CmsBlock,
  CmsSiteContent,
  CmsSiteContentCombined,
  CmsMediaResource,
  CmsRevision,
  CurriculumExportData,
  HeaderNavigationItem,
  DEFAULT_HEADER_NAVIGATION,
  CmsNode,
  CmsNodeBlock,
  CmsNodeRelation,
  CmsHomeConfig,
  DEFAULT_HOME_CONFIG,
} from '../types/cms';
import { TOPICS_DATA, TopicItem, TopicConcept } from '../data/topicsData';
import { CURRICULUM_UNITS } from '../data/unitsData';
import { normalizeHomePresentation } from '../utils/homePresentation';

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
  pilot_module_title: {
    key: 'pilot_module_title',
    title: 'Título Módulo Piloto',
    section: 'piloto',
    content: 'Exploraciones con Processing',
    updatedAt: new Date().toISOString(),
  },
  pilot_module_description: {
    key: 'pilot_module_description',
    title: 'Descripción Módulo Piloto',
    section: 'piloto',
    content:
      'Secuencia pedagógica de tres ejercicios para asimilar el sistema de coordenadas, las estructuras condicionales y la experimentación audiovisual.',
    updatedAt: new Date().toISOString(),
  },
  pilot_ex1_title: {
    key: 'pilot_ex1_title',
    title: 'Título Ejercicio 1 (Coordenadas)',
    section: 'piloto',
    content: 'Sistemas de coordenadas: Del espacio a la forma',
    updatedAt: new Date().toISOString(),
  },
  pilot_ex1_objective: {
    key: 'pilot_ex1_objective',
    title: 'Objetivo Ejercicio 1 (Coordenadas)',
    section: 'piloto',
    content:
      'Comprender el sistema cartesiano de Processing Java y utilizar coordenadas precisas (X, Y) para posicionar elementos gráficos.',
    updatedAt: new Date().toISOString(),
  },
  pilot_ex2_title: {
    key: 'pilot_ex2_title',
    title: 'Título Ejercicio 2 (Condicionales)',
    section: 'piloto',
    content: 'Estructuras condicionales: Decisiones visuales',
    updatedAt: new Date().toISOString(),
  },
  pilot_ex2_objective: {
    key: 'pilot_ex2_objective',
    title: 'Objetivo Ejercicio 2 (Condicionales)',
    section: 'piloto',
    content:
      'Comprender estructuras if, else if y else en Processing Java mediante tres zonas visuales y análisis de valores límite.',
    updatedAt: new Date().toISOString(),
  },
  pilot_ex3_title: {
    key: 'pilot_ex3_title',
    title: 'Título Ejercicio 3 (Audiovisual)',
    section: 'piloto',
    content: 'Discretización audiovisual: Video a ASCII',
    updatedAt: new Date().toISOString(),
  },
  header_navigation_config: {
    key: 'header_navigation_config',
    title: 'Apartados y Navegación del Header',
    section: 'navegacion',
    content: JSON.stringify(DEFAULT_HEADER_NAVIGATION),
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
    const [snap, initialized] = await Promise.all([
      getDocs(collection(db, path)), getDoc(doc(db, 'cms_site_content', 'curriculum_initialized')),
    ]);
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
            contentJava: concept.codeSnippetJava || concept.codeSnippet,
            contentP5: concept.codeSnippetP5,
            codeLanguage: 'processing',
            showInteractiveExecution: false,
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

    // Seed Pilot Module: Exploraciones con Processing
    const pilotModId = 'mod_pilot_exploraciones';
    const pilotModDoc: CmsModule = {
      id: pilotModId,
      title: 'Módulo Piloto: Exploraciones con Processing',
      description: 'Secuencia pedagógica de tres ejercicios para asimilar el sistema de coordenadas, las estructuras condicionales y la experimentación audiovisual.',
      category: 'Fundamentos',
      badge: 'Módulo Piloto',
      slug: 'exploraciones',
      position: TOPICS_DATA.length,
      status: 'published',
      visible: true,
      createdAt: now,
      updatedAt: now,
    };
    seedDocument('cms_modules', pilotModId, pilotModDoc);

    const pilotLessons: CmsLesson[] = [
      {
        id: 'les_pilot_coordinates',
        moduleId: pilotModId,
        title: '01. Del espacio a la forma: Sistemas de coordenadas',
        summary: 'Comprender el sistema cartesiano de Processing Java y utilizar coordenadas precisas (X, Y) para posicionar elementos gráficos.',
        badge: 'Metodología 5 Etapas',
        estimatedTime: '20 min',
        slug: 'coordenadas',
        position: 0,
        status: 'published',
        visible: true,
        hasInteractiveWorkshop: true,
        workshopType: 'coordinates',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'les_pilot_conditionals',
        moduleId: pilotModId,
        title: '02. Decisiones visuales: Estructuras condicionales',
        summary: 'Comprender estructuras if, else if y else en Processing Java mediante tres zonas visuales y análisis estricto de valores límite.',
        badge: 'Metodología 5 Etapas',
        estimatedTime: '20 min',
        slug: 'condicionales',
        position: 1,
        status: 'published',
        visible: true,
        hasInteractiveWorkshop: true,
        workshopType: 'conditionals',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'les_pilot_video_ascii',
        moduleId: pilotModId,
        title: '03. Discretización audiovisual: Video a ASCII',
        summary: 'Discretización de Video a Caracteres ASCII con división interactiva y cuantización tipográfica. Video: Sallie Gardner at a Gallop de Eadweard Muybridge.',
        badge: 'Instalación Interactiva',
        estimatedTime: '15 min',
        slug: 'video-ascii',
        position: 2,
        status: 'published',
        visible: true,
        hasInteractiveWorkshop: true,
        workshopType: 'video-ascii',
        createdAt: now,
        updatedAt: now,
      },
    ];

    for (const pLes of pilotLessons) {
      seedDocument('cms_lessons', pLes.id, pLes);
      const secId = `sec_${pLes.id}`;
      seedDocument('cms_sections', secId, {
        id: secId,
        lessonId: pLes.id,
        title: pLes.title,
        summary: pLes.summary,
        position: 0,
        visible: true,
        createdAt: now,
        updatedAt: now,
      });
      const blkId = `blk_${pLes.id}`;
      seedDocument('cms_blocks', blkId, {
        id: blkId,
        sectionId: secId,
        type: 'rich-text',
        content: pLes.summary,
        position: 0,
        createdAt: now,
        updatedAt: now,
      });
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
    logSafeError('No se pudo inicializar el CMS:', err);
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

const composableNodeCollections = {
  nodes: 'cms_nodes',
  relations: 'cms_node_relations',
  blocks: 'cms_node_blocks',
} as const;

const composableMigrationKey = 'cms_composable_migration_v1';
const nodeId = (prefix: string, id: string) => `${prefix}_${id}`.replace(/[^a-zA-Z0-9_-]/g, '_');
type ComposableMigrationResult = {
  migrated: boolean;
  nodes: number;
  relations: number;
  blocks: number;
};

async function commitInChunks(
  writes: Array<(batch: ReturnType<typeof writeBatch>) => void>,
  chunkSize = 400,
): Promise<void> {
  for (let index = 0; index < writes.length; index += chunkSize) {
    const batch = writeBatch(db);
    writes.slice(index, index + chunkSize).forEach((write) => write(batch));
    await batch.commit();
  }
}

/**
 * Copies legacy CMS records and the hardcoded curriculum into composable nodes.
 * The legacy collections remain untouched and existing composable records are
 * never overwritten, so this operation is safe to retry after an interruption.
 */
export async function migrateLegacyContentToComposable(): Promise<ComposableMigrationResult> {
  await requireCmsAdmin();
  const marker = await getDoc(doc(db, 'cms_site_content', composableMigrationKey));
  if (marker.exists()) {
    const data = marker.data() as Partial<ComposableMigrationResult>;
    return { migrated: false, nodes: data.nodes || 0, relations: data.relations || 0, blocks: data.blocks || 0 };
  }

  const [modules, lessons, sections, blocks, media, existingNodes, existingRelations, existingBlocks] = await Promise.all([
    readCollection<CmsModule>('cms_modules'),
    readCollection<CmsLesson>('cms_lessons'),
    readCollection<CmsSection>('cms_sections'),
    readCollection<CmsBlock>('cms_blocks'),
    readCollection<CmsMediaResource>('cms_media'),
    readCollection<CmsNode>(composableNodeCollections.nodes),
    readCollection<CmsNodeRelation>(composableNodeCollections.relations),
    readCollection<CmsNodeBlock>(composableNodeCollections.blocks),
  ]);
  const nodeIds = new Set(existingNodes.map((item) => item.id));
  const relationIds = new Set(existingRelations.map((item) => item.id));
  const blockIds = new Set(existingBlocks.map((item) => item.id));
  const nodeWrites: Array<(batch: ReturnType<typeof writeBatch>) => void> = [];
  const relationWrites: Array<(batch: ReturnType<typeof writeBatch>) => void> = [];
  const blockWrites: Array<(batch: ReturnType<typeof writeBatch>) => void> = [];
  const now = new Date().toISOString();
  const addNode = (node: CmsNode) => {
    if (!nodeIds.has(node.id)) {
      nodeIds.add(node.id);
      nodeWrites.push((batch) => batch.set(doc(db, composableNodeCollections.nodes, node.id), cleanDocument(node)));
    }
  };
  const addRelation = (relation: CmsNodeRelation) => {
    if (!relationIds.has(relation.id)) {
      relationIds.add(relation.id);
      relationWrites.push((batch) => batch.set(doc(db, composableNodeCollections.relations, relation.id), cleanDocument(relation)));
    }
  };
  const addBlock = (block: CmsNodeBlock) => {
    if (!blockIds.has(block.id)) {
      blockIds.add(block.id);
      blockWrites.push((batch) => batch.set(doc(db, composableNodeCollections.blocks, block.id), cleanDocument(block)));
    }
  };
  const relation = (parentId: string, childId: string, position: number, id: string): CmsNodeRelation => ({
    id,
    parentId,
    childId,
    relationType: 'contains',
    position,
    createdAt: now,
    updatedAt: now,
  });

  modules.forEach((module) => {
    const id = nodeId('node_module', module.id);
    addNode({ id, type: 'container', title: module.title, slug: module.slug, description: module.description, status: module.status, visible: module.visible, position: module.position, capabilities: ['content', 'container', 'navigation'], metadata: { legacyId: module.id, category: module.category, badge: module.badge || '' }, createdAt: module.createdAt || now, updatedAt: module.updatedAt || now });
  });
  lessons.forEach((lesson) => {
    const id = nodeId('node_lesson', lesson.id);
    addNode({ id, type: 'lesson', title: lesson.title, slug: lesson.slug, description: lesson.summary, status: lesson.status, visible: lesson.visible, position: lesson.position, capabilities: ['content', 'container'], metadata: { legacyId: lesson.id, moduleId: lesson.moduleId, estimatedTime: lesson.estimatedTime || '', workshopType: lesson.workshopType || '' }, createdAt: lesson.createdAt || now, updatedAt: lesson.updatedAt || now });
    addRelation(relation(nodeId('node_module', lesson.moduleId), id, lesson.position, nodeId('rel_module_lesson', lesson.id)));
  });
  sections.forEach((section) => {
    const id = nodeId('node_section', section.id);
    addNode({ id, type: 'section', title: section.title, description: section.summary, status: 'published', visible: section.visible, position: section.position, capabilities: ['content', 'container'], metadata: { legacyId: section.id, lessonId: section.lessonId, didacticTip: section.didacticTip || '', commonMistake: section.commonMistake || '' }, createdAt: section.createdAt || now, updatedAt: section.updatedAt || now });
    addRelation(relation(nodeId('node_lesson', section.lessonId), id, section.position, nodeId('rel_lesson_section', section.id)));
  });
  blocks.forEach((legacyBlock) => {
    const id = nodeId('node_block', legacyBlock.id);
    const sectionNodeId = nodeId('node_section', legacyBlock.sectionId);
    addNode({ id: sectionNodeId, type: 'section', title: 'Sección migrada', status: 'published', visible: true, position: 0, capabilities: ['content', 'container'], metadata: { legacyId: legacyBlock.sectionId }, createdAt: now, updatedAt: now });
    addBlock({ id, nodeId: sectionNodeId, type: legacyBlock.type, position: legacyBlock.position, data: { content: legacyBlock.content, contentFormat: legacyBlock.contentFormat, contentP5: legacyBlock.contentP5 || '', contentJava: legacyBlock.contentJava || '', codeLanguage: legacyBlock.codeLanguage || '', showInteractiveExecution: legacyBlock.showInteractiveExecution === true, filename: legacyBlock.filename || '', caption: legacyBlock.caption || '', calloutType: legacyBlock.calloutType || '', activityConfig: legacyBlock.activityConfig || '' }, createdAt: legacyBlock.createdAt || now, updatedAt: legacyBlock.updatedAt || now });
  });
  media.forEach((resource, position) => {
    const id = nodeId('node_resource', resource.id);
    addNode({ id, type: 'resource', title: resource.title, description: resource.altText, status: 'published', visible: true, position, capabilities: ['resource', 'content'], metadata: { legacyId: resource.id, category: resource.category || '', url: resource.url }, createdAt: resource.createdAt || now, updatedAt: now });
    addBlock({ id: nodeId('node_resource_block', resource.id), nodeId: id, type: 'resources', position: 0, data: { url: resource.url, title: resource.title, altText: resource.altText || '', category: resource.category || '', embed: false }, createdAt: resource.createdAt || now, updatedAt: now });
  });
  CURRICULUM_UNITS.forEach((unit) => {
    const unitNodeId = nodeId('node_unit', unit.id);
    addNode({ id: unitNodeId, type: 'unit', title: unit.title, description: unit.summary, status: 'published', visible: true, position: unit.number - 1, capabilities: ['content', 'container', 'navigation'], metadata: { source: 'unitsData', unit: { ...unit, exercises: undefined } }, createdAt: now, updatedAt: now });
    unit.exercises.forEach((exercise, position) => {
      const exerciseNodeId = nodeId('node_activity', exercise.id);
      addNode({ id: exerciseNodeId, type: 'activity', title: exercise.title, description: exercise.subtitle, status: exercise.status, visible: exercise.status === 'published', position, capabilities: ['content', 'activity', 'assessment', 'interactive'], metadata: { source: 'unitsData', exercise }, createdAt: now, updatedAt: now });
      addRelation(relation(unitNodeId, exerciseNodeId, position, nodeId('rel_unit_activity', exercise.id)));
    });
  });

  await commitInChunks(nodeWrites);
  await commitInChunks(relationWrites);
  await commitInChunks(blockWrites);
  const counts = { nodes: nodeWrites.length, relations: relationWrites.length, blocks: blockWrites.length };
  await setDoc(doc(db, 'cms_site_content', composableMigrationKey), { key: composableMigrationKey, version: 1, ...counts, migratedAt: now }, { merge: true });
  return { migrated: true, ...counts };
}

export async function getCmsNodes(includeUnpublished = false): Promise<CmsNode[]> {
  if (includeUnpublished) await requireCmsAdmin();
  const constraints = includeUnpublished ? [] : published();
  const nodes = await readCollection<CmsNode>(composableNodeCollections.nodes, constraints);
  return byPosition(nodes.filter((node) => node.status !== 'archived'));
}

export async function getCmsNodeById(nodeId: string): Promise<CmsNode | null> {
  const snapshot = await getDoc(doc(db, composableNodeCollections.nodes, nodeId));
  return snapshot.exists() ? { ...snapshot.data(), id: snapshot.id } as CmsNode : null;
}

export async function saveCmsNode(data: CmsNode): Promise<void> {
  if (!data.title.trim()) throw new Error('El contenido necesita un título.');
  if (!data.type || !Array.isArray(data.capabilities)) {
    throw new Error('El contenido necesita un tipo y capacidades válidas.');
  }
  await persist(composableNodeCollections.nodes, data.id, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteCmsNode(id: string, hardDelete = false): Promise<void> {
  await requireCmsAdmin();
  if (!hardDelete) {
    await persist(composableNodeCollections.nodes, id, {
      status: 'archived',
      visible: false,
      updatedAt: new Date().toISOString(),
    });
    return;
  }

  const [relations, blocks] = await Promise.all([
    readCollection<CmsNodeRelation>(composableNodeCollections.relations),
    readCollection<CmsNodeBlock>(composableNodeCollections.blocks, [
      where('nodeId', '==', id),
    ]),
  ]);
  const batch = writeBatch(db);
  relations
    .filter((relation) => relation.parentId === id || relation.childId === id)
    .forEach((relation) => batch.delete(doc(db, composableNodeCollections.relations, relation.id)));
  blocks.forEach((block) => batch.delete(doc(db, composableNodeCollections.blocks, block.id)));
  batch.delete(doc(db, composableNodeCollections.nodes, id));
  await batch.commit();
}

export async function getCmsNodeRelations(
  nodeId: string,
  relationType: CmsNodeRelation['relationType'] = 'contains',
): Promise<CmsNodeRelation[]> {
  const relations = await readCollection<CmsNodeRelation>(composableNodeCollections.relations, [
    where('parentId', '==', nodeId),
    where('relationType', '==', relationType),
  ]);
  return byPosition(relations);
}

export async function saveCmsNodeRelation(data: CmsNodeRelation): Promise<void> {
  if (!data.parentId || !data.childId || data.parentId === data.childId) {
    throw new Error('La relación necesita contenidos distintos de origen y destino.');
  }
  await persist(composableNodeCollections.relations, data.id, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteCmsNodeRelation(id: string): Promise<void> {
  await requireCmsAdmin();
  await deleteDoc(doc(db, composableNodeCollections.relations, id));
}

export async function getCmsNodeBlocks(nodeId: string): Promise<CmsNodeBlock[]> {
  return byPosition(await readCollection<CmsNodeBlock>(composableNodeCollections.blocks, [
    where('nodeId', '==', nodeId),
  ]));
}

function composableBlockToCmsBlock(block: CmsNodeBlock, sectionId: string): CmsBlock {
  const data = block.data || {};
  return {
    id: block.id,
    sectionId,
    type: block.type,
    content: typeof data.content === 'string' ? data.content : typeof data.url === 'string' ? data.url : '',
    contentFormat: data.contentFormat === 'html' ? 'html' : undefined,
    contentP5: typeof data.contentP5 === 'string' ? data.contentP5 : undefined,
    contentJava: typeof data.contentJava === 'string' ? data.contentJava : undefined,
    repositoryUrl: typeof data.repositoryUrl === 'string' ? data.repositoryUrl : undefined,
    repositoryEntry: typeof data.repositoryEntry === 'string' ? data.repositoryEntry : undefined,
    codeSource: data.codeSource === 'github' ? 'github' : data.codeSource === 'inline' ? 'inline' : undefined,
    codeLanguage: data.codeLanguage === 'p5' ? 'p5' : data.codeLanguage === 'processing' ? 'processing' : undefined,
    showCodeJava: typeof data.showCodeJava === 'boolean' ? data.showCodeJava : undefined,
    showCodeP5: typeof data.showCodeP5 === 'boolean' ? data.showCodeP5 : undefined,
    showInteractiveExecution: data.showInteractiveExecution === true,
    filename: typeof data.filename === 'string' ? data.filename : undefined,
    caption: typeof data.caption === 'string' ? data.caption : typeof data.title === 'string' ? data.title : undefined,
    calloutType: ['info', 'tip', 'warning', 'success'].includes(String(data.calloutType))
      ? data.calloutType as CmsBlock['calloutType']
      : undefined,
    activityConfig: typeof data.activityConfig === 'string' ? data.activityConfig : undefined,
    iframeTitle: typeof data.iframeTitle === 'string' ? data.iframeTitle : undefined,
    iframeHeight: typeof data.iframeHeight === 'number' ? data.iframeHeight : undefined,
    position: block.position,
    createdAt: block.createdAt,
    updatedAt: block.updatedAt,
  };
}

async function getTopicsFromComposable(nodes: CmsNode[], lessons: CmsLesson[], relations: CmsNodeRelation[], blocks: CmsNodeBlock[]): Promise<TopicItem[]> {
  const lessonsById = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const childrenByParent = new Map<string, CmsNodeRelation[]>();
  relations.forEach((relation) => {
    const children = childrenByParent.get(relation.parentId) || [];
    children.push(relation);
    childrenByParent.set(relation.parentId, children);
  });
  childrenByParent.forEach((children) => children.sort((a, b) => a.position - b.position));

  const lessonNodes = nodes.filter((node) => node.type === 'lesson');
  return Promise.all(lessonNodes.map(async (lessonNode) => {
    const sectionRelations = childrenByParent.get(lessonNode.id) || [];
    const sections = await Promise.all(sectionRelations
      .map((relation) => nodeById.get(relation.childId))
      .filter((node): node is CmsNode => node?.type === 'section')
      .map(async (sectionNode) => {
        const sectionBlocks = blocks
          .filter((block) => block.nodeId === sectionNode.id)
          .sort((a, b) => a.position - b.position)
          .map((block) => composableBlockToCmsBlock(block, sectionNode.id));
        const codeBlock = sectionBlocks.find((block) => block.type === 'code');
        const javaCode = codeBlock?.contentJava || codeBlock?.content || '';
        return {
          id: sectionNode.id,
          title: sectionNode.title,
          summary: sectionNode.description || '',
          explanation: sectionBlocks.filter((block) => block.type === 'rich-text').map((block) => block.content).join('\n\n'),
          codeSnippet: javaCode,
          codeSnippetJava: javaCode,
          codeSnippetP5: codeBlock?.contentP5,
          repositoryUrl: codeBlock?.repositoryUrl,
          repositoryEntry: codeBlock?.repositoryEntry,
          showCodeJava: codeBlock?.showCodeJava ?? true,
          showCodeP5: codeBlock?.showCodeP5 ?? false,
          showInteractiveExecution: codeBlock?.showInteractiveExecution ?? false,
          defaultLanguage: 'processing' as const,
          didacticTip: typeof sectionNode.metadata.didacticTip === 'string' ? sectionNode.metadata.didacticTip : '',
          commonMistake: typeof sectionNode.metadata.commonMistake === 'string' ? sectionNode.metadata.commonMistake : undefined,
          blocks: sectionBlocks,
        };
      }));
    const parentRelation = relations.find((relation) => relation.childId === lessonNode.id);
    const parentNode = parentRelation ? nodeById.get(parentRelation.parentId) : undefined;
    const category = typeof parentNode?.metadata.category === 'string'
      ? parentNode.metadata.category
      : 'Fundamentos';
    const metadata = lessonNode.metadata || {};
    // Lesson previews are still edited in cms_lessons after migration. Keep
    // those settings instead of replacing them with an older section demo.
    const lesson = lessonsById.get(typeof metadata.legacyId === 'string' ? metadata.legacyId : lessonNode.id);
    const repositorySection = sections.find((section) => section.repositoryUrl);
    const unitId = metadata.unitId === 'u1' || metadata.unitId === 'u2' || metadata.unitId === 'u3'
      ? metadata.unitId
      : category === 'Fundamentos' ? 'u1' : undefined;
    const original = TOPICS_DATA.find((topic) => topic.id === lessonNode.metadata.legacyId || `les_${topic.id}` === lessonNode.metadata.legacyId);
    return {
      id: typeof metadata.legacyId === 'string' ? metadata.legacyId.replace(/^les_/, '') : lessonNode.id,
      number: lessonNode.position + 1,
      title: lessonNode.title,
      summary: lessonNode.description || '',
      category: category as TopicItem['category'],
      unitId,
      badge: typeof parentNode?.metadata.badge === 'string' ? parentNode.metadata.badge : '',
      estimatedTime: typeof metadata.estimatedTime === 'string' && metadata.estimatedTime ? metadata.estimatedTime : '20 min',
      conceptsCount: sections.length,
      concepts: sections,
      hasInteractiveWorkshop: original?.hasInteractiveWorkshop || metadata.workshopType === 'classes',
      quickChallenge: original?.quickChallenge,
      thumbnailP5: lesson?.thumbnailP5 || sections.find((section) => section.codeSnippetP5)?.codeSnippetP5,
      repositoryUrl: lesson?.repositoryUrl || repositorySection?.repositoryUrl,
      repositoryEntry: lesson?.repositoryUrl ? lesson.repositoryEntry : repositorySection?.repositoryEntry,
      showCodeJava: true,
      showCodeP5: false,
      showInteractiveExecution: sections.some((section) => section.showInteractiveExecution),
      displayCodeJava: sections.find((section) => section.codeSnippetJava)?.codeSnippetJava,
    };
  }));
}

export async function saveCmsNodeBlock(data: CmsNodeBlock): Promise<void> {
  if (!data.nodeId || !data.type || !data.data || typeof data.data !== 'object') {
    throw new Error('El bloque necesita un contenido válido.');
  }
  await persist(composableNodeCollections.blocks, data.id, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteCmsNodeBlock(id: string): Promise<void> {
  await requireCmsAdmin();
  await deleteDoc(doc(db, composableNodeCollections.blocks, id));
}

export async function getCmsModules(includeUnpublished = false): Promise<CmsModule[]> {
  if (includeUnpublished) await requireCmsAdmin();
  const list = await readCollection<CmsModule>('cms_modules', includeUnpublished ? [] : published());
  return byPosition(list.filter((item) => item.status !== 'archived'));
}

const DEFAULT_CMS_CATEGORIES: CmsCategory[] = [
  'Fundamentos',
  'Control y Lógica',
  'Modularidad',
  'Programación Orientada a Objetos',
].map((name, position) => ({
  id: `cat_${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
  name,
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  position,
  visible: true,
  createdAt: '',
  updatedAt: '',
}));

export async function getCmsCategories(includeUnpublished = false): Promise<CmsCategory[]> {
  if (includeUnpublished) await requireCmsAdmin();
  try {
    const categories = await readCollection<CmsCategory>(
      'cms_categories',
      includeUnpublished ? [] : [where('visible', '==', true)],
    );
    return byPosition(categories.length ? categories : DEFAULT_CMS_CATEGORIES);
  } catch (error) {
    throw error;
  }
}

/**
 * Keeps the category catalog and existing CMS records connected.
 * The legacy category name remains for backwards compatibility; categoryId is
 * the stable reference used by new editorial features.
 */
export async function syncCmsCategoryReferences(): Promise<{ categories: number; references: number }> {
  await requireCmsAdmin();
  const existingCategories = await readCollection<CmsCategory>('cms_categories');
  const categoriesByName = new Map(existingCategories.map((category) => [category.name.trim().toLocaleLowerCase(), category]));
  const now = new Date().toISOString();
  const categories = [...existingCategories];

  for (const defaultCategory of DEFAULT_CMS_CATEGORIES) {
    const key = defaultCategory.name.toLocaleLowerCase();
    if (!categoriesByName.has(key)) {
      const restored = { ...defaultCategory, createdAt: now, updatedAt: now };
      categoriesByName.set(key, restored);
      categories.push(restored);
      await persist('cms_categories', restored.id, restored);
    }
  }

  const [modules, lessons, sections, blocks, media, nodes, relations] = await Promise.all([
    readCollection<CmsModule>('cms_modules'),
    readCollection<CmsLesson>('cms_lessons'),
    readCollection<CmsSection>('cms_sections'),
    readCollection<CmsBlock>('cms_blocks'),
    readCollection<CmsMediaResource>('cms_media'),
    readCollection<CmsNode>(composableNodeCollections.nodes),
    readCollection<CmsNodeRelation>(composableNodeCollections.relations),
  ]);
  const categoryIdFor = (name?: string) => {
    if (!name) return undefined;
    return categoriesByName.get(name.trim().toLocaleLowerCase())?.id;
  };
  const moduleById = new Map(modules.map((module) => [module.id, module]));
  const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  const sectionById = new Map(sections.map((section) => [section.id, section]));
  const categoryIdByNodeId = new Map<string, string>();
  const writes: Array<{ collection: string; id: string; data: object }> = [];
  const queue = (collection: string, id: string, data: object) => writes.push({ collection, id, data });

  modules.forEach((module) => {
    const categoryId = module.categoryId || categoryIdFor(module.category);
    if (categoryId && module.categoryId !== categoryId) queue('cms_modules', module.id, { categoryId, updatedAt: now });
  });
  lessons.forEach((lesson) => {
    const categoryId = lesson.categoryId || moduleById.get(lesson.moduleId)?.categoryId || categoryIdFor(moduleById.get(lesson.moduleId)?.category);
    if (categoryId && lesson.categoryId !== categoryId) queue('cms_lessons', lesson.id, { categoryId, updatedAt: now });
  });
  sections.forEach((section) => {
    const lesson = lessonById.get(section.lessonId);
    const module = moduleById.get(lesson?.moduleId || '');
    const categoryId = section.categoryId
      || lesson?.categoryId
      || module?.categoryId
      || categoryIdFor(module?.category);
    if (categoryId && section.categoryId !== categoryId) queue('cms_sections', section.id, { categoryId, updatedAt: now });
  });
  blocks.forEach((block) => {
    const section = sectionById.get(block.sectionId);
    const categoryId = block.categoryId || section?.categoryId;
    if (categoryId && block.categoryId !== categoryId) queue('cms_blocks', block.id, { categoryId, updatedAt: now });
  });
  media.forEach((resource) => {
    const categoryId = resource.categoryId || categoryIdFor(resource.category);
    if (categoryId && resource.categoryId !== categoryId) queue('cms_media', resource.id, { categoryId, updatedAt: now });
  });

  nodes.forEach((node) => {
    const metadata = node.metadata || {};
    const metadataCategory = typeof metadata.category === 'string' ? metadata.category : undefined;
    const categoryId = typeof metadata.categoryId === 'string'
      ? metadata.categoryId
      : categoryIdFor(metadataCategory);
    if (categoryId) categoryIdByNodeId.set(node.id, categoryId);
  });
  const parentByChild = new Map(relations.map((relation) => [relation.childId, relation.parentId]));
  const categoryByUnitId: Record<string, string> = { u1: 'Fundamentos', u2: 'Control y Lógica', u3: 'Programación Orientada a Objetos' };
  nodes.forEach((node) => {
    const metadata = node.metadata || {};
    let categoryId = categoryIdByNodeId.get(node.id);
    if (!categoryId) {
      const parentId = parentByChild.get(node.id);
      categoryId = parentId ? categoryIdByNodeId.get(parentId) : undefined;
    }
    if (!categoryId && node.type === 'unit' && typeof node.metadata.unit === 'object' && node.metadata.unit) {
      const unitId = (node.metadata.unit as { id?: string }).id;
      categoryId = categoryIdFor(unitId ? categoryByUnitId[unitId] : undefined);
    }
    if (!categoryId && node.type === 'activity') {
      const unitRelation = relations.find((relation) => relation.childId === node.id);
      const unit = unitRelation ? nodes.find((candidate) => candidate.id === unitRelation.parentId) : undefined;
      const unitId = unit && typeof unit.metadata.unit === 'object' && unit.metadata.unit
        ? (unit.metadata.unit as { id?: string }).id
        : undefined;
      categoryId = categoryIdFor(unitId ? categoryByUnitId[unitId] : undefined);
    }
    if (categoryId && metadata.categoryId !== categoryId) {
      queue('cms_nodes', node.id, { metadata: { ...metadata, categoryId }, updatedAt: now });
    }
  });

  await commitInChunks(writes.map((write) => (batch) => batch.set(doc(db, write.collection, write.id), cleanDocument(write.data), { merge: true })));
  return { categories: categories.length, references: writes.length };
}

export async function saveCmsCategory(data: CmsCategory): Promise<void> {
  if (!data.name.trim()) throw new Error('La categoría necesita un nombre.');
  await persist('cms_categories', data.id, {
    ...data,
    name: data.name.trim(),
    slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteCmsCategory(id: string): Promise<void> {
  await requireCmsAdmin();
  const categories = await getCmsCategories(true);
  const category = categories.find((item) => item.id === id);
  const modules = await getCmsModules(true);
  if (category && modules.some((module) => module.category === category.name)) {
    throw new Error('No puedes eliminar una categoría que todavía tiene módulos asignados.');
  }
  await deleteDoc(doc(db, 'cms_categories', id));
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
  const category = (await getCmsCategories(true)).find((item) => item.name === data.category);
  await persist('cms_modules', data.id, {
    ...data,
    categoryId: data.categoryId || category?.id,
    updatedAt: new Date().toISOString(),
  });
}

export async function saveCmsLesson(data: CmsLesson): Promise<void> {
  if (!data.title.trim() || !data.moduleId) throw new Error('La lección necesita un título y un módulo.');
  const moduleSnapshot = await getDoc(doc(db, 'cms_modules', data.moduleId));
  const module = moduleSnapshot.exists() ? moduleSnapshot.data() as CmsModule : undefined;
  await persist('cms_lessons', data.id, {
    ...data,
    categoryId: data.categoryId || module?.categoryId || (module ? (await getCmsCategories(true)).find((item) => item.name === module.category)?.id : undefined),
    updatedAt: new Date().toISOString(),
  });
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
    batch.set(doc(db, 'cms_sections', section.id), cleanDocument({
      ...section,
      categoryId: section.categoryId || lesson.categoryId,
    }));
    for (const block of blocks[section.id] || []) {
      batch.set(doc(db, 'cms_blocks', block.id), cleanDocument({
        ...block,
        categoryId: block.categoryId || section.categoryId || lesson.categoryId,
      }));
    }
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

export async function getHomeConfig(): Promise<CmsHomeConfig> {
  const snapshot = await getDoc(doc(db, 'cms_site_content', 'home_config'));
  if (!snapshot.exists()) return DEFAULT_HOME_CONFIG;
  const raw = snapshot.data();
  let data: Partial<CmsHomeConfig> = raw as Partial<CmsHomeConfig>;
  if (typeof raw.content === 'string') {
    data = JSON.parse(raw.content) as Partial<CmsHomeConfig>;
  }
  const pillars = Object.fromEntries(Object.entries(DEFAULT_HOME_CONFIG.pillars).map(([id, defaults]) => [
    id,
    {
      ...defaults,
      ...((data.pillars || {})[id as keyof CmsHomeConfig['pillars']] || {}),
      blocks: Array.isArray((data.pillars || {})[id as keyof CmsHomeConfig['pillars']]?.blocks)
        ? (data.pillars || {})[id as keyof CmsHomeConfig['pillars']]!.blocks
        : defaults.blocks,
    },
  ])) as CmsHomeConfig['pillars'];
  return {
    ...DEFAULT_HOME_CONFIG,
    ...data,
    sections: { ...DEFAULT_HOME_CONFIG.sections, ...(data.sections || {}) },
    featuredTopicIds: Array.isArray(data.featuredTopicIds) ? data.featuredTopicIds : [],
    showSectionNavigator: data.showSectionNavigator !== false,
    presentation: normalizeHomePresentation(data.presentation),
    pillars,
    footer: { ...DEFAULT_HOME_CONFIG.footer, ...(data.footer || {}) },
  };
}

export function subscribeToHomeConfig(callback: (config: CmsHomeConfig) => void, onError?: (error: unknown) => void): () => void {
  return onSnapshot(
    collection(db, 'cms_site_content'),
    (snapshot) => {
      const homeDocument = snapshot.docs.find((document) => document.id === 'home_config');
      if (!homeDocument) {
        callback(DEFAULT_HOME_CONFIG);
        return;
      }
      {
        const raw = homeDocument.data();
        let data: Partial<CmsHomeConfig> = raw as Partial<CmsHomeConfig>;
        if (typeof raw.content === 'string') {
          try { data = JSON.parse(raw.content) as Partial<CmsHomeConfig>; } catch (error) { onError?.(error); return; }
        }
        const pillars = Object.fromEntries(Object.entries(DEFAULT_HOME_CONFIG.pillars).map(([id, defaults]) => [
          id,
          {
            ...defaults,
            ...((data.pillars || {})[id as keyof CmsHomeConfig['pillars']] || {}),
            blocks: Array.isArray((data.pillars || {})[id as keyof CmsHomeConfig['pillars']]?.blocks)
              ? (data.pillars || {})[id as keyof CmsHomeConfig['pillars']]!.blocks
              : defaults.blocks,
          },
        ])) as CmsHomeConfig['pillars'];
        callback({
          ...DEFAULT_HOME_CONFIG,
          ...data,
          sections: { ...DEFAULT_HOME_CONFIG.sections, ...(data.sections || {}) },
          featuredTopicIds: Array.isArray(data.featuredTopicIds) ? data.featuredTopicIds : [],
          showSectionNavigator: data.showSectionNavigator !== false,
          presentation: normalizeHomePresentation(data.presentation),
          pillars,
          footer: { ...DEFAULT_HOME_CONFIG.footer, ...(data.footer || {}) },
        });
      }
    },
    (error) => {
      logSafeError('No se pudo cargar la configuración del Home.', error);
      onError?.(error);
    },
  );
}

export async function saveHomeConfig(config: CmsHomeConfig): Promise<void> {
  await saveSiteContent({
    key: 'home_config',
    title: 'Configuración de la portada',
    section: 'home',
    content: JSON.stringify(config),
    updatedAt: new Date().toISOString(),
  });
}

export async function saveSiteContent(item: CmsSiteContent, _userEmail?: string): Promise<void> {
  const user = await requireCmsAdmin();
  await persist('cms_site_content', item.key, { ...item, updatedAt: new Date().toISOString(), updatedBy: user.email });
}

export function subscribeToSiteContent(callback: (content: CmsSiteContentCombined) => void, onError?: (error: unknown) => void): () => void {
  const emit = (source: Record<string, CmsSiteContent>) => {
    try {
      const content = (key: string): string => {
        const item = source[key];
        if (item && typeof item.content === 'string' && item.content.trim().length > 0) {
          return item.content;
        }
        const def = DEFAULT_SITE_CONTENT[key];
        if (def && typeof def.content === 'string') {
          return def.content;
        }
        return '';
      };

      const rawPrinciples = content('generative_principles');
      let principles: string[] = ['1. Código', '2. Sistema', '3. Regla', '4. Variación', '5. Forma'];
      if (rawPrinciples) {
        try {
          const parsed = JSON.parse(rawPrinciples);
          if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
            principles = parsed;
          } else {
            principles = rawPrinciples.split(',').map((item) => item.trim()).filter(Boolean);
          }
        } catch {
          principles = rawPrinciples.split(',').map((item) => item.trim()).filter(Boolean);
        }
      }
      if (!principles.length) {
        principles = ['1. Código', '2. Sistema', '3. Regla', '4. Variación', '5. Forma'];
      }

      const rawNav = content('header_navigation_config');
      let navItems: HeaderNavigationItem[] = DEFAULT_HEADER_NAVIGATION;
      if (rawNav) {
        try {
          const parsed = JSON.parse(rawNav);
          if (Array.isArray(parsed) && parsed.length > 0) {
            navItems = parsed;
          }
        } catch {
          // Keep defaults
        }
      }

      callback({
        heroHeadline: content('hero_headline') || DEFAULT_SITE_CONTENT.hero_headline.content,
        heroSubtitle: content('hero_subtitle') || DEFAULT_SITE_CONTENT.hero_subtitle.content,
        heroBadge: content('hero_badge') || 'Laboratorio de Código Creativo',
        generativeQuestion: content('generative_question') || '¿Cómo funciona el pensamiento generativo?',
        generativePrinciples: principles,
        oopLabTitle: content('oop_lab_title') || DEFAULT_SITE_CONTENT.oop_lab_title.content,
        oopLabSummary: content('oop_lab_summary') || DEFAULT_SITE_CONTENT.oop_lab_summary.content,
        workshopTitle: content('workshop_title') || DEFAULT_SITE_CONTENT.workshop_title.content,
        workshopSummary: content('workshop_summary') || DEFAULT_SITE_CONTENT.workshop_summary.content,
        philosophyTitle: content('philosophy_title') || DEFAULT_SITE_CONTENT.philosophy_title.content,
        footerText: content('footer_text') || DEFAULT_SITE_CONTENT.footer_text.content,
        pilotModuleTitle: content('pilot_module_title') || 'Exploraciones con Processing',
        pilotModuleDescription: content('pilot_module_description') || 'Secuencia pedagógica de tres ejercicios para asimilar el sistema de coordenadas, las estructuras condicionales y la experimentación audiovisual.',
        pilotEx1Title: content('pilot_ex1_title') || 'Sistemas de coordenadas: Del espacio a la forma',
        pilotEx1Objective: content('pilot_ex1_objective') || 'Comprender el sistema cartesiano de Processing Java y utilizar coordenadas precisas (X, Y) para posicionar elementos gráficos.',
        pilotEx2Title: content('pilot_ex2_title') || 'Estructuras condicionales: Decisiones visuales',
        pilotEx2Objective: content('pilot_ex2_objective') || 'Comprender estructuras if, else if y else en Processing Java mediante tres zonas visuales y análisis de valores límite.',
        pilotEx3Title: content('pilot_ex3_title') || 'Discretización audiovisual: Video a ASCII',
        headerNavigation: navItems,
      });
    } catch (err) {
      logSafeError('Error al procesar textos de cms_site_content:', err);
      onError?.(err);
    }
  };

  return onSnapshot(
    collection(db, 'cms_site_content'),
    (snapshot) => {
      try {
        const source: Record<string, CmsSiteContent> = {};
        snapshot.docs.forEach((document) => {
          const data = document.data();
          if (data && typeof data === 'object') {
            source[document.id] = { ...data, key: document.id } as CmsSiteContent;
          }
        });
        emit(source);
      } catch (err) {
        logSafeError('Error en listener de cms_site_content:', err);
        onError?.(err);
      }
    },
    (error) => {
      logSafeError('No se pudieron cargar los textos del sitio:', error);
      onError?.(error);
    }
  );
}

export async function getHeaderNavigation(): Promise<HeaderNavigationItem[]> {
  try {
    const docSnap = await getDoc(doc(db, 'cms_site_content', 'header_navigation_config'));
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data && typeof data.content === 'string') {
        const parsed = JSON.parse(data.content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
  } catch (err) {
    logSafeError('Error al cargar navegación de cabecera:', err);
    throw err;
  }
  return DEFAULT_HEADER_NAVIGATION;
}

export async function saveHeaderNavigation(items: HeaderNavigationItem[]): Promise<void> {
  const user = await requireCmsAdmin();
  await persist('cms_site_content', 'header_navigation_config', {
    key: 'header_navigation_config',
    title: 'Apartados y Navegación del Header',
    section: 'navegacion',
    content: JSON.stringify(items),
    updatedAt: new Date().toISOString(),
    updatedBy: user.email,
  });
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
  const [modules, lessons, sections, blocks, siteDocuments, media, categories, nodes, nodeRelations, nodeBlocks] = await Promise.all([
    readCollection<CmsModule>('cms_modules'), readCollection<CmsLesson>('cms_lessons'),
    readCollection<CmsSection>('cms_sections'), readCollection<CmsBlock>('cms_blocks'),
    readCollection<CmsSiteContent & { id: string }>('cms_site_content'), getCmsMediaResources(),
    readCollection<CmsCategory>('cms_categories'), readCollection<CmsNode>('cms_nodes'),
    readCollection<CmsNodeRelation>('cms_node_relations'), readCollection<CmsNodeBlock>('cms_node_blocks'),
  ]);
  const siteContent = siteDocuments.map(({ id, ...item }) => ({ ...item, key: id }));
  const backup: CurriculumExportData = { version: '2.0.0', exportedAt: new Date().toISOString(), exportedBy: user.email || user.uid,
    source: databaseSource,
    modules, lessons, sections, blocks, siteContent, media, categories, nodes, nodeRelations, nodeBlocks };
  await createCmsRevision('full_backup', 'curriculum', backup, 'Exportación de respaldo general');
  return backup;
}
export async function importCurriculumBackup(backup: CurriculumExportData): Promise<void> {
  await requireCmsAdmin();
  if (!backup || !Array.isArray(backup.modules) || !Array.isArray(backup.lessons)) throw new Error('Respaldo no válido.');
  const groups: [string, { id?: string; key?: string }[]][] = [
    ['cms_modules', backup.modules], ['cms_lessons', backup.lessons], ['cms_sections', backup.sections || []],
    ['cms_blocks', backup.blocks || []], ['cms_site_content', backup.siteContent || []], ['cms_media', backup.media || []],
    ['cms_categories', backup.categories || []], ['cms_nodes', backup.nodes || []],
    ['cms_node_relations', backup.nodeRelations || []], ['cms_node_blocks', backup.nodeBlocks || []],
  ];
  // Validate the whole file before making the destination backup or any writes.
  // Older v1 backups remain usable; missing new collections are left untouched.
  for (const [name, items] of groups) {
    if (!Array.isArray(items)) throw new Error(`Respaldo no válido: ${name} debe ser una lista.`);
    const seen = new Set<string>();
    for (const item of items) {
      const id = name === 'cms_site_content' ? item?.key : item?.id;
      if (typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(id) || seen.has(id)) {
        throw new Error(`Respaldo no válido: ${name} contiene identificadores inválidos o repetidos.`);
      }
      seen.add(id);
    }
  }
  await exportCurriculumBackup();
  const writes: Array<(batch: ReturnType<typeof writeBatch>) => void> = [];
  for (const [name, items] of groups) {
    for (const item of items) {
      const id = (name === 'cms_site_content' ? item.key : item.id)!;
      writes.push((batch) => batch.set(doc(db, name, id), cleanDocument(item), { merge: true }));
    }
  }
  await commitInChunks(writes);
}

async function lessonToTopic(lesson: CmsLesson, module: CmsModule, sections: CmsSection[], allBlocks: CmsBlock[]): Promise<TopicItem> {
  const original = TOPICS_DATA.find((topic) => `les_${topic.id}` === lesson.id);
  let quickChallenge = original?.quickChallenge;
  const concepts: TopicConcept[] = await Promise.all(sections.map(async (section) => {
    const blocks = byPosition(allBlocks.filter((block) => block.sectionId === section.id));
    const activity = blocks.find((block) => block.type === 'activity' && block.activityConfig);
    if (activity) {
      try { quickChallenge = JSON.parse(activity.activityConfig!); } catch { /* Plain text activity. */ }
    }
    const originalConcept = original?.concepts.find((concept) => concept.id === section.id.replace(/^sec_/, ''));
    const blocksForDisplay = blocks.map((block) => {
      if (block.type !== 'code') return block;
      return {
        ...block,
        contentP5: block.contentP5 || lesson.thumbnailP5 || originalConcept?.codeSnippetP5,
        contentJava: block.contentJava || originalConcept?.codeSnippetJava || block.content,
        showInteractiveExecution: block.showInteractiveExecution ?? lesson.showInteractiveExecution,
        showCodeJava: block.showCodeJava ?? lesson.showCodeJava,
        showCodeP5: block.showCodeP5 ?? lesson.showCodeP5,
        repositoryUrl: block.repositoryUrl || lesson.repositoryUrl,
        repositoryEntry: block.repositoryEntry || (block.repositoryUrl ? undefined : lesson.repositoryEntry),
        codeSource: block.codeSource || (block.repositoryUrl || lesson.repositoryUrl ? 'github' : 'inline'),
      };
    });
    const codeBlock = blocksForDisplay.find((block) => block.type === 'code');
    const javaCode = codeBlock?.contentJava || codeBlock?.content || '';
    const p5Code = codeBlock?.contentP5 || lesson.thumbnailP5 || originalConcept?.codeSnippetP5 || '';

    return {
      id: section.id,
      title: section.title,
      summary: section.summary || '',
      explanation: blocks.filter((block) => block.type === 'rich-text').map((block) => block.content).join('\n\n'),
      codeSnippet: javaCode,
      codeSnippetJava: javaCode || originalConcept?.codeSnippetJava || '',
      codeSnippetP5: p5Code,
      repositoryUrl: codeBlock?.repositoryUrl || lesson.repositoryUrl,
      repositoryEntry: codeBlock?.repositoryUrl ? codeBlock.repositoryEntry : lesson.repositoryEntry,
      showCodeJava: codeBlock?.showCodeJava ?? lesson.showCodeJava ?? true,
      showCodeP5: codeBlock?.showCodeP5 ?? lesson.showCodeP5 ?? false,
      showInteractiveExecution: codeBlock?.showInteractiveExecution ?? lesson.showInteractiveExecution ?? false,
      defaultLanguage: 'processing' as const,
      didacticTip: section.didacticTip || '',
      commonMistake: section.commonMistake,
      blocks: blocksForDisplay,
    };
  }));

  const thumbnailP5 = lesson.thumbnailP5 || concepts.find((c) => c.codeSnippetP5)?.codeSnippetP5 || original?.thumbnailP5;
  const displayCodeJava = lesson.displayCodeJava || concepts.find((c) => c.codeSnippetJava)?.codeSnippetJava || original?.displayCodeJava;

  return {
    id: original?.id || lesson.id,
    number: module.position + 1,
    title: lesson.title,
    summary: lesson.summary,
    category: module.category as TopicItem['category'],
    unitId: module.category === 'Fundamentos' ? 'u1' : undefined,
    badge: lesson.badge || module.badge || '',
    estimatedTime: lesson.estimatedTime || '20 min',
    conceptsCount: concepts.length,
    concepts,
    hasInteractiveWorkshop: original?.hasInteractiveWorkshop || false,
    quickChallenge,
    thumbnailP5,
    repositoryUrl: lesson.repositoryUrl,
    repositoryEntry: lesson.repositoryEntry,
    showCodeJava: lesson.showCodeJava ?? true,
    showCodeP5: lesson.showCodeP5 ?? false,
    showInteractiveExecution: lesson.showInteractiveExecution ?? false,
    displayCodeJava,
  };
}

type CurriculumSnapshot = [CmsModule[], CmsLesson[], CmsSection[], CmsBlock[], CmsNode[], CmsNodeRelation[], CmsNodeBlock[]];

async function readCurriculumSnapshot(includeUnpublished: boolean): Promise<CurriculumSnapshot> {
  if (!useMongoDB && !includeUnpublished) {
    // Firestore rules require parent-constrained public queries; they do not
    // filter a whole collection the way the MongoDB API does.
    const [modules, nodes] = await Promise.all([getCmsModules(), getCmsNodes()]);
    const lessons = (await Promise.all(modules.map((module) => getCmsLessons(module.id)))).flat();
    const [sections, relations, nodeBlocks] = await Promise.all([
      Promise.all(lessons.map((lesson) => getCmsSections(lesson.id))).then((groups) => groups.flat()),
      Promise.all(nodes.map((node) => getCmsNodeRelations(node.id))).then((groups) => groups.flat()),
      Promise.all(nodes.filter((node) => node.type === 'section').map((node) => getCmsNodeBlocks(node.id))).then((groups) => groups.flat()),
    ]);
    const blocks = (await Promise.all(sections.map((section) => getCmsBlocks(section.id)))).flat();
    return [modules, lessons, sections, blocks, nodes, relations, nodeBlocks];
  }
  // Fetch each collection once, in parallel. The API filters each user's access.
  const visibility = includeUnpublished ? [] : published();
  return Promise.all([
    readCollection<CmsModule>('cms_modules', visibility),
    readCollection<CmsLesson>('cms_lessons', visibility),
    readCollection<CmsSection>('cms_sections', includeUnpublished ? [] : [where('visible', '==', true)]),
    readCollection<CmsBlock>('cms_blocks'),
    readCollection<CmsNode>('cms_nodes', visibility),
    readCollection<CmsNodeRelation>('cms_node_relations', [where('relationType', '==', 'contains')]),
    readCollection<CmsNodeBlock>('cms_node_blocks'),
  ]);
}

export async function getAllTopicsFromCmsOrFallback(includeUnpublished = false): Promise<TopicItem[]> {
  if (includeUnpublished) await requireCmsAdmin();
  const [modules, lessons, sections, blocks, nodes, relations, nodeBlocks] = await readCurriculumSnapshot(includeUnpublished);
  const composableTopics = await getTopicsFromComposable(byPosition(nodes.filter((node) => node.status !== 'archived')), lessons, relations, nodeBlocks);
  const groups = await Promise.all(byPosition(modules.filter((module) => module.status !== 'archived')).map((module) =>
    Promise.all(byPosition(lessons.filter((lesson) => lesson.moduleId === module.id && lesson.status !== 'archived')).map((lesson) =>
      lessonToTopic(lesson, module, byPosition(sections.filter((section) => section.lessonId === lesson.id)), blocks)))));
  const merged = new Map(groups.flat().map((topic) => [topic.id, topic]));
  composableTopics.forEach((topic) => merged.set(topic.id, topic));
  // An empty catalogue stays empty. Failed reads reject so the UI can offer a
  // retry, rather than presenting bundled lessons as if they came from the CMS.
  return [...merged.values()].sort((a, b) => a.number - b.number || a.title.localeCompare(b.title));
}

export async function getTopicFromCmsOrFallback(topicId: string, includeUnpublished = false): Promise<TopicItem | null> {
  const topics = await getAllTopicsFromCmsOrFallback(includeUnpublished);
  return topics.find((topic) => topic.id === topicId) || null;
}
