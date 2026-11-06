export interface GithubSketchSource {
  code: string;
  codeJava: string;
  javaEntry: string;
  rawUrl: string;
  baseUrl: string;
  /** Repository-relative path, including the selected directory. */
  entry: string;
}

interface GithubTreeEntry {
  path: string;
  type: 'blob' | 'tree';
}

interface GithubTree {
  tree: GithubTreeEntry[];
  truncated?: boolean;
}

function parseRepositoryUrl(repositoryUrl: string) {
  let url: URL;
  let parts: string[];
  try {
    url = new URL(repositoryUrl.trim());
    parts = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
  } catch {
    throw new Error('El enlace del repositorio no es válido.');
  }
  if (url.protocol !== 'https:' || url.hostname !== 'github.com' || url.port || url.username || url.password) {
    throw new Error('Solo se admiten repositorios públicos de github.com.');
  }
  const [owner, repository, view, ...location] = parts;
  const repo = repository?.replace(/\.git$/, '');
  if (!owner || !repo || (view && (view !== 'tree' || !location.length))) {
    throw new Error('Usa https://github.com/usuario/repositorio o un enlace a una carpeta /tree/rama/carpeta.');
  }
  return { owner, repo, location };
}

function githubRequest<T>(url: string, format: 'json' | 'text', message: string, allowMissing?: false): Promise<T>;
function githubRequest<T>(url: string, format: 'json' | 'text', message: string, allowMissing: true): Promise<T | null>;
async function githubRequest<T>(url: string, format: 'json' | 'text', message: string, allowMissing = false): Promise<T | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: controller.signal,
    });
    if (allowMissing && response.status === 404) return null;
    if (response.status === 403 || response.status === 429) {
      throw new Error('GitHub rechazó la consulta temporalmente. Intenta de nuevo en unos minutos.');
    }
    if (!response.ok) throw new Error(message);
    return await (format === 'json' ? response.json() : response.text()) as T;
  } catch (error) {
    if (controller.signal.aborted) throw new Error('GitHub tardó demasiado en responder.');
    if (error instanceof TypeError) throw new Error('No se pudo conectar con GitHub.');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function relativePath(fromDirectory: string, to: string): string {
  const from = fromDirectory.split('/');
  const target = to.split('/');
  while (from.length && target.length && from[0] === target[0]) {
    from.shift();
    target.shift();
  }
  return [...from.map(() => '..'), ...target].join('/');
}

function resolveDataAssetPaths(code: string, tree: GithubTreeEntry[], p5Directory: string, entry: string): string {
  const entryDirectory = entry.slice(0, entry.lastIndexOf('/'));
  const dataFiles = tree.filter((item) => item.type === 'blob' && item.path.startsWith(`${p5Directory}/data/`));
  return dataFiles.reduce((result, file) => {
    const name = file.path.slice(`${p5Directory}/data/`.length);
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`((?:loadImage|loadSound|createVideo|loadFont|loadStrings|loadJSON)\\s*\\(\\s*)(["'])(?:data/)?${escaped}\\2`, 'g');
    const path = relativePath(entryDirectory, file.path);
    return result.replace(pattern, (_match, call, quote) => `${call}${quote}${path}${quote}`);
  }, code);
}

