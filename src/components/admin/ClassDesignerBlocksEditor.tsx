import { useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import type { BlockType } from '../../types/cms';
import type { ClassDesignerContentBlock } from '../../types/classDesignerContent';
import { CLASS_DESIGNER_BLOCK_TYPES } from '../../utils/classDesignerBlocks';
import { CmsBlockView } from '../CmsBlockView';
import { RichTextEditor } from './RichTextEditor';
import { MediaResourcePicker } from './MediaResourcePicker';
import { MediaImage } from '../MediaImage';

function BlockField({ label, value, onChange, multiline = false }: {
  label: string; value: string; onChange: (value: string) => void; multiline?: boolean;
}) {
  const className = 'w-full rounded-lg border border-[#E1E7E1] bg-white p-2.5 text-xs focus:border-[#407B5D] focus:outline-none';
  return <label className="block space-y-1 text-xs font-semibold">
    <span>{label}</span>
    {multiline ? <textarea rows={4} className={className} value={value} onChange={(event) => onChange(event.target.value)} />
      : <input className={className} value={value} onChange={(event) => onChange(event.target.value)} />}
  </label>;
}

export function ClassDesignerBlocksEditor({ blocks, sectionId, label, onChange }: {
  blocks: ClassDesignerContentBlock[]; sectionId: string; label: string;
  onChange: (blocks: ClassDesignerContentBlock[]) => void;
}) {
  const [newType, setNewType] = useState<BlockType>('rich-text');
  const [showPreview, setShowPreview] = useState(false);
  const update = (id: string, changes: Partial<ClassDesignerContentBlock>) => onChange(blocks.map((block) => block.id === id
    ? { ...block, ...changes, updatedAt: new Date().toISOString() } : block));
  const reorder = (updated: ClassDesignerContentBlock[]) => onChange(updated.map((block, position) => ({ ...block, position })));
  const move = (index: number, direction: number) => {
    const next = [...blocks];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    reorder(next);
  };
  const add = () => {
    const now = new Date().toISOString();
    onChange([...blocks, { id: `block-${crypto.randomUUID()}`, sectionId, type: newType, content: '',
      position: blocks.length, createdAt: now, updatedAt: now, visible: true,
      ...(newType === 'iframe' ? { iframeHeight: 480, iframeTitle: 'Contenido embebido' } : {}),
      ...(newType === 'callout' ? { calloutType: 'info' as const } : {}),
    }]);
  };
  return <section aria-label={label} className="space-y-3 border-t border-[#E1E7E1] pt-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h4 className="text-sm font-bold">{label} ({blocks.length})</h4>
      <label className="flex items-center gap-2 text-xs">
        <input type="checkbox" checked={showPreview} onChange={(event) => setShowPreview(event.target.checked)} />Vista previa de bloques
      </label>
    </div>
    <div className="flex flex-wrap items-end gap-2">
      <label className="space-y-1 text-xs"><span className="block">Tipo de bloque</span>
        <select aria-label="Tipo de bloque" value={newType} onChange={(event) => setNewType(event.target.value as BlockType)} className="rounded-lg border border-[#E1E7E1] bg-white p-2">
          {CLASS_DESIGNER_BLOCK_TYPES.map(({ type, label: name }) => <option key={type} value={type}>{name}</option>)}
        </select>
      </label>
      <button type="button" onClick={add} className="flex items-center gap-1.5 rounded-lg bg-[#407B5D] px-3 py-2 text-xs font-bold text-white"><Plus className="h-3.5 w-3.5" />Agregar bloque</button>
    </div>
    {!blocks.length && <p className="text-xs text-[#59645C]">Agrega explicaciones, imágenes, videos o recursos para acompañar esta parte de la herramienta.</p>}
    {blocks.map((block, index) => {
      const typeLabel = CLASS_DESIGNER_BLOCK_TYPES.find(({ type }) => type === block.type)?.label ?? block.type;
      return <article key={block.id} aria-label={`Bloque ${index + 1}: ${typeLabel}`} className="space-y-3 rounded-xl border border-[#E1E7E1] bg-[#F7F8F4] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h5 className="text-xs font-bold">{index + 1}. {typeLabel}</h5>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs"><input type="checkbox" checked={block.visible !== false} onChange={(event) => update(block.id, { visible: event.target.checked })} />Mostrar bloque</label>
            <button type="button" aria-label="Mover bloque arriba" disabled={index === 0} onClick={() => move(index, -1)} className="rounded border bg-white p-1.5 disabled:opacity-30"><ArrowUp className="h-3.5 w-3.5" /></button>
            <button type="button" aria-label="Mover bloque abajo" disabled={index === blocks.length - 1} onClick={() => move(index, 1)} className="rounded border bg-white p-1.5 disabled:opacity-30"><ArrowDown className="h-3.5 w-3.5" /></button>
            <button type="button" aria-label="Eliminar bloque" onClick={() => reorder(blocks.filter((item) => item.id !== block.id))} className="rounded border bg-white p-1.5 text-red-800"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        </div>
        {['rich-text', 'activity', 'callout'].includes(block.type) && <RichTextEditor label={block.type === 'activity' ? 'Instrucciones de la actividad' : 'Texto'} value={block.content} format={block.contentFormat} onChange={(content) => update(block.id, { content, contentFormat: 'html' })} />}
        {['image', 'video', 'iframe', 'resources'].includes(block.type) && <MediaResourcePicker kind={block.type as 'image' | 'video' | 'iframe' | 'resources'} onSelect={(resource, content) => update(block.id, { content, caption: block.caption || resource.altText || resource.title })} />}
        {block.type === 'image' && <>
          <BlockField label="URL de la imagen" value={block.content} onChange={(content) => update(block.id, { content })} />
          {block.content && <MediaImage src={block.content} alt={block.caption || 'Vista previa de imagen'} className="max-h-48 rounded-lg" />}
        </>}
        {block.type === 'video' && <>
          <BlockField label="URL del video" value={block.content} onChange={(content) => update(block.id, { content })} />
          <p className="text-[11px] text-[#59645C]">Enlace de YouTube o URL directa de un archivo MP4, WebM u OGG.</p>
        </>}
        {block.type === 'resources' && <BlockField label="URL del recurso" value={block.content} onChange={(content) => update(block.id, { content })} />}
        {block.type === 'iframe' && <>
          <BlockField label="URL o código iframe" multiline value={block.content} onChange={(content) => update(block.id, { content })} />
          <BlockField label="Título accesible del iframe" value={block.iframeTitle ?? ''} onChange={(iframeTitle) => update(block.id, { iframeTitle })} />
          <label className="block space-y-1 text-xs"><span>Altura del iframe (px)</span>
            <input type="number" min={160} max={1200} className="block rounded-lg border border-[#E1E7E1] p-2" value={block.iframeHeight ?? 480} onChange={(event) => update(block.id, { iframeHeight: event.target.valueAsNumber || 480 })} />
          </label>
        </>}
        {block.type === 'callout' && <label className="block space-y-1 text-xs"><span>Estilo del aviso</span>
          <select className="block rounded-lg border p-2" value={block.calloutType ?? 'info'} onChange={(event) => update(block.id, { calloutType: event.target.value as ClassDesignerContentBlock['calloutType'] })}>
            <option value="info">Información</option><option value="tip">Consejo</option><option value="warning">Advertencia</option><option value="success">Confirmación</option>
          </select>
        </label>}
        {block.type === 'code' && <>
          <BlockField label="Código Processing Java" multiline value={block.contentJava ?? block.content} onChange={(content) => update(block.id, { content, contentJava: content })} />
          <BlockField label="Nombre del archivo" value={block.filename ?? ''} onChange={(filename) => update(block.id, { filename })} />
          <BlockField label="Código p5.js (opcional)" multiline value={block.contentP5 ?? ''} onChange={(contentP5) => update(block.id, { contentP5 })} />
          <div className="flex flex-wrap gap-3 text-xs">
            <label><input type="checkbox" checked={block.showInteractiveExecution === true} onChange={(event) => update(block.id, { showInteractiveExecution: event.target.checked })} /> Ejecutar p5.js</label>
            <label><input type="checkbox" checked={block.showCodeJava !== false} onChange={(event) => update(block.id, { showCodeJava: event.target.checked })} /> Mostrar Java</label>
            <label><input type="checkbox" checked={block.showCodeP5 === true} onChange={(event) => update(block.id, { showCodeP5: event.target.checked })} /> Mostrar p5.js</label>
          </div>
        </>}
        <BlockField label={block.type === 'resources' ? 'Texto del enlace' : 'Descripción o pie de bloque'} value={block.caption ?? ''} onChange={(caption) => update(block.id, { caption })} />
        {showPreview && block.visible !== false && <div className="rounded-xl border border-[#E1E7E1] bg-white p-3"><CmsBlockView block={block} /></div>}
      </article>;
    })}
  </section>;
}
