import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(path, 'utf8');

test('todos os CTAs centralizam uma URL oficial transparente do WhatsApp derivada do telefone publicado', () => {
  const contatos = read('src/data/site.ts');
  const page = read('src/pages/index.astro');

  assert.match(contatos, /telefone: '\(31\) 98292-9147',/);
  assert.match(contatos, /whatsappUrl: 'https:\/\/wa\.me\/5531982929147',/);
  assert.doesNotMatch(contatos, /wa\.link/);
  assert.equal([...page.matchAll(/href=\{contatos\.whatsappUrl\}/g)].length, 3);
});
