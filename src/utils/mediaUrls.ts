import type { CmsMediaResource } from '../types/cms';

export function safeMediaUrl(value: string): string | undefined {
  try {
    const url = new URL(value.trim());
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : undefined;
  } catch { return undefined; }
}

export function driveFileUrls(value: string): { id: string; view: string; preview: string; image: string; thumbnail: string } | undefined {
  const safe = safeMediaUrl(value);
  if (!safe) return undefined;
  const url = new URL(safe);
  const isImageHost = /^lh[3-6]\.googleusercontent\.com$/.test(url.hostname);
  if (!isImageHost && !['drive.google.com', 'www.drive.google.com', 'drive.usercontent.google.com'].includes(url.hostname)) return undefined;
  const id = isImageHost ? url.pathname.match(/^\/d\/([\w-]+)(?:=|$)/)?.[1]
    : url.pathname.match(/^\/file\/d\/([\w-]+)(?:\/|$)/)?.[1]
      || (['/open', '/uc', '/thumbnail', '/download'].includes(url.pathname) ? url.searchParams.get('id') : null);
  if (!id || !/^[\w-]+$/.test(id)) return undefined;
  const resourceKey = url.searchParams.get('resourcekey');
  const withKey = (target: URL) => {
    if (resourceKey) target.searchParams.set('resourcekey', resourceKey);
    return target.href;
  };
  const thumbnail = new URL('https://drive.google.com/thumbnail');
  thumbnail.searchParams.set('id', id);
  thumbnail.searchParams.set('sz', 'w1600');
  return { id, view: withKey(new URL(`https://drive.google.com/file/d/${id}/view`)), preview: withKey(new URL(`https://drive.google.com/file/d/${id}/preview`)), image: withKey(new URL(`https://lh3.googleusercontent.com/d/${id}=w1600`)), thumbnail: withKey(thumbnail) };
}

export function publicImageSources(value: string): string[] {
  const safe = safeMediaUrl(value);
  if (!safe) return [];
  const drive = driveFileUrls(safe);
  if (!drive) return [safe];
  // Keep already-direct image URLs intact; viewer links need a public image URL.
  const direct = /^lh[3-6]\.googleusercontent\.com$/.test(new URL(safe).hostname) ? safe : drive.image;
  return [...new Set([direct, drive.image, drive.thumbnail])];
}

export function mediaResourceUrl(resource: CmsMediaResource): string {
  // Keep persistent viewer URLs in CMS records, never OAuth tokens, blob URLs or
  // the short-lived thumbnailLink returned by the Drive API.
  const stable = resource.driveWebViewLink || resource.url || resource.driveShortUrl || '';
  const drive = driveFileUrls(stable);
  if (drive) return drive.view;
  if (resource.provider === 'google-drive' && resource.driveFileId && /^[\w-]+$/.test(resource.driveFileId)) {
    return `https://drive.google.com/file/d/${resource.driveFileId}/view`;
  }
  return safeMediaUrl(stable) || '';
}

export function mediaResourceKind(resource: CmsMediaResource): 'image' | 'video' | 'audio' | 'document' | 'unknown' {
  const mime = resource.mimeType || '';
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime) return 'document';
  const name = `${resource.title} ${safeMediaUrl(resource.url) ? new URL(resource.url).pathname : ''}`;
  if (/\.(png|jpe?g|gif|webp|avif|svg)(?:\s|$)/i.test(name) || /imagen|diagrama/i.test(resource.category || '')) return 'image';
  if (/\.(mp4|webm|ogv|mov)(?:\s|$)/i.test(name) || /video/i.test(resource.category || '')) return 'video';
  if (/\.(mp3|wav|m4a|ogg)(?:\s|$)/i.test(name)) return 'audio';
  if (/\.(pdf|docx?|pptx?|xlsx?)(?:\s|$)/i.test(name)) return 'document';
  return 'unknown';
}
