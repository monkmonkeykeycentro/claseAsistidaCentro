import { cmsCollections, fail, mergeData, parsePath, storedDocument, validateData } from './dataModel.mjs';
import { isConfiguredAdmin, isPrivateField, publicDocument } from './security.mjs';

const published = (data) => data?.status === 'published' && data?.visible === true;
export function createDataService(db, client) {
  const readCache = new Map();
  async function read(path, session) {
    const target = parsePath(path);
    if (!session && readCache.has(path)) return readCache.get(path);
    const data = (await db.collection(target.collection).findOne({ _id: path }, { session }))?.data;
    if (!session) readCache.set(path, data);
    return data;
  }
  async function isAdmin(user, session) {
    if (!user) return false;
    if (isConfiguredAdmin(user)) return true;
    return (await read(`admins/${user.uid}`, session)) !== undefined;
  }
  async function canRead(path, data, user, administrator, session) {
    const { parts } = parsePath(path);
    const [root, id] = parts;
    if (administrator) return true;
    if (root === 'admins' || root === 'users') return user?.uid === id;
    if (root === 'cms_site_content' || root === 'cms_media') return true;
    if (root === 'cms_categories') return data?.visible === true;
    if (root === 'cms_modules' || root === 'cms_nodes') return published(data);
    const publicModule = async (id) => typeof id === 'string' && published(await read(`cms_modules/${id}`, session));
    const publicLesson = async (id) => {
      if (typeof id !== 'string') return false;
      const lesson = await read(`cms_lessons/${id}`, session);
      return published(lesson) && await publicModule(lesson.moduleId);
    };
    if (root === 'cms_lessons') return published(data) && await publicModule(data.moduleId);
    if (root === 'cms_sections') return data?.visible === true && await publicLesson(data.lessonId);
    if (root === 'cms_blocks') {
      if (typeof data?.sectionId !== 'string') return false;
      const section = await read(`cms_sections/${data.sectionId}`, session);
      return section?.visible === true && await publicLesson(section.lessonId);
    }
    if (root === 'cms_node_relations') return data?.relationType === 'contains' && typeof data?.parentId === 'string' && published(await read(`cms_nodes/${data.parentId}`, session));
    if (root === 'cms_node_blocks') return typeof data?.nodeId === 'string' && published(await read(`cms_nodes/${data.nodeId}`, session));
    return false;
  }
  async function authorizeWrite(operation, previous, next, user, administrator) {
    const { parts } = parsePath(operation.path);
    const [root, id] = parts;
    if (cmsCollections.includes(root) || root === 'admins') {
      if (!administrator) fail('Esta cuenta no tiene permisos de administrador.', 403, 'permission-denied');
      return;
    }
    const owner = user?.uid === id;
    if (operation.type === 'delete') {
      if (!(administrator || (parts.length === 4 && owner))) fail('No puedes borrar estos datos.', 403, 'permission-denied');
      return;
    }
    if (parts.length === 4) {
      if (!owner || next.userId !== user.uid) fail('Solo puedes guardar tus propios datos.', 403, 'permission-denied');
      return;
    }
    if (previous === undefined) {
      if (!owner || next.uid !== user.uid || typeof next.email !== 'string' || next.email.length > 256 || typeof next.displayName !== 'string') {
        fail('Perfil de usuario no válido.', 403, 'permission-denied');
      }
    } else if ((!owner && !administrator) || next.uid !== previous.uid || next.email !== previous.email) {
      fail('No puedes modificar la identidad de este perfil.', 403, 'permission-denied');
    }
    // Roles in profiles are descriptive only; authorization always uses verified
    // identity and the protected admins collection.
  }
  return async function execute(body, user) {
    if (!body || typeof body !== 'object') fail('Solicitud no válida.');
    const administrator = await isAdmin(user);
    if (body.action === 'get') {
      const target = parsePath(body.path);
      if (['users', 'admins', 'cms_revisions'].includes(target.parts[0]) && !administrator && !(user?.uid === target.parts[1] && target.parts[0] !== 'cms_revisions')) {
        fail('No tienes acceso a estos datos.', 403, 'permission-denied');
      }
      if (target.parts[0] === 'admins' && target.parts[1] === user?.uid && isConfiguredAdmin(user)) return { data: { configured: true } };
      const data = await read(body.path);
      if (data !== undefined && !await canRead(body.path, data, user, administrator)) fail('Contenido no disponible para esta cuenta.', 403, 'permission-denied');
      return { data: data === undefined ? null : !administrator && cmsCollections.includes(target.parts[0]) ? publicDocument(data, target.parts[0]) : data };
    }
    if (body.action === 'list') {
      const target = parsePath(body.path, false);
      const root = target.parts[0];
      if (['admins', 'cms_revisions'].includes(root) && !administrator) fail('Acceso reservado a administradores.', 403, 'permission-denied');
      if (root === 'users' && !administrator && !(target.parts.length === 3 && user?.uid === target.parts[1])) fail('No tienes acceso a estos usuarios.', 403, 'permission-denied');
      if (!Array.isArray(body.constraints) || body.constraints.length > 12) fail('Consulta no válida.');
      const filters = [{ parentPath: body.path }];
      for (const constraint of body.constraints) {
        if (!constraint || !['where', 'orderBy'].includes(constraint.kind) || typeof constraint.field !== 'string' || !/^[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)*$/.test(constraint.field) || constraint.field.split('.').some((part) => ['__proto__', 'constructor', 'prototype'].includes(part))) fail('Filtro no admitido.');
        if (!administrator && cmsCollections.includes(root) && isPrivateField(constraint.field)) fail('No se pueden consultar metadatos privados.', 403, 'permission-denied');
        if (constraint.kind === 'where') {
          if (constraint.op !== '==' || !['string', 'number', 'boolean'].includes(typeof constraint.value)) fail('Solo se admiten filtros de igualdad con valores simples.');
          filters.push({ [`data.${constraint.field}`]: { $eq: constraint.value } });
        } else if (!['asc', 'desc'].includes(constraint.direction)) fail('Orden no válido.');
      }
      if (body.cursor !== undefined) {
        if (parsePath(body.cursor).parentPath !== body.path) fail('Cursor no válido.');
        filters.push({ _id: { $gt: body.cursor } });
      }
      const rows = await db.collection(target.collection).find({ $and: filters }).sort({ _id: 1 }).limit(200).toArray();
      const documents = [];
      for (const row of rows) {
        if (await canRead(row._id, row.data, user, administrator)) documents.push({ path: row._id, data: !administrator && cmsCollections.includes(root) ? publicDocument(row.data, root) : row.data });
      }
      return { documents, ...(rows.length === 200 ? { cursor: rows.at(-1)._id } : {}) };
    }
    if (body.action === 'commit') {
      if (!user) fail('Inicia sesión para guardar los cambios.', 401, 'unauthenticated');
      if (!Array.isArray(body.operations) || !body.operations.length || body.operations.length > 500) fail('El lote debe contener entre 1 y 500 operaciones.');
      // Validate the complete payload before starting any writes.
      for (const op of body.operations) {
        if (!op || !['set', 'update', 'delete'].includes(op.type)) fail('Operación no válida.');
        parsePath(op.path);
        if (op.type !== 'delete') {
          if (!op.data || typeof op.data !== 'object' || Array.isArray(op.data)) fail('El documento debe ser un objeto.');
          validateData(op.data);
        }
      }
      const session = client.startSession();
      try {
        await session.withTransaction(async () => {
          const adminInTransaction = await isAdmin(user, session);
          const groups = new Map();
          for (const op of body.operations) {
            const name = parsePath(op.path).collection;
            if (!groups.has(name)) groups.set(name, []);
            groups.get(name).push(op);
          }
          const previousData = new Map();
          for (const [name, operations] of groups) {
            const rows = await db.collection(name).find({ _id: { $in: operations.map((op) => op.path) } }, { session }).toArray();
            for (const row of rows) previousData.set(row._id, row.data);
          }
          const writes = new Map();
          for (const op of body.operations) {
            const target = parsePath(op.path);
            const previous = previousData.get(op.path);
            if (op.type === 'update' && previous === undefined) fail('El documento ya no existe.', 404, 'not-found');
            const next = op.type === 'delete' ? undefined : op.type === 'update' || op.merge === true ? mergeData(previous || {}, op.data) : op.data;
            await authorizeWrite(op, previous, next, user, adminInTransaction);
            if (!writes.has(target.collection)) writes.set(target.collection, []);
            if (op.type === 'delete') {
              previousData.delete(op.path);
              writes.get(target.collection).push({ deleteOne: { filter: { _id: op.path } } });
            } else {
              previousData.set(op.path, next);
              writes.get(target.collection).push({ replaceOne: { filter: { _id: op.path }, replacement: storedDocument(op.path, next), upsert: true } });
            }
          }
          for (const [name, operations] of writes) await db.collection(name).bulkWrite(operations, { session, ordered: true });
        }, { readConcern: { level: 'snapshot' }, writeConcern: { w: 'majority' } });
      } finally { await session.endSession(); }
      return { ok: true };
    }
    fail('Acción no admitida.');
  };
}
