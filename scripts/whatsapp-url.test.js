import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(path, 'utf8');

test('os CTAs usam as URLs transparentes do WhatsApp comercial e do suporte', () => {
  const contatos = read('src/data/site.ts');
  const page = read('src/pages/index.astro');

  assert.match(contatos, /telefone: '\(31\) 98292-9147',/);
  assert.match(contatos, /whatsappUrl: 'https:\/\/wa\.me\/5531982929147',/);
  assert.match(contatos, /whatsappSuporteUrl: 'https:\/\/wa\.me\/5531981094487',/);
  assert.doesNotMatch(contatos, /wa\.link/);
  assert.equal([...page.matchAll(/href=\{contatos\.whatsappUrl\}/g)].length, 3);
  assert.equal([...page.matchAll(/href=\{contatos\.whatsappSuporteUrl\}/g)].length, 1);

  const cabecalho = page.match(/<header class="site-topo">([\s\S]*?)<\/header>/)?.[1] ?? '';
  assert.match(
    cabecalho,
    /<\/nav>[\s\S]*?href=\{contatos\.whatsappSuporteUrl\}[\s\S]*?href=\{contatos\.whatsappUrl\}/,
  );
});
