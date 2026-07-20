import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const read = (path) => readFileSync(path, 'utf8');

function listSourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? listSourceFiles(path) : [path];
  });
}

test('a página definitiva ocupa a raiz e usa nomes neutros', () => {
  assert.equal(existsSync('src/styles/site.css'), true);
  assert.equal(existsSync('src/scripts/site.js'), true);

  const page = read('src/pages/index.astro');
  assert.match(page, /import '\.\.\/styles\/site\.css';/);
  assert.match(page, /bodyClass="site"/);
  assert.match(page, /<script src="\.\.\/scripts\/site\.js"><\/script>/);
  assert.doesNotMatch(page, /\bv\d+\b|v\d+-|30 propostas|Ver as .*propostas de design/i);

  const css = read('src/styles/site.css');
  const script = read('src/scripts/site.js');
  assert.match(css, /Site institucional Allcanci — linguagem visual de sala de aula/);
  assert.doesNotMatch(css, /\bv\d+\b|v\d+-|--v\d+-/i);
  assert.doesNotMatch(script, /\bv\d+\b|v\d+-/i);

  assert.equal(existsSync('src/pages/v3/index.astro'), false);
  assert.equal(existsSync('src/styles/v3.css'), false);
  assert.equal(existsSync('src/scripts/v3.js'), false);
});

test('não existem rotas nem implementações alternativas', () => {
  const routeDirs = readdirSync('src/pages', { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^v\d+$/.test(entry.name))
    .map((entry) => entry.name);
  assert.deepEqual(routeDirs, []);

  const numberedStyles = readdirSync('src/styles')
    .filter((name) => /^v\d+\.css$/.test(name));
  const numberedScripts = readdirSync('src/scripts')
    .filter((name) => /^v\d+\.js$/.test(name));
  assert.deepEqual(numberedStyles, []);
  assert.deepEqual(numberedScripts, []);

  for (const path of [
    'src/components/ExperienceBody.astro',
    'src/scripts/experiencias-core.js',
    'scripts/experiencias-core.test.js',
    'design-system',
  ]) {
    assert.equal(existsSync(path), false, `${path} deve ter sido removido`);
  }
});

test('os arquivos-fonte do produto não usam nomenclatura numerada', () => {
  const numberedName = /\.v(?:\d+|N)-|\bv\d+(?:-|\b)|--v\d+-/i;
  const sourceFiles = listSourceFiles('src')
    .filter((path) => /\.(astro|css|js|ts)$/.test(path));

  for (const path of sourceFiles) {
    assert.doesNotMatch(read(path), numberedName, `${path} contém nomenclatura numerada`);
  }
});

test('somente recursos usados pelo site definitivo permanecem', () => {
  const assets = readdirSync('src/assets', { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort();
  assert.deepEqual(assets, [
    'eco-marker-preto.jpg',
    'eco-marker-trio.jpg',
    'ink-injector-frontal.jpg',
    'master-clean.jpg',
    'master-color-trio.jpg',
    'moedas-credito.jpg',
  ]);
  assert.equal(existsSync('src/assets/3d'), false);
  assert.equal(existsSync('public/models'), false);
  assert.equal(existsSync('public/favicon.ico'), false);

  const pkg = JSON.parse(read('package.json'));
  assert.deepEqual(Object.keys(pkg.dependencies).sort(), [
    '@astrojs/sitemap',
    '@fontsource/nunito',
    '@fontsource/nunito-sans',
    '@fontsource/poppins',
    'astro',
  ]);
});
