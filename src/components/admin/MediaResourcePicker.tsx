import { useEffect, useState } from 'react';
import type { CmsMediaResource } from '../../types/cms';
import { getCmsMediaResources } from '../../services/cmsService';
import { mediaResourceKind, mediaResourceUrl } from '../../utils/mediaUrls';
import { MediaImage } from '../MediaImage';

export function MediaResourcePicker({ kind, onSelect }: { kind: 'image' | 'video' | 'iframe' | 'resources'; onSelect: (resource: CmsMediaResource, url: string) => void }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CmsMediaResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    setError('');
    getCmsMediaResources().then((resources) => { if (active) setItems(resources); })
      .catch(() => { if (active) setError('No se pudo cargar la biblioteca multimedia. Revisa la conexión e inténtalo de nuevo.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [open]);
  const filtered = items.filter((item) => {
    const type = mediaResourceKind(item);
    return (kind === 'resources' || kind === 'iframe' || type === kind || type === 'unknown')
      && `${item.title} ${item.altText || ''} ${item.category || ''}`.toLowerCase().includes(search.toLowerCase());
  });
  return <div className="space-y-2">
    <button type="button" onClick={() => setOpen(true)} className="rounded-lg border border-[#407B5D] bg-white px-3 py-2 text-xs font-semibold text-[#407B5D]">Elegir de la biblioteca multimedia</button>
    {open && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" onKeyDown={(event) => { if (event.key === 'Escape') { event.stopPropagation(); setOpen(false); } }}>
      <section role="dialog" aria-modal="true" aria-label="Biblioteca multimedia" className="max-h-[85vh] w-full max-w-3xl overflow-auto rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-3 flex items-center justify-between gap-3"><h3 className="text-base font-bold">Biblioteca multimedia</h3><button type="button" onClick={() => setOpen(false)} className="rounded-lg border px-3 py-2 text-xs">Cerrar biblioteca</button></div>
        <p className="mb-3 text-xs text-[#59645C]">Usa los recursos registrados en el CMS. Los archivos de Drive conservan sus permisos de acceso. Las imágenes públicas se muestran directamente, sin conectar Drive.</p>
        <input autoFocus aria-label="Buscar recurso multimedia" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre o descripción…" className="mb-4 w-full rounded-xl border border-[#E1E7E1] p-2.5 text-sm" />
        {loading ? <p role="status" className="text-sm">Cargando biblioteca…</p> : error ? <p role="alert" className="text-sm text-red-800">{error}</p> : !filtered.length ? <p className="text-sm text-[#59645C]">No hay recursos compatibles con esta búsqueda. Puedes registrarlos en Recursos Multimedia del CMS.</p> : <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((item) => {
            const url = mediaResourceUrl(item);
            return <article key={item.id} className="space-y-2 rounded-xl border border-[#E1E7E1] p-3">
              {mediaResourceKind(item) === 'image' && <MediaImage src={url} alt={item.altText || item.title} className="max-h-36 w-full rounded-lg object-contain" />}
              <p className="break-words text-sm font-semibold">{item.title}</p>
              <p className="text-xs text-[#59645C]">{item.mimeType || item.category || 'Recurso'}</p>
              <button type="button" disabled={!url} onClick={() => { onSelect(item, url); setOpen(false); }} className="rounded-lg bg-[#407B5D] px-3 py-2 text-xs font-bold text-white disabled:opacity-40">Usar este recurso</button>
            </article>;
          })}
        </div>}
      </section>
    </div>}
  </div>;
}
