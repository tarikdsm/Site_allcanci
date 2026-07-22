import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

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

});

test('a imagem candidata a LCP no hero recebe prioridade alta sem preload', () => {
  const page = read('src/pages/index.astro');
  const heroImage = page.match(/<figure class="site-quadro-foto site-fita">\s*<Image([\s\S]*?)\/>\s*<figcaption>/);

  assert.ok(heroImage, 'a imagem do hero deve continuar dentro da figura principal');
  assert.match(heroImage[1], /loading="eager"/);
  assert.match(heroImage[1], /fetchpriority="high"/);
  assert.doesNotMatch(page, /<link\s+[^>]*rel=["']preload["'][^>]*as=["']image["']/i);
});

test('o link de pular para o conteudo leva ao marco principal focavel', () => {
  const page = read('src/pages/index.astro');

  assert.match(page, /<a\s+class="site-skip"\s+href="#conteudo">/);
  assert.match(page, /<main\s+id="conteudo"\s+tabindex="-1">/);
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

test('somente a documentação neutra atual permanece', () => {
  const docs = listSourceFiles('docs/superpowers')
    .map((path) => relative('docs/superpowers', path).replaceAll(sep, '/'))
    .sort();

  assert.deepEqual(docs, [
    'plans/2026-07-20-site-definitivo.md',
    'specs/2026-07-20-site-definitivo-design.md',
  ]);
});

test('os arquivos-fonte do produto não usam nomenclatura numerada', () => {
  const numberedName = /\bv(?:\d+|N)(?:-|\b)/i;
  const sourceFiles = listSourceFiles('src')
    .filter((path) => /\.(astro|css|js|ts)$/.test(path));

  for (const path of sourceFiles) {
    const sourcePath = relative('src', path).replaceAll(sep, '/');
    assert.doesNotMatch(sourcePath, numberedName, `${sourcePath} tem caminho com nomenclatura numerada`);
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
    'logo-allcanci.png',
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
    'astro',
  ]);
});
