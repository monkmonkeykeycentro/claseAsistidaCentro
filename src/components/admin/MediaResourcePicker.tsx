import React, { useEffect, useState } from 'react';
import type { CmsMediaResource } from '../../types/cms';
import { getCmsMediaResources, saveCmsMediaResource } from '../../services/cmsService';
import { mediaResourceKind, mediaResourceUrl } from '../../utils/mediaUrls';
import { uploadDriveFile, isDriveConfigured } from '../../services/googleDriveService';
import { MediaImage } from '../MediaImage';
import { Upload, X, Search, CheckCircle2 } from 'lucide-react';

export function MediaResourcePicker({
  kind,
  onSelect,
}: {
  kind: 'image' | 'video' | 'iframe' | 'resources';
  onSelect: (resource: CmsMediaResource, url: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CmsMediaResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    setError('');
    getCmsMediaResources()
      .then((resources) => {
        if (active) setItems(resources);
      })
      .catch(() => {
        if (active)
          setError(
            'No se pudo cargar la biblioteca multimedia. Revisa la conexión e inténtalo de nuevo.'
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [open]);

  const handleUploadDirect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      setError('');
      setSuccessMsg('');
      const uploaded = await uploadDriveFile(file);
      const driveUrl = `https://drive.google.com/file/d/${uploaded.id}/view`;
      const resource: CmsMediaResource = {
        id: `med_drive_${uploaded.id}`,
        title: uploaded.name,
        url: uploaded.webViewLink,
        driveWebViewLink: uploaded.webViewLink,
        driveThumbnailLink: uploaded.thumbnailLink,
        driveShortUrl: driveUrl,
        driveFileId: uploaded.id,
        mimeType: uploaded.mimeType,
        provider: 'google-drive',
        altText: uploaded.name.replace(/\.[^/.]+$/, ''),
        category: file.type.startsWith('video/')
          ? 'video'
          : file.type.startsWith('audio/')
          ? 'audio'
          : file.type.startsWith('image/')
          ? 'imagenes'
          : 'documentos',
        createdAt: new Date().toISOString(),
      };
      await saveCmsMediaResource(resource);
      setItems((prev) => [resource, ...prev]);
      const url = mediaResourceUrl(resource);
      setSuccessMsg(`"${uploaded.name}" subido a Google Drive con permisos de solo lectura.`);
      setTimeout(() => {
        onSelect(resource, url);
        setOpen(false);
      }, 700);
    } catch (err: any) {
      setError(err?.message || 'Error al subir el archivo a Google Drive con permiso de solo lectura.');
    } finally {
      setUploading(false);
    }
  };

  const filtered = items.filter((item) => {
    const type = mediaResourceKind(item);
    return (
      (kind === 'resources' || kind === 'iframe' || type === kind || type === 'unknown') &&
      `${item.title} ${item.altText || ''} ${item.category || ''}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-[#407B5D] bg-white px-3 py-2 text-xs font-semibold text-[#407B5D] hover:bg-[#E8EEE8] transition-colors cursor-pointer"
      >
        Elegir de la biblioteca multimedia
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 animate-in fade-in"
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.stopPropagation();
              setOpen(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Biblioteca multimedia"
            className="max-h-[85vh] w-full max-w-3xl overflow-auto rounded-2xl bg-white p-5 shadow-xl space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E1E7E1] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#232A24]">Biblioteca multimedia</h3>
                <p className="text-xs text-[#59645C]">
                  Selecciona un recurso o sube un archivo nuevo directamente a Google Drive con permiso de solo lectura.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {isDriveConfigured() && (
                  <label className="rounded-lg border border-[#407B5D] bg-[#E8EEE8] hover:bg-[#D4E3D4] px-3 py-2 text-xs font-semibold text-[#28543D] flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploading ? 'Subiendo con solo lectura...' : 'Subir a Drive (Solo lectura)'}</span>
                    <input
                      type="file"
                      disabled={uploading}
                      onChange={handleUploadDirect}
                      accept={
                        kind === 'image'
                          ? 'image/*'
                          : kind === 'video'
                          ? 'video/*'
                          : 'image/*,audio/*,video/*,.pdf,.pde,.zip'
                      }
                      className="hidden"
                    />
                  </label>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-[#E1E7E1] hover:bg-[#F7F8F4] px-3 py-2 text-xs font-semibold cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>

            {successMsg && (
              <div className="p-3 bg-[#E8EEE8] border border-[#A4C4B5] rounded-xl text-xs text-[#28543D] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#407B5D] shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {error && (
              <p role="alert" className="text-xs text-red-800 p-3 bg-red-50 border border-red-200 rounded-xl">
                {error}
              </p>
            )}

            <div className="relative">
              <Search className="w-4 h-4 text-[#8E8E89] absolute left-3 top-3 pointer-events-none" />
              <input
                autoFocus
                aria-label="Buscar recurso multimedia"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nombre o descripción…"
                className="w-full rounded-xl border border-[#E1E7E1] pl-9 pr-3 py-2 text-xs"
              />
            </div>

            {loading ? (
              <p role="status" className="text-xs text-[#59645C] py-6 text-center">
                Cargando biblioteca…
              </p>
            ) : !filtered.length ? (
              <p className="text-xs text-[#59645C] py-6 text-center bg-[#F7F8F4] rounded-xl border border-dashed border-[#E1E7E1]">
                No hay recursos compatibles con esta búsqueda. Puedes subir uno directamente a Google Drive con el botón superior.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 max-h-[50vh] overflow-y-auto pr-1">
                {filtered.map((item) => {
                  const url = mediaResourceUrl(item);
                  return (
                    <article
                      key={item.id}
                      className="space-y-2 rounded-xl border border-[#E1E7E1] p-3 hover:border-[#407B5D] transition-colors bg-[#F7F8F4]"
                    >
                      {mediaResourceKind(item) === 'image' && (
                        <div className="bg-white rounded-lg border border-[#E1E7E1] overflow-hidden flex items-center justify-center h-32">
                          <MediaImage
                            src={url}
                            alt={item.altText || item.title}
                            className="max-h-32 w-full object-contain"
                          />
                        </div>
                      )}
                      <div>
                        <p className="break-words text-xs font-bold text-[#232A24] truncate">
                          {item.title}
                        </p>
                        <p className="text-[10px] text-[#59645C] font-mono truncate">
                          {item.provider === 'google-drive' ? 'Google Drive (Solo lectura)' : item.mimeType || item.category || 'Recurso'}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={!url}
                        onClick={() => {
                          onSelect(item, url);
                          setOpen(false);
                        }}
                        className="w-full rounded-lg bg-[#407B5D] hover:bg-[#33654C] px-3 py-1.5 text-xs font-bold text-white transition-colors cursor-pointer disabled:opacity-40"
                      >
                        Usar este recurso
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
