import { requireCmsAdmin } from './firebase';
import { ensurePublicDriveImage, type DriveImageFile } from './driveSharing';

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3/files';
const ROOT_FOLDER_NAME = 'Clase Asistida Centro';
const CLIENT_ID = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.VITE_GOOGLE_CLIENT_ID;

interface GoogleTokenClient {
  requestAccessToken: (options?: { prompt?: string }) => void;
}

interface GoogleIdentityServices {
  accounts: {
    oauth2: {
      initTokenClient: (options: {
        client_id: string;
        scope: string;
        callback: (response: { access_token?: string; error?: string }) => void;
      }) => GoogleTokenClient;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleIdentityServices;
  }
}

let accessToken: string | null = null;
let identityScriptPromise: Promise<void> | null = null;

function loadIdentityScript(): Promise<void> {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (identityScriptPromise) return identityScriptPromise;
  identityScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-google-identity]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('No se pudo cargar Google Identity Services.')), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No se pudo cargar Google Identity Services.'));
    document.head.appendChild(script);
  });
  return identityScriptPromise;
}

async function requestAccessToken(prompt: '' | 'consent' = ''): Promise<string> {
  if (!CLIENT_ID) throw new Error('Falta VITE_GOOGLE_CLIENT_ID en la configuración de la aplicación.');
  await loadIdentityScript();
  if (!window.google?.accounts?.oauth2) throw new Error('Google Identity Services no está disponible.');

  return new Promise((resolve, reject) => {
    const tokenClient = window.google!.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: DRIVE_SCOPE,
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(new Error(`Google Drive rechazó la autorización${response.error ? ` (${response.error})` : ''}.`));
          return;
        }
        accessToken = response.access_token;
        resolve(response.access_token);
      },
    });
    tokenClient.requestAccessToken({ prompt });
  });
}

export async function connectGoogleDrive(): Promise<void> {
  await requestAccessToken('consent');
  await requireCmsAdmin();
}

async function driveRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = accessToken || await requestAccessToken();
  await requireCmsAdmin();
  const response = await fetch(`${DRIVE_API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...(init?.headers || {}) },
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Google Drive respondió ${response.status}: ${message.slice(0, 240)}`);
  }
  return response.json() as Promise<T>;
}

export async function ensureDriveRootFolder(): Promise<{ id: string; name: string }> {
  const escapedName = ROOT_FOLDER_NAME.replace(/'/g, "\\'");
  const query = encodeURIComponent(`name = '${escapedName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
  const result = await driveRequest<{ files: Array<{ id: string; name: string }> }>(`/files?q=${query}&spaces=drive&fields=files(id,name)&pageSize=1`);
  if (result.files[0]) return result.files[0];
  return driveRequest('/files?fields=id,name', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: ROOT_FOLDER_NAME, mimeType: 'application/vnd.google-apps.folder' }),
  });
}

export async function makeDriveImagePublicReadOnly(fileId: string): Promise<DriveImageFile> {
  await requireCmsAdmin();
  return ensurePublicDriveImage(fileId, driveRequest);
}

export async function uploadDriveFile(file: File): Promise<DriveImageFile> {
  const root = await ensureDriveRootFolder();
  const token = accessToken || await requestAccessToken();
  await requireCmsAdmin();
  const metadata = { name: file.name, mimeType: file.type || 'application/octet-stream', parents: [root.id] };
  const boundary = `drive-upload-${crypto.randomUUID()}`;
  const body = new Blob([
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n`,
    JSON.stringify(metadata),
    `\r\n--${boundary}\r\nContent-Type: ${metadata.mimeType}\r\n\r\n`,
    file,
    `\r\n--${boundary}--`,
  ]);
  const response = await fetch(`${UPLOAD_API}?uploadType=multipart&fields=id,name,mimeType,webViewLink,thumbnailLink`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body,
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`No se pudo subir el archivo a Drive (${response.status}): ${message.slice(0, 240)}`);
  }
  const uploaded = await response.json() as DriveImageFile;
  if (!uploaded.mimeType.startsWith('image/')) return uploaded;
  try {
    return await makeDriveImagePublicReadOnly(uploaded.id);
  } catch {
    // Keep the successful upload in the library so the author can retry sharing.
    // Never report public access when a Workspace policy or Drive request fails.
    return { ...uploaded, publicRead: false, sharingError: 'La imagen se subió a Drive, pero no se pudo configurar el acceso público de lectura. Conecta Drive y pulsa «Hacer pública (lector)» para reintentar. Si vuelve a fallar, revisa las restricciones de tu organización.' };
  }
}

export async function getDriveThumbnailObjectUrl(fileId: string): Promise<string | null> {
  if (!accessToken) return null;
  try {
    await requireCmsAdmin();
    const headers = { Authorization: `Bearer ${accessToken}` };
    const metadataResponse = await fetch(`${DRIVE_API}/files/${encodeURIComponent(fileId)}?fields=thumbnailLink,mimeType,size`, { headers });
    if (!metadataResponse.ok) return null;
    const metadata = await metadataResponse.json() as { thumbnailLink?: string; mimeType?: string; size?: string };
    if (metadata.thumbnailLink) {
      try {
        const thumbnail = new URL(metadata.thumbnailLink);
        if (thumbnail.protocol === 'https:' && (thumbnail.hostname.endsWith('.googleusercontent.com') || thumbnail.hostname.endsWith('.google.com'))) {
          const response = await fetch(thumbnail.href, { headers });
          if (response.ok && response.headers.get('Content-Type')?.startsWith('image/')) return URL.createObjectURL(await response.blob());
        }
      } catch { /* Some thumbnail hosts reject CORS. Try the authenticated image API. */ }
    }
    if (!metadata.mimeType?.startsWith('image/') || Number(metadata.size || 0) > 20 * 1024 * 1024) return null;
    const response = await fetch(`${DRIVE_API}/files/${encodeURIComponent(fileId)}?alt=media`, { headers });
    if (!response.ok || !response.headers.get('Content-Type')?.startsWith('image/')) return null;
    return URL.createObjectURL(await response.blob());
  } catch { return null; }
}

export function isDriveConfigured(): boolean {
  return Boolean(CLIENT_ID);
}
