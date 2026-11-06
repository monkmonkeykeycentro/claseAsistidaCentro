import type { ClassDesignerContentBlock } from '../types/classDesignerContent';
import type { BlockType } from '../types/cms';

export const CLASS_DESIGNER_BLOCK_TYPES: { type: BlockType; label: string }[] = [
  { type: 'rich-text', label: 'Texto' }, { type: 'image', label: 'Imagen' },
  { type: 'video', label: 'Video' }, { type: 'iframe', label: 'Iframe' },
  { type: 'code', label: 'Código' }, { type: 'callout', label: 'Aviso' },
  { type: 'resources', label: 'Recurso o enlace' }, { type: 'activity', label: 'Actividad' },
];

export function normalizeClassDesignerBlocks(value: unknown, sectionId: string): ClassDesignerContentBlock[] {
  if (!Array.isArray(value)) return [];
  const usedIds = new Set<string>();
  return value.filter((block) => block && typeof block === 'object'
    && CLASS_DESIGNER_BLOCK_TYPES.some(({ type }) => type === block.type))
    .map((raw, index) => {
      const baseId = typeof raw.id === 'string' && raw.id ? raw.id : `${sectionId}-block-${index}`;
      let id = baseId;
      while (usedIds.has(id)) id = `${id}-${index}`;
      usedIds.add(id);
      const block: ClassDesignerContentBlock = {
        id, sectionId, type: raw.type, content: typeof raw.content === 'string' ? raw.content : '',
        position: typeof raw.position === 'number' && Number.isFinite(raw.position) ? raw.position : index,
        createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : '',
        updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : '', visible: raw.visible !== false,
      };
      for (const key of ['caption', 'filename', 'contentJava', 'contentP5', 'repositoryUrl', 'repositoryEntry', 'activityConfig', 'iframeTitle'] as const) {
        if (typeof raw[key] === 'string') block[key] = raw[key];
      }
      for (const key of ['showInteractiveExecution', 'showCodeJava', 'showCodeP5'] as const) {
        if (typeof raw[key] === 'boolean') block[key] = raw[key];
      }
      if (['info', 'tip', 'warning', 'success'].includes(raw.calloutType)) block.calloutType = raw.calloutType;
      if (['inline', 'github'].includes(raw.codeSource)) block.codeSource = raw.codeSource;
      if (raw.contentFormat === 'html') block.contentFormat = 'html';
      if (['p5', 'processing'].includes(raw.codeLanguage)) block.codeLanguage = raw.codeLanguage;
      if (typeof raw.iframeHeight === 'number' && Number.isFinite(raw.iframeHeight)) block.iframeHeight = Math.min(1200, Math.max(160, raw.iframeHeight));
      return block;
    }).sort((a, b) => a.position - b.position).map((block, position) => ({ ...block, position }));
}
