import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clampPercent,
  slideDeltaForKey,
  nextIndex,
  addVisited,
} from '../src/scripts/experiencias-core.js';

test('clampPercent limita e normaliza percentuais', () => {
  assert.equal(clampPercent(-1), 0);
  assert.equal(clampPercent('42'), 42);
  assert.equal(clampPercent(140), 100);
  assert.equal(clampPercent('inválido'), 0);
});

test('slideDeltaForKey traduz apenas teclas de navegação', () => {
  assert.equal(slideDeltaForKey('ArrowDown'), 1);
  assert.equal(slideDeltaForKey('PageDown'), 1);
  assert.equal(slideDeltaForKey('ArrowUp'), -1);
  assert.equal(slideDeltaForKey('PageUp'), -1);
  assert.equal(slideDeltaForKey('Enter'), 0);
});

test('nextIndex permanece dentro do conjunto de slides', () => {
  assert.equal(nextIndex(0, -1, 8), 0);
  assert.equal(nextIndex(3, 1, 8), 4);
  assert.equal(nextIndex(7, 1, 8), 7);
});

test('addVisited preserva ordem e não duplica ids', () => {
  assert.deepEqual(addVisited(['hero'], 'produtos'), ['hero', 'produtos']);
  assert.deepEqual(addVisited(['hero'], 'hero'), ['hero']);
});
