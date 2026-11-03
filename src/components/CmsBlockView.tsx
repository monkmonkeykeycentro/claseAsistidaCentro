import React from 'react';
import { CmsBlock } from '../types/cms';
import { ProcessingCodeBlock } from './ProcessingCodeBlock';

function webUrl(value: string): string | undefined {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : undefined;
  } catch { return undefined; }
}

function videoUrl(value: string): string | undefined {
  const safe = webUrl(value);
  if (!safe) return undefined;
  const url = new URL(safe);
  if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(url.hostname) && url.pathname === '/watch') {
    return `https://www.youtube.com/embed/${encodeURIComponent(url.searchParams.get('v') || '')}`;
  }
  if (url.hostname === 'youtu.be') return `https://www.youtube.com/embed/${encodeURIComponent(url.pathname.slice(1))}`;
  return safe;
}

export function CmsBlockView({ block }: { block: CmsBlock }) {
  if (block.type === 'code') return (
    <div className="space-y-2">
      {block.caption && <p className="text-xs text-[#59645C]">{block.caption}</p>}
      <ProcessingCodeBlock code={block.content} filename={block.filename || 'sketch.pde'} showCopyButton />
    </div>
  );
  if (block.type === 'image') {
    const src = webUrl(block.content);
    return src ? <figure className="space-y-2"><img src={src} alt={block.caption || 'Imagen educativa'} loading="lazy" className="max-w-full rounded-xl" />{block.caption && <figcaption className="text-xs text-[#59645C]">{block.caption}</figcaption>}</figure> : null;
  }
  if (block.type === 'video') {
    const src = videoUrl(block.content);
    return src ? <figure className="space-y-2"><iframe src={src} title={block.caption || 'Video educativo'} loading="lazy" className="aspect-video w-full rounded-xl border border-[#E1E7E1]" allowFullScreen />{block.caption && <figcaption className="text-xs text-[#59645C]">{block.caption}</figcaption>}</figure> : null;
  }
  if (block.type === 'callout') return (
    <aside className={`p-4 rounded-xl border text-sm whitespace-pre-line ${block.calloutType === 'warning' ? 'bg-[#FFF9EE] border-[#E6C687]' : 'bg-[#E8EEE8] border-[#A4C4B5]'}`}>
      {block.caption && <strong className="block mb-1">{block.caption}</strong>}{block.content}
    </aside>
  );
  if (block.type === 'resources' && webUrl(block.content)) return (
    <a href={webUrl(block.content)} target="_blank" rel="noopener noreferrer" className="text-sm text-[#407B5D] underline">{block.caption || block.content}</a>
  );
  return <div className="text-sm text-[#232A24] leading-relaxed whitespace-pre-line">{block.content}</div>;
}
