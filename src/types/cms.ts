export type PublicationStatus = 'draft' | 'published' | 'archived';

export interface CmsModule {
  id: string;
  title: string;
  description: string;
  category: string;
  badge?: string;
  slug?: string;
  position: number;
  status: PublicationStatus;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CmsLesson {
  id: string;
  moduleId: string;
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
  displayCodeJava?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CmsSection {
  id: string;
  lessonId: string;
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
  | 'callout'
  | 'resources'
  | 'activity';

export interface CmsBlock {
  id: string;
  sectionId: string;
  type: BlockType;
  content: string;
  contentP5?: string;
  contentJava?: string;
  codeLanguage?: 'p5' | 'processing';
  position: number;
  filename?: string;
  caption?: string;
  calloutType?: 'info' | 'tip' | 'warning' | 'success';
  activityConfig?: string;
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
  createdAt: string;
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
