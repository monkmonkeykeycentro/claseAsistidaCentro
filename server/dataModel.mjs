export const cmsCollections = [
  'cms_modules', 'cms_categories', 'cms_lessons', 'cms_sections', 'cms_blocks', 'cms_nodes',
  'cms_node_relations', 'cms_node_blocks', 'cms_site_content', 'cms_media', 'cms_revisions',
];
export const userCollections = ['progress', 'pilot_evidences', 'curriculum_evidences', 'class_designs'];
const validId = /^[a-zA-Z0-9_-]{1,128}$/;
export function fail(message, status = 400, code = 'invalid-argument') {
  throw Object.assign(new Error(message), { status, code });
}
export function parsePath(path, document = true) {
  if (typeof path !== 'string') fail('Ruta no válida.');
  const parts = path.split('/');
  if (!parts.every((part) => validId.test(part))) fail('Identificador no válido.');
  const root = parts[0];
  const nested = root === 'users' && userCollections.includes(parts[2]);
  const length = nested ? (document ? 4 : 3) : (document ? 2 : 1);
  if (parts.length !== length || ![...cmsCollections, 'users', 'admins'].includes(root)) fail('Ruta no admitida.');
  return { path, parts, collection: nested ? `users_${parts[2]}` : root, parentPath: parts.slice(0, -1).join('/') };
}
export function validateData(value, depth = 0) {
  if (depth > 40) fail('Documento demasiado anidado.');
  if (value === null || ['string', 'boolean'].includes(typeof value)) return;
  if (typeof value === 'number' && Number.isFinite(value)) return;
  if (Array.isArray(value)) { value.forEach((item) => validateData(item, depth + 1)); return; }
  if (!value || typeof value !== 'object' || Object.getPrototypeOf(value) !== Object.prototype) fail('Valor de documento no válido.');
  for (const [key, item] of Object.entries(value)) {
    if (!key || key.includes('.') || key.startsWith('$') || ['__proto__', 'constructor', 'prototype'].includes(key)) fail('Campo no permitido.');
    validateData(item, depth + 1);
  }
}
export function mergeData(previous, patch) {
  const result = { ...previous };
  for (const [key, value] of Object.entries(patch)) {
    result[key] = value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length
      ? mergeData(previous?.[key] && typeof previous[key] === 'object' && !Array.isArray(previous[key]) ? previous[key] : {}, value)
      : value;
  }
  return result;
}
export function storedDocument(path, data) {
  const target = parsePath(path);
  return { _id: path, parentPath: target.parentPath, data };
}
