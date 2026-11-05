export interface GithubSketchSource {
  code: string;
  rawUrl: string;
  baseUrl: string;
  entry: string;
}

interface GithubRepository {
  default_branch: string;
}

interface GithubTreeEntry {
  path: string;
  type: 'blob' | 'tree';
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function resolveDataAssetPaths(code: string, tree: GithubTreeEntry[], p5Directory: string): string {
  const dataFiles = tree
    .filter((item) => item.type === 'blob' && item.path.startsWith(`${p5Directory}/data/`))
    .map((item) => item.path.slice(`${p5Directory}/data/`.length))
    .filter((path) => !path.includes('/'));

  return dataFiles.reduce((result, fileName) => {
    const escaped = escapeRegExp(fileName);
    const callPattern = new RegExp(`((?:loadImage|loadSound|createVideo|loadFont|loadStrings|loadJSON)\\s*\\(\\s*)(["'])${escaped}\\2`, 'g');
    return result.replace(callPattern, '$1$2data/' + fileName + '$2');
  }, code);
}

function parseRepositoryUrl(repositoryUrl: string): { owner: string; repo: string } {
  let url: URL;
  try {
    url = new URL(repositoryUrl);
  } catch {
    throw new Error('El enlace del repositorio no es válido.');
  }

  if (url.protocol !== 'https:' || url.hostname !== 'github.com') {
    throw new Error('Solo se admiten repositorios públicos de github.com.');
  }

  const [owner, repo] = url.pathname.split('/').filter(Boolean);
  if (!owner || !repo || repo.includes('.')) {
    throw new Error('Usa un enlace con el formato https://github.com/usuario/repositorio.');
  }
  return { owner, repo: repo.replace(/\.git$/, '') };
}

export async function fetchGithubSketchSource(
  repositoryUrl: string,
  entry?: string,
): Promise<GithubSketchSource> {
  const { owner, repo } = parseRepositoryUrl(repositoryUrl);
  const requestedEntry = entry?.trim().replace(/^\/+/, '');
  if (requestedEntry?.includes('..')) {
    throw new Error('La ruta del archivo de entrada no es válida.');
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 10000);
  let repositoryResponse: Response;
  try {
    repositoryResponse = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('GitHub tardó demasiado en responder.');
    }
    throw new Error('No se pudo conectar con GitHub.');
  } finally {
    window.clearTimeout(timeout);
  }
  if (!repositoryResponse.ok) {
    if (repositoryResponse.status === 403) throw new Error('GitHub rechazó la consulta temporalmente. Intenta de nuevo en unos minutos.');
    throw new Error('No se pudo encontrar el repositorio. Confirma que sea público.');
  }
  const repository = await repositoryResponse.json() as GithubRepository;
  const branch = repository.default_branch || 'main';
  const treeResponse = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(branch)}?recursive=1`);
  if (!treeResponse.ok) throw new Error('No se pudo leer la estructura del repositorio.');
  const tree = await treeResponse.json() as { tree?: GithubTreeEntry[]; truncated?: boolean };
  if (tree.truncated) throw new Error('El repositorio es demasiado grande para detectar su estructura.');

  const rootDirectories = (tree.tree || [])
    .filter((item) => item.type === 'tree' && !item.path.includes('/'))
    .map((item) => item.path);
  const p5Directory = rootDirectories.find((directory) => directory.endsWith('_p5'));
  const javaDirectories = rootDirectories.filter((directory) => !directory.endsWith('_p5'));
  if (!p5Directory || javaDirectories.length !== 1) {
    throw new Error('El repositorio debe tener una carpeta Java y una carpeta con sufijo _p5 en la raíz.');
  }

  const jsFiles = (tree.tree || [])
    .filter((item) => item.type === 'blob' && item.path.startsWith(`${p5Directory}/`) && item.path.toLowerCase().endsWith('.js'))
    .map((item) => item.path);
  if (!requestedEntry && jsFiles.length !== 1) {
    throw new Error(`La carpeta ${p5Directory} debe contener un único archivo .js.`);
  }
  const cleanEntry = requestedEntry || jsFiles[0];
  if (!cleanEntry) throw new Error('No se encontró el archivo .js de p5.js.');
  const rawUrl = `https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodeURIComponent(branch)}/${cleanEntry.split('/').map(encodeURIComponent).join('/')}`;
  const response = await fetch(rawUrl);
  if (!response.ok) {
    throw new Error(`No se encontró ${cleanEntry} en la rama ${branch}.`);
  }

  return {
    code: resolveDataAssetPaths(await response.text(), tree.tree || [], p5Directory),
    rawUrl,
    baseUrl: rawUrl.slice(0, rawUrl.lastIndexOf('/') + 1),
    entry: cleanEntry,
  };
}
