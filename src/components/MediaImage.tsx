import { useState } from 'react';
import { publicImageSources } from '../utils/mediaUrls';

export function MediaImage({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  const [failures, setFailures] = useState<{ src: string; urls: string[] }>({ src, urls: [] });
  const [retry, setRetry] = useState(0);
  const failedUrls = failures.src === src ? failures.urls : [];
  const resolved = publicImageSources(src).find((url) => !failedUrls.includes(url));
  return resolved
    ? <img key={`${resolved}:${retry}`} src={resolved} alt={alt} loading="lazy" referrerPolicy="no-referrer" className={className}
      onError={() => setFailures((previous) => ({ src, urls: [...(previous.src === src ? previous.urls : []), resolved] }))} />
    : <div role="status" className="space-y-2 rounded-lg border border-[#E1E7E1] bg-[#F7F8F4] p-3 text-xs text-[#59645C]">
      <p>No se pudo cargar la imagen desde su enlace público.</p>
      <button type="button" onClick={() => { setFailures({ src, urls: [] }); setRetry((value) => value + 1); }} className="font-semibold text-[#407B5D] underline">Reintentar imagen</button>
    </div>;
}
