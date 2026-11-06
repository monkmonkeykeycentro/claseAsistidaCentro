import { test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { driveFileUrls, mediaResourceKind, mediaResourceUrl, publicImageSources, safeMediaUrl } from '../src/utils/mediaUrls.ts';
import { CmsBlockView } from '../src/components/CmsBlockView.tsx';

const fileId = 'drive_file-123';
const view = `https://drive.google.com/file/d/${fileId}/view`;
const resource = { id: 'media-1', title: 'Diagrama.png', provider: 'google-drive', driveFileId: fileId, url: view, mimeType: 'image/png', createdAt: '' };
const render = (type, content) => renderToStaticMarkup(React.createElement(CmsBlockView, { block: { id: 'block-1', sectionId: 'section-1', type, content, caption: 'Referencia', position: 0, createdAt: '', updatedAt: '' } }));

test('Drive viewer, preview, download and legacy open links resolve to the same file', () => {
  for (const value of [view + '?usp=drivesdk', view.replace('/view', '/preview'), `https://drive.google.com/open?id=${fileId}`, `https://drive.google.com/uc?id=${fileId}&export=view`, `https://drive.usercontent.google.com/download?id=${fileId}`, `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`]) {
    const urls = driveFileUrls(value);
    assert.equal(urls.id, fileId);
    assert.equal(urls.preview, view.replace('/view', '/preview'));
    assert.equal(urls.image, `https://lh3.googleusercontent.com/d/${fileId}=w1600`);
    assert.equal(urls.thumbnail, `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`);
  }
});

test('resource keys survive copying links and rendering Drive images and videos', () => {
  const value = view + '?usp=sharing&resourcekey=0-file_key';
  const urls = driveFileUrls(value);
  for (const key of ['view', 'preview', 'image', 'thumbnail']) assert.equal(new URL(urls[key]).searchParams.get('resourcekey'), '0-file_key');
  assert.equal(mediaResourceUrl({ ...resource, driveWebViewLink: value }), urls.view);
  assert.match(render('image', value), /resourcekey=0-file_key/);
  assert.match(render('video', value), /\/preview\?resourcekey=0-file_key/);
});

test('image blocks render image URLs rather than the Drive HTML viewer page', () => {
  const html = render('image', view);
  assert.match(html, /<img[^>]+src="https:\/\/lh3.googleusercontent.com\/d\/drive_file-123=w1600"/);
  assert.doesNotMatch(html, /<img[^>]+src="[^\"]+\/view/);
  assert.doesNotMatch(html, /<iframe|Conectar Drive|Abrir imagen en Drive|cuenta autorizada/);
  assert.match(render('image', 'https://example.com/image.png'), /src="https:\/\/example.com\/image.png"/);
});

test('Drive videos and document frames use the embedded preview with access instructions', () => {
  for (const type of ['video', 'iframe']) {
    const html = render(type, view);
    assert.match(html, /src="https:\/\/drive.google.com\/file\/d\/drive_file-123\/preview"/);
    assert.match(html, /cuenta autorizada/);
    assert.match(html, /Abrir archivo en Drive/);
  }
  assert.match(render('resources', view), /href="https:\/\/drive.google.com\/file\/d\/drive_file-123\/view"/);
  assert.match(render('video', 'https://example.com/movie.mp4'), /<video/);
  assert.match(render('video', 'https://youtu.be/video123'), /https:\/\/www.youtube.com\/embed\/video123/);
});

test('the library keeps permanent file URLs and recognizes compatible media', () => {
  assert.equal(mediaResourceUrl({ ...resource, driveThumbnailLink: 'https://example.com/expires-soon' }), view);
  assert.equal(mediaResourceUrl({ ...resource, url: 'blob:temporary', driveWebViewLink: view }), view);
  assert.equal(mediaResourceKind(resource), 'image');
  assert.equal(mediaResourceKind({ ...resource, mimeType: 'video/mp4' }), 'video');
  assert.equal(mediaResourceKind({ ...resource, mimeType: 'audio/mpeg' }), 'audio');
  assert.equal(mediaResourceKind({ ...resource, mimeType: 'application/pdf' }), 'document');
  assert.equal(mediaResourceKind({ ...resource, mimeType: undefined }), 'image');
});

test('unsafe URLs, credentials and fake Drive hosts cannot become embedded media', () => {
  for (const value of ['javascript:alert(1)', 'data:text/html,evil', 'blob:private-preview', 'https://name:secret@drive.google.com/file/d/id/view']) {
    assert.equal(safeMediaUrl(value), undefined);
    assert.equal(driveFileUrls(value), undefined);
  }
  for (const value of ['https://drive.google.com.evil.example/file/d/id/view', 'https://example.com/?id=abc', 'https://drive.google.com/drive/folders/folder-id', 'https://drive.google.com/file/d/a%2Fb/view']) assert.equal(driveFileUrls(value), undefined);
  assert.doesNotMatch(render('image', 'javascript:alert(1)'), /<img|<iframe/);
});


test('public image loading uses image endpoints without OAuth or the Drive access viewer', () => {
  const sources = publicImageSources(view + '?resourcekey=public_key');
  assert.equal(sources.length, 2);
  assert.ok(sources.every((source) => new URL(source).searchParams.get('resourcekey') === 'public_key'));
  assert.ok(sources.every((source) => !source.includes('/preview') && !source.includes('/view')));
  const direct = `https://lh3.googleusercontent.com/d/${fileId}=s2048?resourcekey=public_key`;
  assert.equal(publicImageSources(direct)[0], direct);
  assert.deepEqual(publicImageSources('https://example.com/photo.png'), ['https://example.com/photo.png']);
  assert.deepEqual(publicImageSources('javascript:alert(1)'), []);
});
