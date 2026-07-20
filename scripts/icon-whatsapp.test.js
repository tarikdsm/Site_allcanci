import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');

test('os CTAs de WhatsApp reutilizam um ícone decorativo com os tamanhos originais', () => {
  assert.equal(existsSync('src/components/IconWhatsapp.astro'), true);

  const page = read('src/pages/index.astro');
  const icon = read('src/components/IconWhatsapp.astro');

  assert.match(page, /import IconWhatsapp from '\.\.\/components\/IconWhatsapp\.astro';/);
  assert.deepEqual(
    [...page.matchAll(/<IconWhatsapp size=\{(\d+)\} \/>/g)].map((match) => Number(match[1])),
    [16, 18, 20],
  );
  assert.doesNotMatch(page, /M21 12a8\.5 8\.5 0 0 1-12\.4 7\.5L3 21l1\.6-5\.2A8\.5 8\.5 0 1 1 21 12Z/);
  assert.match(icon, /aria-hidden="true"/);
  assert.match(icon, /width=\{size\}/);
  assert.match(icon, /height=\{size\}/);
});
