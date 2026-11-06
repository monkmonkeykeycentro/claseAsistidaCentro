export interface DriveImageFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  thumbnailLink?: string;
  publicRead?: boolean;
  sharingError?: string;
}

type DriveRequest = <T>(path: string, init?: RequestInit) => Promise<T>;
interface Permission { id: string; type: string; role: string; allowFileDiscovery?: boolean }

/** Publish just this image as a reader link; never change the folder or owners. */
export async function ensurePublicDriveImage(fileId: string, request: DriveRequest): Promise<DriveImageFile> {
  if (!/^[a-zA-Z0-9_-]+$/.test(fileId)) throw new Error('El identificador de la imagen de Drive no es válido.');
  const filePath = `/files/${encodeURIComponent(fileId)}`;
  const metadataPath = `${filePath}?fields=id,name,mimeType,webViewLink,thumbnailLink`;
  const file = await request<DriveImageFile>(metadataPath);
  if (!file.mimeType.startsWith('image/')) throw new Error('La publicación automática está limitada a imágenes.');
  const permissions = async () => {
    const all: Permission[] = [];
    let next = '';
    do {
      const page = await request<{ permissions: Permission[]; nextPageToken?: string }>(`${filePath}/permissions?pageSize=100&fields=permissions(id,type,role,allowFileDiscovery),nextPageToken${next ? `&pageToken=${encodeURIComponent(next)}` : ''}`);
      all.push(...page.permissions);
      next = page.nextPageToken || '';
    } while (next);
    return all;
  };
  const current = (await permissions()).find((permission) => permission.type === 'anyone');
  if (!current || current.role !== 'reader' || current.allowFileDiscovery === true) {
    await request(`${filePath}/permissions${current ? `/${encodeURIComponent(current.id)}` : ''}?fields=id,type,role,allowFileDiscovery`, {
      method: current ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...(current ? {} : { type: 'anyone' }), role: 'reader', allowFileDiscovery: false }),
    });
  }
  const verified = (await permissions()).filter((permission) => permission.type === 'anyone');
  if (!verified.length || verified.some((permission) => permission.role !== 'reader' || permission.allowFileDiscovery === true)) {
    throw new Error('Drive no confirmó el acceso público de lectura. Revisa si la carpeta hereda permisos de edición o si tu organización restringe compartir archivos.');
  }
  // Sharing can add a resource key to webViewLink. Refresh the persistent link.
  return { ...await request<DriveImageFile>(metadataPath), publicRead: true };
}
