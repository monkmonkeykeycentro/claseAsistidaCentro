import { isDeepStrictEqual } from 'node:util';

const encodePath = (value) => value.split('/').map(encodeURIComponent).join('/');

export function createFirestoreReader({ origin, databaseRoot, authorization, fetchImpl = fetch }) {
  const baseUrl = `${origin}/v1/${databaseRoot}/documents`;
  async function request(suffix, options = {}) {
    const response = await fetchImpl(`${baseUrl}${suffix}`, {
      ...options,
      headers: { Authorization: authorization, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(60000),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(`Firestore HTTP ${response.status}: ${result.error?.message ?? 'No se pudo leer la colección.'}`);
    return result;
  }
  return {
    databaseRoot,
    async listCollections(parent = '') {
      const collections = [];
      let pageToken;
      do {
        const result = await request(`${parent ? `/${encodePath(parent)}` : ''}:listCollectionIds`, {
          method: 'POST', body: JSON.stringify({ pageSize: 100, ...(pageToken ? { pageToken } : {}) }),
        });
        collections.push(...(result.collectionIds ?? []));
        pageToken = result.nextPageToken;
      } while (pageToken);
      return collections;
    },
    async listDocuments(collectionPath) {
      const documents = [];
      let pageToken;
      do {
        const query = new URLSearchParams({ pageSize: '300', showMissing: 'true' });
        if (pageToken) query.set('pageToken', pageToken);
        const result = await request(`/${encodePath(collectionPath)}?${query}`);
        documents.push(...(result.documents ?? []));
        pageToken = result.nextPageToken;
      } while (pageToken);
      return documents;
    },
  };
}

export async function collectCmsDocuments(reader) {
  const roots = (await reader.listCollections()).filter((name) => name.startsWith('cms_')).sort();
  const queue = [...roots];
  const documents = [];
  const prefix = `${reader.databaseRoot}/documents/`;
  while (queue.length) {
    const collectionPath = queue.shift();
    const listed = await reader.listDocuments(collectionPath);
    for (let start = 0; start < listed.length; start += 8) {
      await Promise.all(listed.slice(start, start + 8).map(async (document) => {
        if (!document.name?.startsWith(prefix)) throw new Error('Firestore devolvió un documento de otra base.');
        const documentPath = document.name.slice(prefix.length);
        if (document.fields || document.createTime || document.updateTime) {
          documents.push({ path: documentPath, fields: document.fields ?? {}, ...(document.updateTime ? { sourceUpdateTime: document.updateTime } : {}) });
        }
        // A parent can be missing while its subcollections still contain documents.
        const children = await reader.listCollections(documentPath);
        queue.push(...children.map((name) => `${documentPath}/${name}`));
      }));
    }
  }
  documents.sort((a, b) => a.path.localeCompare(b.path));
  return documents;
}

export function remapFields(fields, sourceRoot, targetRoot) {
  function visit(value) {
    if (Array.isArray(value)) return value.map(visit);
    if (!value || typeof value !== 'object') return value;
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key,
      key === 'referenceValue' && typeof child === 'string' && child.startsWith(`${sourceRoot}/documents/`)
        ? `${targetRoot}${child.slice(sourceRoot.length)}` : visit(child),
    ]));
  }
  return visit(fields);
}

function normalizeValue(value) {
  if (value.mapValue) return { mapValue: { fields: normalizeFields(value.mapValue.fields ?? {}) } };
  if (value.arrayValue) return { arrayValue: { values: (value.arrayValue.values ?? []).map(normalizeValue) } };
  return value;
}

function normalizeFields(fields) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, normalizeValue(value)]));
}

export async function importToLocal({ origin, projectId, documents, sourceRoot, fetchImpl = fetch }) {
  const target = new URL(origin);
  if (target.protocol !== 'http:' || !['127.0.0.1', 'localhost', '[::1]'].includes(target.hostname) || !projectId.startsWith('demo-')) {
    throw new Error('La importación solo permite un emulador en localhost y un proyecto demo-.');
  }
  const targetRoot = `projects/${projectId}/databases/(default)`;
  for (const document of documents) {
    const segments = document.path.split('/');
    if (!segments[0].startsWith('cms_') || segments.length % 2 !== 0 || segments.some((part) => !part || part === '.' || part === '..')) {
      throw new Error(`Ruta de documento no válida: ${document.path}`);
    }
  }
  for (let start = 0; start < documents.length; start += 8) {
    await Promise.all(documents.slice(start, start + 8).map(async (document) => {
      const fields = remapFields(document.fields, sourceRoot, targetRoot);
      const url = `${origin}/v1/${targetRoot}/documents/${encodePath(document.path)}`;
      const response = await fetchImpl(url, {
        method: 'PATCH', headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields }), signal: AbortSignal.timeout(60000),
      });
      const saved = await response.json();
      if (!response.ok) throw new Error(`No se pudo importar ${document.path}: HTTP ${response.status}`);
      if (!isDeepStrictEqual(normalizeFields(saved.fields ?? {}), normalizeFields(fields))) {
        throw new Error(`Los campos importados no coinciden en ${document.path}.`);
      }
    }));
  }
}

export function summarizeDocuments(documents) {
  return documents.reduce((counts, document) => {
    const root = document.path.split('/')[0];
    counts[root] = (counts[root] ?? 0) + 1;
    return counts;
  }, {});
}

export function makeCmsBackup(documents, exportedAt, exportedBy) {
  function decode(value) {
    if ('nullValue' in value) return null;
    if ('booleanValue' in value) return value.booleanValue;
    if ('integerValue' in value || 'doubleValue' in value) return Number(value.integerValue ?? value.doubleValue);
    if ('mapValue' in value) return decodeFields(value.mapValue.fields ?? {});
    if ('arrayValue' in value) return (value.arrayValue.values ?? []).map(decode);
    return value.stringValue ?? value.timestampValue ?? value.referenceValue ?? value.bytesValue ?? value.geoPointValue;
  }
  function decodeFields(fields) { return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, decode(value)])); }
  const groups = {
    cms_modules: 'modules', cms_lessons: 'lessons', cms_sections: 'sections', cms_blocks: 'blocks',
    cms_site_content: 'siteContent', cms_media: 'media', cms_categories: 'categories',
    cms_nodes: 'nodes', cms_node_relations: 'nodeRelations', cms_node_blocks: 'nodeBlocks',
  };
  const result = { version: '1.1.0', exportedAt, exportedBy, ...Object.fromEntries(Object.values(groups).map((name) => [name, []])) };
  for (const document of documents) {
    const [collection, id, ...nested] = document.path.split('/');
    if (!groups[collection] || nested.length) continue;
    result[groups[collection]].push({ ...decodeFields(document.fields), [collection === 'cms_site_content' ? 'key' : 'id']: id });
  }
  return result;
}
