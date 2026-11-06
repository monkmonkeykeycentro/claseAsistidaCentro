import { afterEach, test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { fetchGithubSketchSource } from '../src/services/githubRepositoryService.ts';

const repository = 'https://github.com/usuario/ejemplos';
const api = 'https://api.github.com/repos/usuario/ejemplos';
const java = 'void setup() { size(100, 100); }';
const js = 'function setup() { createCanvas(100, 100); }';
const files = {
  'Puntos/Puntos.pde': java,
  'Puntos_p5/Puntos.js': js,
  'a1/Coordenadas/Coordenadas.pde': '// Java de a1\n' + java,
  'a1/Coordenadas_p5/Coordenadas.js': '// p5 de a1\n' + js,
  'a10/Otro/Otro.pde': '// otro Java',
  'a10/Otro_p5/Otro.js': '// otro p5',
  'docs/README.md': 'Documentación',
};

function fixture({ sourceFiles = files, refs = ['main'], defaultBranch = 'main', status, truncated = false } = {}) {
  const calls = [];
  const tree = new Map();
  for (const path of Object.keys(sourceFiles)) {
    const parts = path.split('/');
    for (let i = 1; i < parts.length; i++) tree.set(parts.slice(0, i).join('/'), 'tree');
    tree.set(path, 'blob');
  }
  mock.method(globalThis, 'fetch', async (url) => {
    calls.push(url);
    if (status) return new Response('', { status });
    if (url === api) return Response.json({ default_branch: defaultBranch });
    if (url.startsWith(api + '/git/trees/')) {
      const ref = decodeURIComponent(url.slice((api + '/git/trees/').length).split('?')[0]);
      return refs.includes(ref)
        ? Response.json({ tree: [...tree].map(([path, type]) => ({ path, type })), truncated })
        : new Response('', { status: 404 });
    }
    for (const ref of refs) {
      const rawPrefix = `https://raw.githubusercontent.com/usuario/ejemplos/${encodeURIComponent(ref)}/`;
      if (!url.startsWith(rawPrefix)) continue;
      const path = url.slice(rawPrefix.length).split('/').map(decodeURIComponent).join('/');
      assert.ok(Object.hasOwn(sourceFiles, path), `Unexpected file: ${path}`);
      return new Response(sourceFiles[path]);
    }
    assert.fail(`Unexpected URL: ${url}`);
  });
  return calls;
}
afterEach(() => mock.restoreAll());

test('root URLs keep working with other exercise and documentation directories', async () => {
  fixture();
  const result = await fetchGithubSketchSource(repository);
  assert.equal(result.entry, 'Puntos_p5/Puntos.js');
  assert.equal(result.code, js);
  assert.equal(result.codeJava, java);
  assert.equal(result.javaEntry, 'Puntos/Puntos.pde');
});

test('folder URLs load only the selected exercise, including its Java counterpart', async () => {
  const calls = fixture();
  const result = await fetchGithubSketchSource(repository + '/tree/main/a1/');
  assert.equal(result.entry, 'a1/Coordenadas_p5/Coordenadas.js');
  assert.match(result.code, /p5 de a1/);
  assert.match(result.codeJava, /Java de a1/);
  assert.equal(result.baseUrl, 'https://raw.githubusercontent.com/usuario/ejemplos/main/a1/Coordenadas_p5/');
  assert.ok(calls.filter((url) => url.startsWith('https://raw.')).every((url) => url.includes('/a1/')));
});

test('folder URLs honor a non-default branch, including slashes in branch names', async () => {
  const calls = fixture({ refs: ['main', 'feature/ejemplos'] });
  const result = await fetchGithubSketchSource(repository + '/tree/feature/ejemplos/a1');
  assert.ok(result.rawUrl.includes('/feature%2Fejemplos/a1/'));
  assert.ok(!calls.includes(api + '/git/trees/main?recursive=1'));
});

test('root URLs use the default branch and allow repository dots and .git suffixes', async () => {
  fixture({ refs: ['clase'], defaultBranch: 'clase' });
  const result = await fetchGithubSketchSource(repository + '.git');
  assert.ok(result.rawUrl.includes('/clase/'));
  mock.restoreAll();
  const calls = [];
  mock.method(globalThis, 'fetch', async (url) => { calls.push(url); return new Response('', { status: 404 }); });
  await assert.rejects(fetchGithubSketchSource(repository + '.v2'), /No se pudo encontrar/);
  assert.equal(calls[0], api + '.v2');
});

test('manual entry paths support both folder-relative and saved repository-relative paths', async () => {
  fixture();
  for (const entry of ['Coordenadas_p5/Coordenadas.js', 'a1/Coordenadas_p5/Coordenadas.js']) {
    const result = await fetchGithubSketchSource(repository + '/tree/main/a1', entry);
    assert.equal(result.entry, 'a1/Coordenadas_p5/Coordenadas.js');
  }
});

test('manual entry cannot execute Java or files from a sibling exercise or the root', async () => {
  const calls = fixture();
  for (const entry of ['Puntos_p5/Puntos.js', 'a10/Otro_p5/Otro.js', 'Coordenadas/Coordenadas.pde', 'Coordenadas_p5/no.js']) {
    await assert.rejects(fetchGithubSketchSource(repository + '/tree/main/a1', entry), /_p5|archivo de entrada/);
  }
  assert.ok(!calls.some((url) => url.startsWith('https://raw.')));
  await assert.rejects(fetchGithubSketchSource(repository, '../Puntos_p5/Puntos.js'), /ruta.*no es válida/);
});

test('multiple p5 folders require an entry, and Java is matched by name', async () => {
  fixture({ sourceFiles: { ...files, 'Otro/Otro.pde': '// otro Java', 'Otro_p5/Otro.js': '// otro p5' } });
  await assert.rejects(fetchGithubSketchSource(repository), /Si hay varias/);
  const result = await fetchGithubSketchSource(repository, 'Puntos_p5/Puntos.js');
  assert.equal(result.codeJava, java);
});

test('multiple Java tabs are displayed with the main sketch first', async () => {
  fixture({ sourceFiles: { ...files, 'a1/Coordenadas/Objeto.pde': 'class Objeto {}' } });
  const result = await fetchGithubSketchSource(repository + '/tree/main/a1');
  assert.match(result.codeJava, /^\/\/ Coordenadas.pde/);
  assert.match(result.codeJava, /\/\/ Objeto.pde\nclass Objeto/);
  assert.ok(!result.code.includes('class Objeto'));
});

test('asset paths stay inside the selected p5 sketch, even for a nested JS entry', async () => {
  fixture({ sourceFiles: {
    'a1/Dibujo/Dibujo.pde': java,
    'a1/Dibujo_p5/js/sketch.js': 'loadImage("foto.png"); loadSound("audio/uno.mp3"); loadImage("data/foto.png");',
    'a1/Dibujo_p5/data/foto.png': '',
    'a1/Dibujo_p5/data/audio/uno.mp3': '',
  } });
  const result = await fetchGithubSketchSource(repository + '/tree/main/a1');
  assert.equal(result.code, 'loadImage("../data/foto.png"); loadSound("../data/audio/uno.mp3"); loadImage("../data/foto.png");');
  assert.ok(result.baseUrl.endsWith('/a1/Dibujo_p5/js/'));
});

test('missing folders, ambiguous JS entries and missing Java give actionable errors', async () => {
  fixture();
  await assert.rejects(fetchGithubSketchSource(repository + '/tree/main/ausente'), /No se encontró la carpeta ausente/);
  mock.restoreAll();
  fixture({ sourceFiles: { ...files, 'Puntos_p5/extra.js': '// extra' } });
  await assert.rejects(fetchGithubSketchSource(repository), /único archivo .js/);
  assert.equal((await fetchGithubSketchSource(repository, 'Puntos_p5/Puntos.js')).code, js);
  mock.restoreAll();
  fixture({ sourceFiles: { 'Solo_p5/sketch.js': js } });
  await assert.rejects(fetchGithubSketchSource(repository), /carpeta Java/);
});

test('invalid URLs, API denials and truncated trees are reported', async () => {
  const calls = fixture();
  for (const url of ['no-url', 'https://otro.com/usuario/repo', repository + '/blob/main/archivo.js']) {
    await assert.rejects(fetchGithubSketchSource(url), /válido|github.com|carpeta/);
  }
  assert.equal(calls.length, 0);
  mock.restoreAll();
  fixture({ status: 403 });
  await assert.rejects(fetchGithubSketchSource(repository), /GitHub rechazó/);
  mock.restoreAll();
  fixture({ truncated: true });
  await assert.rejects(fetchGithubSketchSource(repository), /demasiado grande/);
});

test('concurrent requests share downloads, and later requests fetch updated contents', async () => {
  const calls = fixture();
  const [first, second] = await Promise.all([fetchGithubSketchSource(repository), fetchGithubSketchSource(repository)]);
  assert.deepEqual(first, second);
  assert.equal(calls.length, 4);
  await fetchGithubSketchSource(repository);
  assert.equal(calls.length, 8);
});
