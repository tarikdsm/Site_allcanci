import test from 'node:test';
import assert from 'node:assert/strict';
import { simular, reais, PREMISSAS } from '../src/scripts/simulador-core.js';

test('simular com 10 professores usa as premissas padrão', () => {
  const r = simular(10);
  assert.equal(r.recargasAno, 260);
  assert.ok(Math.abs(r.custoFill - 2857.4) < 1e-9);
  assert.equal(r.descartaveis, 650); // 260 recargas × 1000m / 400m
  assert.ok(Math.abs(r.custoDescartaveis - 2925) < 1e-9);
  assert.ok(Math.abs(r.economia - 67.6) < 1e-9);
  assert.ok(Math.abs(r.plasticoEvitadoKg - 13) < 1e-9);
});

test('professores inválido retorna zeros', () => {
  const r = simular(0);
  assert.equal(r.recargasAno, 0);
  assert.equal(r.economia, 0);
});

test('reais formata em BRL', () => {
  assert.match(reais(10.99), /R\$\s?10,99/);
});

test('premissas expostas para exibir no site', () => {
  assert.equal(PREMISSAS.recargasPorProfessorAno, 26);
});
