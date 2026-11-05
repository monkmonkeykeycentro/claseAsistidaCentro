import React from 'react';
import { CmsBlock } from '../types/cms';
import { ProcessingCodeBlock } from './ProcessingCodeBlock';
import { P5LiveThumbnail } from './generative/P5LiveThumbnail';

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

function iframeUrl(value: string): string | undefined {
  const embeddedSrc = value.match(/<iframe\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/i)?.[1];
  const safe = webUrl(embeddedSrc || value.trim());
  if (!safe) return undefined;

  const url = new URL(safe);
  if (!['miro.com', 'www.miro.com'].includes(url.hostname)) return safe;

  const boardMatch = url.pathname.match(/^\/app\/(?:board|live-embed|embed)\/([^/]+)/);
  if (!boardMatch) return safe;

  const embedUrl = new URL(`https://miro.com/app/live-embed/${boardMatch[1]}/`);
  url.searchParams.forEach((value, key) => embedUrl.searchParams.set(key, value));
  if (!embedUrl.searchParams.has('embedMode')) {
    embedUrl.searchParams.set('embedMode', 'view_only');
  }
  return embedUrl.href;
}

export function CmsBlockView({ block }: { block: CmsBlock }) {
  if (block.type === 'code') {
    const javaCode = block.contentJava || block.content;
    const p5Code = block.contentP5;
    const repositoryUrl = block.codeSource === 'github' ? block.repositoryUrl : undefined;

    return (
      <div className="space-y-3">
        {block.caption && (
          <p className="text-xs font-mono text-[#59645C]">{block.caption}</p>
        )}

        {/* Live p5.js visual thumbnail executed in sandboxed canvas */}
        {(p5Code || repositoryUrl) && block.showInteractiveExecution && (
          <div className="space-y-2 border border-[#A4C4B5] rounded-2xl overflow-hidden bg-[#F7F8F4] p-3">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-bold text-[#28543D]">Ejecución interactiva</span>
              <span className="text-[10px] text-[#59645C]">Código p5.js ejecutándose en el tema</span>
            </div>
            <div className="w-full flex justify-center bg-white rounded-xl p-2 border border-[#E1E7E1]">
              <P5LiveThumbnail
                p5Code={p5Code}
                repositoryUrl={repositoryUrl}
                repositoryEntry={block.repositoryEntry}
                width={620}
                height={320}
                interactive
                fit="contain"
              />
            </div>
          </div>
        )}

        {/* Processing Java Code Displayed to Student */}
        {(block.showCodeJava !== false || block.showCodeP5 === true) && (
          <ProcessingCodeBlock
            code={javaCode}
            codeJava={block.showCodeJava === false ? '' : javaCode}
            codeP5={block.showCodeP5 === true ? p5Code : undefined}
            defaultLanguage="processing"
            filename={block.filename || 'sketch.pde'}
            showCopyButton
          />
        )}
      </div>
    );
  }
  if (block.type === 'image') {
    const src = webUrl(block.content);
    return src ? <figure className="space-y-2"><img src={src} alt={block.caption || 'Imagen educativa'} loading="lazy" className="max-w-full rounded-xl" />{block.caption && <figcaption className="text-xs text-[#59645C]">{block.caption}</figcaption>}</figure> : null;
  }
  if (block.type === 'video') {
    const src = videoUrl(block.content);
    return src ? <figure className="space-y-2"><iframe src={src} title={block.caption || 'Video educativo'} loading="lazy" className="aspect-video w-full rounded-xl border border-[#E1E7E1]" allowFullScreen />{block.caption && <figcaption className="text-xs text-[#59645C]">{block.caption}</figcaption>}</figure> : null;
  }
  if (block.type === 'iframe') {
    const src = iframeUrl(block.content);
    const isMiro = src ? new URL(src).hostname === 'miro.com' : false;
    return src ? (
      <figure className="space-y-2">
        <iframe
          src={src}
          title={block.iframeTitle || block.caption || 'Contenido embebido'}
          loading="lazy"
          className="w-full rounded-xl border border-[#E1E7E1] bg-white"
          style={{ height: `${Math.min(Math.max(block.iframeHeight || 480, 160), 1200)}px` }}
          sandbox={isMiro
            ? 'allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock'
            : 'allow-scripts allow-forms allow-popups'}
          allow={isMiro ? 'fullscreen; clipboard-read; clipboard-write' : undefined}
          allowFullScreen
        />
        {block.caption && <figcaption className="text-xs text-[#59645C]">{block.caption}</figcaption>}
      </figure>
    ) : (
      <p className="text-xs text-[#9A5A18]">La URL del iframe no es válida.</p>
    );
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
