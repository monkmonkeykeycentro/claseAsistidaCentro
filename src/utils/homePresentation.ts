import { DEFAULT_HOME_PRESENTATION, type CmsHomePresentation, type CmsHomePresentationItem } from '../types/cms';

export const homeLessonId = (id: string) => id.replace(/^les_/, '');

export function normalizeHomePresentation(value: unknown): CmsHomePresentation {
  const data = value && typeof value === 'object' ? value as Partial<CmsHomePresentation> : {};
  const seen = new Set<string>();
  const items: CmsHomePresentationItem[] = [];
  for (const item of Array.isArray(data.items) ? data.items : []) {
    if (!item || typeof item.id !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(item.id)) continue;
    if (item.type !== 'lesson' && item.type !== 'class-designer') continue;
    const id = item.type === 'class-designer' ? 'class-designer' : item.id;
    const key = `${item.type}:${homeLessonId(id)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    items.push({ type: item.type, id });
  }
  return {
    enabled: data.enabled === true,
    title: typeof data.title === 'string' ? data.title : DEFAULT_HOME_PRESENTATION.title,
    description: typeof data.description === 'string' ? data.description : DEFAULT_HOME_PRESENTATION.description,
    items,
  };
}
