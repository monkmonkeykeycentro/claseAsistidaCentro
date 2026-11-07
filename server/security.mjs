import { fail } from './dataModel.mjs';

export function isConfiguredAdmin(user, environment = process.env) {
  if (!user?.uid) return false;
  const ids = (environment.CMS_ADMIN_UIDS || '').split(',').map((value) => value.trim()).filter(Boolean);
  if (ids.some((id) => !/^[a-zA-Z0-9_-]{1,128}$/.test(id))) fail('Configuración de administradores no válida.', 503, 'unavailable');
  return ids.includes(user.uid);
}

const privateKeys = new Set([
  'uid', 'userid', 'useremail', 'email', 'owneruid', 'ownerid', 'owneremail',
  'createdby', 'updatedby', 'exportedby', 'lasteditedby', 'editedby',
  'accesstoken', 'refreshtoken', 'idtoken', 'authorization', 'password',
  'clientsecret', 'privatekey', 'apikey', 'mongodburi', 'connectionstring',
]);
export function isPrivateField(field) {
  return field.split('.').some((part) => privateKeys.has(part.replace(/[_-]/g, '').toLowerCase()));
}
export function publicDocument(data, collection) {
  function clean(value) {
    if (Array.isArray(value)) return value.map(clean);
    if (!value || typeof value !== 'object' || Object.getPrototypeOf(value) !== Object.prototype) return value;
    return Object.fromEntries(Object.entries(value).filter(([key]) => !isPrivateField(key)).map(([key, item]) => [key, clean(item)]));
  }
  const result = clean(data);
  // Tool configuration is stored as serialized JSON, including template projects.
  if (collection === 'cms_site_content' && typeof result?.content === 'string') {
    try {
      const value = JSON.parse(result.content);
      if (value && typeof value === 'object') result.content = JSON.stringify(clean(value));
    } catch { /* Prose and HTML content are not JSON. */ }
  }
  return result;
}
