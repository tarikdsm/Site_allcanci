import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const layoutPath = new URL('../src/layouts/Layout.astro', import.meta.url);
const pagePath = new URL('../src/pages/index.astro', import.meta.url);
const scriptPath = new URL('../src/scripts/site.js', import.meta.url);
const stylePath = new URL('../src/styles/site.css', import.meta.url);

test('declara a cor do chrome do navegador igual ao fundo principal', async () => {
  const layout = await readFile(layoutPath, 'utf8');

  assert.match(layout, /<meta name="theme-color" content="#ffffff" \/>/);
});

test('mantem o custo de descartaveis no namespace de ids do simulador', async () => {
  const [page, script] = await Promise.all([
    readFile(pagePath, 'utf8'),
    readFile(scriptPath, 'utf8'),
  ]);

  assert.match(page, /id="sim-custo-descartaveis"/);
  assert.doesNotMatch(page, /id="site-custo-descartaveis"/);
  assert.match(script, /querySelector\('#sim-custo-descartaveis'\)/);
  assert.doesNotMatch(script, /Task 5|#site-custo-descartaveis/);
});

test('o estilo exclusivo da pagina nao depende de seletor relacional', async () => {
  const style = await readFile(stylePath, 'utf8');

  assert.match(style, /^:root\s*\{/m);
  assert.doesNotMatch(style, /:has\(/);
});
