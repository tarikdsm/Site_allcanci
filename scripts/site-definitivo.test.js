import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');

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
