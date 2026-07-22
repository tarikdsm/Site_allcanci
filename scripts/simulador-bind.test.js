import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { bindSimulador } from '../src/scripts/simulador-bind.js';
import { LIMITES_PROFESSORES, reais, simular } from '../src/scripts/simulador-core.js';

const read = (path) => readFileSync(path, 'utf8');

class ElementoFalso {
  #textContent = '';

  constructor(value = '') {
    this.value = value;
    this.listeners = new Map();
    this.escritas = 0;
  }

  get textContent() {
    return this.#textContent;
  }

  set textContent(value) {
    this.#textContent = value;
    this.escritas += 1;
  }

  addEventListener(tipo, listener) {
    this.listeners.set(tipo, listener);
  }

  disparar(tipo) {
    this.listeners.get(tipo)?.();
  }
}

const seletoresSimulador = [
  '#sim-professores',
  '#sim-professores-num',
  '#sim-recargas',
  '#sim-custo-fill',
  '#sim-plastico',
  '#sim-resultado-status',
];

function montarSimulador() {
  const elementos = new Map(
    seletoresSimulador.map((seletor) => [seletor, new ElementoFalso()]),
  );
  elementos.get('#sim-professores').value = String(LIMITES_PROFESSORES.inicial);
  elementos.get('#sim-professores-num').value = String(LIMITES_PROFESSORES.inicial);
  globalThis.document = { querySelector: (seletor) => elementos.get(seletor) ?? null };
  return elementos;
}

test('o simulador oferece uma unica regiao de status atomica e educada', () => {
  const page = read('src/pages/index.astro');
  const regioes = page.match(/<p\s+[^>]*id="sim-resultado-status"[^>]*>/g) ?? [];

  assert.equal(regioes.length, 1);
  assert.match(regioes[0], /class="visually-hidden"/);
  assert.match(regioes[0], /role="status"/);
  assert.match(regioes[0], /aria-live="polite"/);
  assert.match(regioes[0], /aria-atomic="true"/);
});

test('anuncia cada interacao em uma unica frase sem anunciar o estado inicial', () => {
  const elementos = montarSimulador();

  try {
    bindSimulador();
    const status = elementos.get('#sim-resultado-status');
    assert.equal(status.textContent, '');
    assert.equal(status.escritas, 0);

    elementos.get('#sim-professores').value = '30';
    elementos.get('#sim-professores').disparar('input');

    const resultado = simular(30);
    assert.equal(status.escritas, 1);
    assert.equal(
      status.textContent,
      `Para 30 professores: ${resultado.recargasAno.toLocaleString('pt-BR')} recargas por ano, com custo FILL de ${reais(resultado.custoFill)} e ${resultado.plasticoEvitadoKg.toLocaleString('pt-BR')} kg de plástico economizado.`,
    );
  } finally {
    delete globalThis.document;
  }
});

test('range e number declaram o mesmo intervalo de 1 a 999', () => {
  const page = read('src/pages/index.astro');
  const faixa = page.match(/<input\s+type="range"[\s\S]*?\/>/)?.[0] ?? '';
  const numero = page.match(/<input\s+type="number"[\s\S]*?\/>/)?.[0] ?? '';

  for (const input of [faixa, numero]) {
    assert.match(input, /min=\{LIMITES_PROFESSORES\.minimo\}/);
    assert.match(input, /max=\{LIMITES_PROFESSORES\.maximo\}/);
    assert.match(input, /step="1"/);
  }
});

test('valor numerico valido sincroniza imediatamente os dois controles', () => {
  const elementos = montarSimulador();

  try {
    bindSimulador();
    const numero = elementos.get('#sim-professores-num');
    numero.value = '30';
    numero.disparar('input');

    assert.equal(elementos.get('#sim-professores').value, '30');
    assert.equal(numero.value, '30');
    assert.equal(elementos.get('#sim-recargas').textContent, '780');
  } finally {
    delete globalThis.document;
  }
});

test('underflow e overflow so sao clampados quando a digitacao e confirmada', () => {
  const elementos = montarSimulador();

  try {
    bindSimulador();
    const faixa = elementos.get('#sim-professores');
    const numero = elementos.get('#sim-professores-num');

    numero.value = '0';
    numero.disparar('input');
    assert.equal(numero.value, '0');
    assert.equal(faixa.value, '20');
    numero.disparar('change');
    assert.equal(numero.value, '1');
    assert.equal(faixa.value, '1');

    numero.value = '1000';
    numero.disparar('input');
    assert.equal(numero.value, '1000');
    assert.equal(faixa.value, '1');
    numero.disparar('change');
    assert.equal(numero.value, '999');
    assert.equal(faixa.value, '999');
    assert.ok(
      [...elementos.values()]
        .filter((elemento) => elemento.textContent)
        .every((elemento) => !/NaN|Infinity/.test(elemento.textContent)),
    );
  } finally {
    delete globalThis.document;
  }
});

test('vazio ou NaN preserva o ultimo valor valido durante a digitacao e o restaura ao confirmar', () => {
  const elementos = montarSimulador();

  try {
    bindSimulador();
    const faixa = elementos.get('#sim-professores');
    const numero = elementos.get('#sim-professores-num');

    for (const valorInvalido of ['', 'NaN']) {
      numero.value = valorInvalido;
      numero.disparar('input');
      assert.equal(numero.value, valorInvalido);
      assert.equal(faixa.value, '20');
      numero.disparar('change');
      assert.equal(numero.value, '20');
      assert.equal(faixa.value, '20');
    }
  } finally {
    delete globalThis.document;
  }
});
