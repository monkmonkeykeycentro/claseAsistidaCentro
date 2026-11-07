import { BSON } from 'mongodb';
import { createHash } from 'node:crypto';
import { parsePath, storedDocument } from '../server/dataModel.mjs';
const { Binary, Double, EJSON, Long } = BSON;

export function decodeValue(value) {
  if ('nullValue' in value) return null;
  if ('stringValue' in value) return value.stringValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('integerValue' in value) {
    const integer = BigInt(value.integerValue);
    return integer <= BigInt(Number.MAX_SAFE_INTEGER) && integer >= BigInt(Number.MIN_SAFE_INTEGER) ? Number(integer) : Long.fromString(value.integerValue);
  }
  if ('doubleValue' in value) {
    const number = Number(value.doubleValue);
    return Number.isFinite(number) ? number : new Double(number);
  }
  if ('timestampValue' in value) {
    // Keep the full nanosecond timestamp string; JS Date would truncate precision.
    return value.timestampValue;
  }
  if ('bytesValue' in value) return Binary.createFromBase64(value.bytesValue);
  if ('referenceValue' in value) return value.referenceValue;
  if ('geoPointValue' in value) return { ...value.geoPointValue };
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(decodeValue);
  if ('mapValue' in value) return decodeFields(value.mapValue.fields || {});
  throw new Error('Tipo de Firestore no admitido; se canceló la importación para evitar pérdida de datos.');
}
export function decodeFields(fields) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, decodeValue(value)]));
}
export function parseSnapshot(snapshot) {
  if (!['firestore-cms-snapshot/1', 'firestore-local-snapshot/1'].includes(snapshot.format) || !Array.isArray(snapshot.documents)) {
    throw new Error('Usa un snapshot .firestore.json o el archivo creado por npm run firebase:export-local. Los respaldos .cms.json no incluyen todos los datos.');
  }
  const paths = new Set();
  const documents = snapshot.documents.map((document) => {
    parsePath(document.path);
    if (paths.has(document.path)) throw new Error(`Ruta repetida: ${document.path}`);
    paths.add(document.path);
    if (!document.fields || typeof document.fields !== 'object' || Array.isArray(document.fields)) throw new Error('Documento sin fields válidos.');
    return storedDocument(document.path, decodeFields(document.fields));
  });
  return documents.sort((a, b) => a._id.localeCompare(b._id));
}
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
  return value;
}
export function digest(value) {
  return createHash('sha256').update(JSON.stringify(canonical(EJSON.serialize(value, { relaxed: false })))).digest('hex');
}
export function summarize(documents) {
  const collections = {};
  for (const document of documents) {
    const { collection } = parsePath(document._id);
    collections[collection] = (collections[collection] || 0) + 1;
  }
  return { documents: documents.length, collections, sha256: digest(documents) };
}