async function loadGithubSketchSource(repositoryUrl: string, entry?: string): Promise<GithubSketchSource> {
  const { owner, repo, location } = parseRepositoryUrl(repositoryUrl);
  const requestedEntry = entry?.trim().replace(/^\/+/, '');
  if (requestedEntry && (requestedEntry.includes('\\') || requestedEntry.split('/').some((part) => !part || part === '..' || part === '.'))) {
    throw new Error('La ruta del archivo de entrada no es válida.');
  }
  const apiUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  const repository = await githubRequest<{ default_branch: string }>(apiUrl, 'json', 'No se pudo encontrar el repositorio. Confirma que sea público.');
  const defaultBranch = repository.default_branch || 'main';
  // Prefer the default branch when it matches the URL. Otherwise try the longest
  // ref first, so branches such as feature/ejemplos also work in folder URLs.
  const refs = location.length
    ? Array.from({ length: location.length }, (_, index) => ({ ref: location.slice(0, location.length - index).join('/'), length: location.length - index }))
    : [{ ref: defaultBranch, length: 0 }];
  const preferred = refs.findIndex(({ ref }) => ref === defaultBranch);
  if (preferred > 0) refs.unshift(...refs.splice(preferred, 1));
  let branch = '';
  let directory = '';
  let tree: GithubTree | null = null;
  for (const candidate of refs) {
    tree = await githubRequest<GithubTree>(`${apiUrl}/git/trees/${encodeURIComponent(candidate.ref)}?recursive=1`, 'json', 'No se pudo leer la estructura del repositorio.', true);
    if (tree) {
      branch = candidate.ref;
      directory = location.slice(candidate.length).join('/');
      break;
    }
  }
  if (!tree) throw new Error('No se encontró la rama o referencia indicada en el enlace de GitHub.');
  if (tree.truncated) throw new Error('El repositorio es demasiado grande para detectar su estructura.');
  if (directory && !tree.tree.some((item) => item.type === 'tree' && item.path === directory)) {
    throw new Error(`No se encontró la carpeta ${directory} en la rama ${branch}.`);
  }
  const prefix = directory ? `${directory}/` : '';
  const directories = tree.tree.filter((item) => item.type === 'tree' && item.path.startsWith(prefix) && !item.path.slice(prefix.length).includes('/')).map((item) => item.path);
  let p5Directories = directories.filter((path) => path.endsWith('_p5'));
  // Entry overrides may be relative to the selected folder or to the repository
  // root (the latter is how existing CMS documents store detected entries).
  const entryCandidates = requestedEntry ? [requestedEntry, `${prefix}${requestedEntry}`] : [];
  if (requestedEntry) p5Directories = p5Directories.filter((path) => entryCandidates.some((candidate) => candidate.startsWith(`${path}/`)));
  if (p5Directories.length !== 1) {
    throw new Error(`En ${directory || 'la raíz'} debe haber una carpeta con sufijo _p5. Si hay varias, indica su archivo .js de entrada o enlaza la carpeta del ejercicio.`);
  }
  const p5Directory = p5Directories[0];
  const jsFiles = tree.tree.filter((item) => item.type === 'blob' && item.path.startsWith(`${p5Directory}/`) && item.path.toLowerCase().endsWith('.js')).map((item) => item.path);
  const cleanEntry = requestedEntry ? entryCandidates.find((path) => jsFiles.includes(path)) : jsFiles.length === 1 ? jsFiles[0] : undefined;
  if (!cleanEntry) throw new Error(requestedEntry
    ? `El archivo de entrada debe ser un .js existente dentro de ${p5Directory}.`
    : `La carpeta ${p5Directory} debe contener un único archivo .js o debes indicar el archivo de entrada.`);

  const javaFilesIn = (folder: string) => tree.tree.filter((item) => item.type === 'blob' && item.path.startsWith(`${folder}/`) && !item.path.slice(folder.length + 1).includes('/') && item.path.toLowerCase().endsWith('.pde')).map((item) => item.path);
  const matchingDirectory = p5Directory.slice(0, -3);
  const javaDirectories = directories.filter((path) => !path.endsWith('_p5') && javaFilesIn(path).length);
  const javaDirectory = javaDirectories.includes(matchingDirectory) ? matchingDirectory : javaDirectories.length === 1 ? javaDirectories[0] : undefined;
  if (!javaDirectory) throw new Error(`No se encontró una carpeta Java con archivos .pde correspondiente a ${p5Directory}.`);
  const mainJavaFile = `${javaDirectory}/${javaDirectory.split('/').at(-1)}.pde`;
  const javaFiles = javaFilesIn(javaDirectory).sort((a, b) => a === mainJavaFile ? -1 : b === mainJavaFile ? 1 : a.localeCompare(b));
  const rawBase = `https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodeURIComponent(branch)}/`;
  const rawFileUrl = (path: string) => rawBase + path.split('/').map(encodeURIComponent).join('/');
  const rawUrl = rawFileUrl(cleanEntry);
  const [code, ...javaTabs] = await Promise.all([cleanEntry, ...javaFiles].map((path) => githubRequest<string>(rawFileUrl(path), 'text', `No se encontró ${path} en la rama ${branch}.`)));
  return {
    code: resolveDataAssetPaths(code, tree.tree, p5Directory, cleanEntry),
    codeJava: javaTabs.map((tab, index) => javaTabs.length === 1 ? tab : `// ${javaFiles[index].split('/').at(-1)}\n${tab}`).join('\n\n'),
    javaEntry: javaFiles[0],
    rawUrl,
    baseUrl: rawUrl.slice(0, rawUrl.lastIndexOf('/') + 1),
    entry: cleanEntry,
  };
}

// A code block and its thumbnail can request the same source together. Share only
// pending downloads; later loads still receive current repository contents.
const pending = new Map<string, Promise<GithubSketchSource>>();
export function fetchGithubSketchSource(repositoryUrl: string, entry?: string): Promise<GithubSketchSource> {
  const key = JSON.stringify([repositoryUrl.trim(), entry?.trim() || '']);
  let request = pending.get(key);
  if (!request) {
    request = loadGithubSketchSource(repositoryUrl, entry).finally(() => pending.delete(key));
    pending.set(key, request);
  }
  return request;
}
