import { driveFileUrls } from '../utils/mediaUrls';

export function DriveFileNotice({ url }: { url: string }) {
  const drive = driveFileUrls(url);
  if (!drive) return null;
  return <div className="space-y-1 text-xs text-[#59645C]">
    <a href={drive.view} target="_blank" rel="noopener noreferrer" className="text-[#407B5D] underline">Abrir archivo en Drive</a>
    <p>Si Drive solicita acceso, abre el archivo con una cuenta autorizada. El propietario puede revisar sus permisos en Compartir.</p>
  </div>;
}
