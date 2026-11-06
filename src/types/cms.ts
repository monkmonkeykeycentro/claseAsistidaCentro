export type PublicationStatus = 'draft' | 'published' | 'archived';

export type CmsNodeType =
  | 'space'
  | 'unit'
  | 'lesson'
  | 'section'
  | 'activity'
  | 'tool'
  | 'resource'
  | 'assessment'
  | 'collection'
  | 'container';

export type CmsCapability =
  | 'content'
  | 'activity'
  | 'interactive'
  | 'assessment'
  | 'tool'
  | 'resource'
  | 'container'
  | 'navigation';

export interface CmsNode {
  id: string;
  type: CmsNodeType;
  title: string;
  slug?: string;
  description?: string;
  status: PublicationStatus;
  visible: boolean;
  position: number;
  capabilities: CmsCapability[];
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type CmsRelationType = 'contains' | 'recommends' | 'requires' | 'references';

export interface CmsNodeRelation {
  id: string;
  parentId: string;
  childId: string;
  relationType: CmsRelationType;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface CmsNodeBlock {
  id: string;
  nodeId: string;
  type: BlockType;
  position: number;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CmsModule {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryId?: string;
  badge?: string;
  slug?: string;
  position: number;
  status: PublicationStatus;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CmsCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  position: number;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CmsLesson {
  id: string;
  moduleId: string;
  categoryId?: string;
  title: string;
  summary: string;
  badge?: string;
  estimatedTime?: string;
  slug?: string;
  position: number;
  status: PublicationStatus;
  visible: boolean;
  hasInteractiveWorkshop?: boolean;
  workshopType?: 'classes' | 'oop-lab' | 'object-arrays' | string;
  thumbnailP5?: string;
  repositoryUrl?: string;
  repositoryEntry?: string;
  displayCodeJava?: string;
  showCodeJava?: boolean;
  showCodeP5?: boolean;
  showInteractiveExecution?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CmsSection {
  id: string;
  lessonId: string;
  categoryId?: string;
  title: string;
  summary?: string;
  position: number;
  visible: boolean;
  didacticTip?: string;
  commonMistake?: string;
  createdAt: string;
  updatedAt: string;
}

export type BlockType =
  | 'rich-text'
  | 'code'
  | 'image'
  | 'video'
  | 'iframe'
  | 'callout'
  | 'resources'
  | 'activity';

export interface CmsBlock {
  id: string;
  sectionId: string;
  categoryId?: string;
  type: BlockType;
  content: string;
  contentP5?: string;
  repositoryUrl?: string;
  repositoryEntry?: string;
  codeSource?: 'inline' | 'github';
  contentJava?: string;
  codeLanguage?: 'p5' | 'processing';
  showCodeJava?: boolean;
  showCodeP5?: boolean;
  showInteractiveExecution?: boolean;
  position: number;
  filename?: string;
  caption?: string;
  calloutType?: 'info' | 'tip' | 'warning' | 'success';
  activityConfig?: string;
  iframeTitle?: string;
  iframeHeight?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CmsSiteContent {
  key: string;
  title: string;
  content: string;
  section: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface CmsSiteContentCombined {
  heroHeadline: string;
  heroSubtitle: string;
  heroBadge?: string;
  generativeQuestion?: string;
  generativePrinciples: string[];
  oopLabTitle?: string;
  oopLabSummary?: string;
  workshopTitle?: string;
  workshopSummary?: string;
  philosophyTitle?: string;
  footerText: string;
  pilotModuleTitle?: string;
  pilotModuleDescription?: string;
  pilotEx1Title?: string;
  pilotEx1Objective?: string;
  pilotEx2Title?: string;
  pilotEx2Objective?: string;
  pilotEx3Title?: string;
  headerNavigation?: HeaderNavigationItem[];
}

export type HomeSectionId = 'hero' | 'resume' | 'units' | 'pilot' | 'topics' | 'tools' | 'philosophy';

export interface CmsHomePillar {
  title: string;
  description: string;
  showDefaultContent: boolean;
  blocks: CmsHomeBlock[];
}

export type CmsHomeBlockType = 'text' | 'modules' | 'categories' | 'lessons' | 'tools';

export interface CmsHomeBlock {
  id: string;
  type: CmsHomeBlockType;
  title: string;
  text?: string;
  sourceIds?: string[];
  columns?: 1 | 2 | 3;
  visible: boolean;
  position: number;
}

export interface CmsFooterConfig {
  visible: boolean;
  brand: string;
  technology: string;
  text: string;
  showHomeLink: boolean;
  showDesignerLink: boolean;
  showUnitsLink: boolean;
  showCatalogueLink: boolean;
  showOopLink: boolean;
  showPilotLink: boolean;
  showPrivacyLink?: boolean;
}

export interface CmsHomeConfig {
  key: 'home_config';
  sections: Record<HomeSectionId, boolean>;
  featuredTopicIds: string[];
  pillars: Record<Exclude<HomeSectionId, 'hero' | 'resume'>, CmsHomePillar>;
  footer: CmsFooterConfig;
  updatedAt: string;
}

export const DEFAULT_HOME_CONFIG: CmsHomeConfig = {
  key: 'home_config',
  sections: {
    hero: true,
    resume: true,
    units: true,
    pilot: true,
    topics: true,
    tools: true,
    philosophy: true,
  },
  featuredTopicIds: [],
  pillars: {
    units: {
      title: 'Plan de Unidades Curriculares',
      description: 'Secuencia didáctica de 14 prácticas progresivas con formulación de hipótesis, comprobación visual y evidencias de logro.',
      showDefaultContent: true,
      blocks: [],
    },
    pilot: {
      title: 'Exploraciones con Processing',
      description: 'Secuencia didáctica de tres ejercicios con metodología: Observar → Interpretar → Escribir → Experimentar → Documentar.',
      showDefaultContent: true,
      blocks: [],
    },
    topics: {
      title: 'Temario y Conceptos Fundamentales',
      description: 'Lecciones y conceptos seleccionados para construir un recorrido de aprendizaje personalizado.',
      showDefaultContent: true,
      blocks: [],
    },
    tools: {
      title: 'Herramientas de Autoría y Creación',
      description: 'Espacios para experimentar, diseñar clases y construir proyectos propios.',
      showDefaultContent: true,
      blocks: [],
    },
    philosophy: {
      title: 'Filosofía de Código Creativo',
      description: 'La programación como medio artístico, constructivo y experimental.',
      showDefaultContent: true,
      blocks: [],
    },
  },
  footer: {
    visible: true,
    brand: 'Código Creativo',
    technology: 'Processing Java 4.3',
    text: 'Una plataforma educativa para aprender programación mediante creación, experimentación y pensamiento generativo.',
    showHomeLink: true,
    showDesignerLink: true,
    showUnitsLink: true,
    showCatalogueLink: true,
    showOopLink: true,
    showPilotLink: true,
    showPrivacyLink: true,
  },
  updatedAt: '',
};

export type NavigationTarget =
  | 'home'
  | 'horse'
  | 'units'
  | 'oop-lab'
  | 'class-designer'
  | 'pilot'
  | 'catalogue';

export interface HeaderNavigationItem {
  id: string;
  label: string;
  target: NavigationTarget;
  visibleInHeader: boolean;
  position: number;
  badge?: string;
  description?: string;
}

export const DEFAULT_HEADER_NAVIGATION: HeaderNavigationItem[] = [
  {
    id: 'nav_home',
    label: 'Inicio',
    target: 'home',
    visibleInHeader: true,
    position: 0,
    description: 'Vista principal del Laboratorio de Código Creativo',
  },
  {
    id: 'nav_horse',
    label: 'Caballo al Galope',
    target: 'horse',
    visibleInHeader: true,
    position: 1,
    badge: '1878',
    description: 'Instalación audiovisual interactiva de Eadweard Muybridge (Discretización ASCII)',
  },
  {
    id: 'nav_units',
    label: 'Unidades 1-3',
    target: 'units',
    visibleInHeader: true,
    position: 2,
    badge: '14',
    description: '14 prácticas curriculares: Fundamentos, Geometría y Algoritmos',
  },
  {
    id: 'nav_oop_lab',
    label: 'Laboratorio POO',
    target: 'oop-lab',
    visibleInHeader: true,
    position: 3,
    description: 'Laboratorio de Objetos interactivo con Pelota, Burbuja y ruido Perlin',
  },
  {
    id: 'nav_designer',
    label: 'Diseñador POO',
    target: 'class-designer',
    visibleInHeader: true,
    position: 4,
    description: 'Herramienta de autoría para construir moldes y clases Processing Java',
  },
  {
    id: 'nav_pilot',
    label: 'Exploraciones',
    target: 'pilot',
    visibleInHeader: true,
    position: 5,
    description: 'Módulo piloto de 3 experiencias: Coordenadas, Condicionales y Audiovisual',
  },
  {
    id: 'nav_catalogue',
    label: 'Temario',
    target: 'catalogue',
    visibleInHeader: true,
    position: 6,
    badge: '7',
    description: 'Catálogo de conceptos y fundamentos de Processing Java',
  },
];

export interface CmsMediaResource {
  id: string;
  title: string;
  url: string;
  altText?: string;
  category?: string;
  categoryId?: string;
  createdAt: string;
  provider?: 'external' | 'google-drive';
  driveFileId?: string;
  mimeType?: string;
  driveWebViewLink?: string;
  driveThumbnailLink?: string;
  driveShortUrl?: string;
  driveFolderId?: string;
}

export interface CmsRevision {
  id: string;
  entityType: 'module' | 'lesson' | 'section' | 'full_backup';
  entityId: string;
  snapshotJson: string;
  note?: string;
  createdBy?: string;
  createdAt: string;
}

export interface CurriculumExportData {
  version: string;
  exportedAt: string;
  exportedBy: string;
  modules: CmsModule[];
  lessons: CmsLesson[];
  sections: CmsSection[];
  blocks: CmsBlock[];
  siteContent: CmsSiteContent[];
  media: CmsMediaResource[];
}
