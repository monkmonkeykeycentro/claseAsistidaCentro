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
  footerText: string;
  generativePrinciples: string[];
}

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
