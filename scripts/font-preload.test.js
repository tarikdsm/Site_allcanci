import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('a fonte do H1 usa preload por import estavel do Fontsource', () => {
  const layout = readFileSync('src/layouts/Layout.astro', 'utf8');

  assert.match(
    layout,
    /import nunito900Url from '@fontsource\/nunito\/files\/nunito-latin-900-normal\.woff2\?url';/
  );
  assert.match(
    layout,
    /<link rel="preload" href=\{nunito900Url\} as="font" type="font\/woff2" crossorigin="anonymous" \/>/
  );
});
