import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LIMITES_PROFESSORES,
  simular,
  reais,
  PREMISSAS,
} from '../src/scripts/simulador-core.js';

test('simular com 10 professores usa as premissas padrão', () => {
  const r = simular(10);
  assert.equal(r.recargasAno, 260);
  assert.ok(Math.abs(r.custoFill - 2857.4) < 1e-9);
  assert.equal(r.descartaveis, 650); // 260 recargas × 1000m / 400m
  assert.ok(Math.abs(r.custoDescartaveis - 5193.5) < 1e-9);
  assert.ok(Math.abs(r.economia - 2336.1) < 1e-9);
  assert.ok(Math.abs(r.plasticoEvitadoKg - 13) < 1e-9);
});

test('professores inválido retorna zeros', () => {
  const r = simular(Number.NaN);
  assert.equal(r.recargasAno, 0);
  assert.equal(r.economia, 0);
  assert.ok(Object.values(r).every(Number.isFinite));
});

test('simular limita underflow e overflow ao intervalo de professores', () => {
  const minimo = simular(0);
  const maximo = simular(Number.MAX_VALUE);

  assert.deepEqual(LIMITES_PROFESSORES, { minimo: 1, maximo: 999, inicial: 20 });
  assert.equal(minimo.recargasAno, PREMISSAS.recargasPorProfessorAno);
  assert.equal(
    maximo.recargasAno,
    LIMITES_PROFESSORES.maximo * PREMISSAS.recargasPorProfessorAno,
  );
  assert.ok(Object.values(minimo).every(Number.isFinite));
  assert.ok(Object.values(maximo).every(Number.isFinite));
});

test('reais formata em BRL', () => {
  assert.match(reais(7.99), /R\$\s?7,99/);
});

test('premissas expostas para exibir no site', () => {
  assert.equal(PREMISSAS.recargasPorProfessorAno, 26);
});
