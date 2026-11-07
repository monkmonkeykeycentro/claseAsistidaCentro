import { doc, getDoc, onSnapshot, setDoc } from './database';
import { db, requireCmsAdmin } from './firebase';
import { importClassDesignFromJson } from './classDesignerService';
import { CLASS_DESIGNER_STEPS, DEFAULT_CLASS_DESIGNER_CONTENT } from '../data/classDesignerContent';
import type { ClassDesignProject } from '../types/classDesigner';
import type { ClassDesignerContent } from '../types/classDesignerContent';
import { normalizeClassDesignerBlocks } from '../utils/classDesignerBlocks';

export const CLASS_DESIGNER_CONTENT_KEY = 'class_designer_config';
const text = (value: unknown, fallback: string) => typeof value === 'string' ? value : fallback;

export function normalizeClassDesignerContent(value: unknown): ClassDesignerContent {
  const defaults = structuredClone(DEFAULT_CLASS_DESIGNER_CONTENT);
  if (!value || typeof value !== 'object') return defaults;
  const raw = value as Partial<ClassDesignerContent>;
  const normalizeProject = (project: unknown, fallback: ClassDesignProject) => {
    if (!project || typeof project !== 'object') return fallback;
    return importClassDesignFromJson(JSON.stringify(project)).project ?? fallback;
  };
  for (const field of ['title', 'subtitle', 'introduction', 'guidingTitle', 'guidingDescription'] as const) {
    defaults[field] = text(raw[field], defaults[field]);
  }
  defaults.blocks = normalizeClassDesignerBlocks(raw.blocks, 'class-designer-introduction');
  for (const step of CLASS_DESIGNER_STEPS) {
    for (const field of ['shortTitle', 'navigationTitle', 'category', 'title', 'description', 'tip'] as const) {
      defaults.steps[step][field] = text(raw.steps?.[step]?.[field], defaults.steps[step][field]);
    }
    defaults.steps[step].blocks = normalizeClassDesignerBlocks(raw.steps?.[step]?.blocks, `class-designer-step-${step}`);
  }
  for (const key of Object.keys(defaults.questions) as (keyof ClassDesignerContent['questions'])[]) {
    for (const field of ['label', 'placeholder'] as const) defaults.questions[key][field] = text(raw.questions?.[key]?.[field], defaults.questions[key][field]);
  }
  for (const key of Object.keys(defaults.fieldStrategies) as (keyof ClassDesignerContent['fieldStrategies'])[]) {
    for (const field of ['title', 'description'] as const) defaults.fieldStrategies[key][field] = text(raw.fieldStrategies?.[key]?.[field], defaults.fieldStrategies[key][field]);
  }
  defaults.defaultProject = normalizeProject(raw.defaultProject, defaults.defaultProject);
  if (Array.isArray(raw.examples)) {
    defaults.examples = raw.examples.filter((example) => example && typeof example.id === 'string' && typeof example.label === 'string')
      .map((example) => ({ id: example.id, label: example.label, project: normalizeProject(example.project, defaults.defaultProject) }));
  }
  return defaults;
}

function readContent(data: Record<string, unknown> | undefined): ClassDesignerContent {
  if (!data) return structuredClone(DEFAULT_CLASS_DESIGNER_CONTENT);
  return normalizeClassDesignerContent(typeof data.content === 'string' ? JSON.parse(data.content) : data);
}

export async function getClassDesignerContent(): Promise<ClassDesignerContent> {
  const snapshot = await getDoc(doc(db, 'cms_site_content', CLASS_DESIGNER_CONTENT_KEY));
  return readContent(snapshot.exists() ? snapshot.data() : undefined);
}

export function subscribeToClassDesignerContent(callback: (content: ClassDesignerContent) => void, onError: (error: unknown) => void): () => void {
  return onSnapshot(doc(db, 'cms_site_content', CLASS_DESIGNER_CONTENT_KEY), (snapshot) => {
    try { callback(readContent(snapshot.exists() ? snapshot.data() : undefined)); }
    catch (error) { onError(error); }
  }, onError);
}

export async function saveClassDesignerContent(content: ClassDesignerContent): Promise<void> {
  const administrator = await requireCmsAdmin();
  if (!content.title.trim()) throw new Error('Escribe el título de la herramienta.');
  for (const step of CLASS_DESIGNER_STEPS) {
    if (!content.steps[step].title.trim() || !content.steps[step].shortTitle.trim()) throw new Error(`Completa el título y el nombre corto de la etapa ${step}.`);
  }
  if (content.examples.some((example) => !example.label.trim())) throw new Error('Escribe el nombre de cada plantilla de ejemplo.');
  await setDoc(doc(db, 'cms_site_content', CLASS_DESIGNER_CONTENT_KEY), {
    key: CLASS_DESIGNER_CONTENT_KEY, title: 'Contenido del Diseñador POO', section: 'herramientas',
    content: JSON.stringify(normalizeClassDesignerContent(content)), updatedAt: new Date().toISOString(), updatedBy: administrator.email,
  });
}

export function instantiateClassDesignerTemplate(project: ClassDesignProject): ClassDesignProject {
  const { userId: _owner, ...copy } = structuredClone(project);
  const now = new Date().toISOString();
  return { ...copy, id: `diseno-${crypto.randomUUID()}`, createdAt: now, updatedAt: now };
}
