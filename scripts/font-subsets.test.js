import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');

test('as fontes estáticas carregam somente o subset latin e os pesos usados', () => {
  const layout = read('src/layouts/Layout.astro');
  const imports = [...layout.matchAll(/import '(@fontsource\/[^']+)'/g)].map((match) => match[1]);

  assert.deepEqual(imports.filter((path) => path.startsWith('@fontsource/')), [
    '@fontsource/nunito/latin-800.css',
    '@fontsource/nunito/latin-900.css',
    '@fontsource/nunito-sans/latin-400.css',
    '@fontsource/nunito-sans/latin-700.css',
    '@fontsource/nunito-sans/latin-800.css',
  ]);
});
