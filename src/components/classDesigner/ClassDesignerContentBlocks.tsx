import { CmsBlockView } from '../CmsBlockView';
import type { ClassDesignerContentBlock } from '../../types/classDesignerContent';

export function ClassDesignerContentBlocks({ blocks, label }: { blocks: ClassDesignerContentBlock[]; label: string }) {
  const visible = [...(blocks ?? [])].filter((block) => block.visible !== false).sort((a, b) => a.position - b.position);
  if (!visible.length) return null;
  return <section aria-label={label} className="space-y-4">
    {visible.map((block) => <CmsBlockView key={block.id} block={block} />)}
  </section>;
}
