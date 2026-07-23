import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const layoutPath = new URL('../src/layouts/Layout.astro', import.meta.url);
const pagePath = new URL('../src/pages/index.astro', import.meta.url);

test('metadados sociais usam a imagem processada com dimensões e texto alternativo', async () => {
  const [layout, page] = await Promise.all([
    readFile(layoutPath, 'utf8'),
    readFile(pagePath, 'utf8'),
  ]);

  assert.match(layout, /import type \{ getImage \} from 'astro:assets';/);
  assert.match(layout, /ogImage\?: Awaited<ReturnType<typeof getImage>>/);
  assert.match(layout, /ogImageAlt\?: string/);
  assert.match(layout, /<meta property="og:site_name" content=\{empresa\.nome\} \/>/);
  assert.match(layout, /<meta property="og:image:width" content=\{String\(ogImage\.attributes\.width\)\} \/>/);
  assert.match(layout, /<meta property="og:image:height" content=\{String\(ogImage\.attributes\.height\)\} \/>/);
  assert.match(layout, /<meta property="og:image:alt" content=\{ogImageAlt\} \/>/);
  assert.match(layout, /<meta name="twitter:image" content=\{ogImageUrl\} \/>/);
  assert.match(layout, /<meta name="twitter:image:alt" content=\{ogImageAlt\} \/>/);

  assert.match(page, /const ecoMarkerHeroAlt = '[^']+';/);
  assert.match(page, /ogImage=\{ogImage\}/);
  assert.match(page, /ogImageAlt=\{ecoMarkerHeroAlt\}/);
  assert.doesNotMatch(page, /getImage\(\{[^}]*format:\s*'jpe?g'/);
});
