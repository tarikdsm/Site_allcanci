import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');

test('as constantes citadas no achado 3.8 têm uma fonte canônica importável por JavaScript', async () => {
  const modulePath = 'src/data/constantes-negocio.js';
  assert.equal(existsSync(modulePath), true, `${modulePath} deve concentrar os valores de negócio`);

  const { CONSTANTES_NEGOCIO } = await import('../src/data/constantes-negocio.js');
  assert.deepEqual(CONSTANTES_NEGOCIO, {
    recargaSegundos: 22,
    kmPorRecarga: 1,
    entregaDiasUteis: 15,
    precoCreditoReais: 10.99,
    recargasPorProfessorAno: 26,
  });
});

test('simulador deriva suas premissas compartilhadas da fonte canônica', () => {
  const source = read('src/scripts/simulador-core.js');

  assert.match(source, /import \{ CONSTANTES_NEGOCIO \} from '\.\.\/data\/constantes-negocio\.js';/);
  assert.doesNotMatch(source, /recargasPorProfessorAno:\s*26\b/);
  assert.doesNotMatch(source, /precoCreditoReais:\s*10\.99\b/);
  assert.doesNotMatch(source, /kmPorRecarga:\s*1\b/);
});

test('textos comerciais interpolam as constantes sem fixar cópias dos valores', () => {
  const sources = {
    site: read('src/data/site.ts'),
    comodato: read('src/data/comodato.ts'),
    faq: read('src/data/faq.ts'),
    provaSocial: read('src/data/provaSocial.ts'),
    produtos: read('src/data/produtos.ts'),
    pagina: read('src/pages/index.astro'),
  };

  for (const [name, source] of Object.entries(sources).filter(([name]) => name !== 'site')) {
    assert.match(source, /CONSTANTES_NEGOCIO/, `${name} deve consumir a fonte canônica`);
  }

  assert.doesNotMatch(sources.site, /(?:recargaSegundos|escritaKm|entregaDiasUteis|precoCreditoReais|recargasPorProfessorAno):\s*(?:22|1|15|10\.99|26)\b/);
  assert.doesNotMatch(sources.site, /15 dias úteis/);
  assert.doesNotMatch(sources.comodato, /15 dias úteis|22 segundos|R\$ 10,99/);
  assert.doesNotMatch(sources.faq, /15 dias úteis|1 km/);
  assert.doesNotMatch(sources.provaSocial, /15 dias úteis/);
  assert.doesNotMatch(sources.produtos, /22 segundos|22s|1 km/);
  assert.doesNotMatch(sources.pagina, /cerca de 1 km|numeros\.(?:recargaSegundos|escritaKm|entregaDiasUteis)/);
});

test('site.ts não reintroduz os dados sem consumidor removidos da página', () => {
  const site = read('src/data/site.ts');
  const pagina = read('src/pages/index.astro');

  assert.doesNotMatch(site, /export const diferenciais\s*=/);
  assert.doesNotMatch(site, /\b(?:precoCreditoReais|recargasPorProfessorAno)\s*:/);
  assert.doesNotMatch(pagina, /\bnumeros\.(?:precoCreditoReais|recargasPorProfessorAno)\b/);
});
