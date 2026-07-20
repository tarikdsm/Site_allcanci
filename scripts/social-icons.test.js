import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');

test('redes sociais declaram o ícone por discriminante, sem depender do rótulo visível', () => {
  const site = read('src/data/site.ts');
  const page = read('src/pages/index.astro');

  assert.match(site, /export type IconeRedeSocial =\s*\| 'instagram'\s*\| 'linkedin'\s*\| 'youtube';/);
  assert.match(site, /export interface RedeSocial \{[\s\S]*icone: IconeRedeSocial;[\s\S]*\}/);
  assert.match(site, /export const redes = \[[\s\S]*icone: 'instagram'[\s\S]*icone: 'linkedin'[\s\S]*icone: 'youtube'[\s\S]*\] satisfies readonly RedeSocial\[\];/);
  assert.match(page, /const iconesRedes = \{[\s\S]*instagram: IconInstagram[\s\S]*linkedin: IconLinkedin[\s\S]*youtube: IconYoutube[\s\S]*\} satisfies Record<IconeRedeSocial, typeof IconInstagram>;/);
  assert.match(page, /const IconeRede = iconesRedes\[rede\.icone\];/);
  assert.match(page, /<IconeRede \/>/);
  assert.doesNotMatch(page, /rede\.nome ===/);
});

test('ícones sociais são decorativos porque o link já tem texto visível', () => {
  for (const icon of ['IconInstagram.astro', 'IconLinkedin.astro', 'IconYoutube.astro']) {
    const path = `src/components/${icon}`;
    assert.equal(existsSync(path), true, `${path} deve existir`);
    assert.match(read(path), /aria-hidden="true"/);
  }
});
