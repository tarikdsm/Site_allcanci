import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const tokens = readFileSync('src/styles/tokens.css', 'utf8');
const site = readFileSync('src/styles/site.css', 'utf8');

function token(nome) {
  return tokens.match(new RegExp(`--${nome}:\\s*(#[0-9a-f]{6})`, 'i'))?.[1];
}

function bloco(seletor) {
  const escapado = seletor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return site.match(new RegExp(`${escapado}\\s*\\{([^}]+)\\}`))?.[1] ?? '';
}

function luminancia(hex) {
  const canais = hex.match(/[0-9a-f]{2}/gi).map((canal) => {
    const srgb = Number.parseInt(canal, 16) / 255;
    return srgb <= 0.04045
      ? srgb / 12.92
      : ((srgb + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * canais[0] + 0.7152 * canais[1] + 0.0722 * canais[2];
}

function contraste(corA, corB) {
  const [maisClara, maisEscura] = [luminancia(corA), luminancia(corB)]
    .sort((a, b) => b - a);
  return (maisClara + 0.05) / (maisEscura + 0.05);
}

test('o vermelho de texto atende WCAG AA sobre o fundo branco com margem', () => {
  const vermelhoDecorativo = token('vermelho');
  const vermelhoTexto = token('vermelho-texto');
  const branco = token('branco');
  const conta = bloco('.site-conta');
  const custoRuim = bloco('.site-custo-ruim');
  const linha = bloco('.site-conta-linha');
  const textoForte = bloco('.site-conta-linha strong');

  assert.equal(vermelhoDecorativo, '#ff0c00', 'o vermelho decorativo da marca deve ser preservado');
  assert.ok(vermelhoTexto, 'deve existir um token específico para vermelho usado como texto');
  assert.match(conta, /background:\s*var\(--branco\)/);
  assert.match(custoRuim, /color:\s*var\(--vermelho-texto\)/);
  assert.match(linha, /font-size:\s*clamp\(1\.08rem,/);
  assert.match(textoForte, /font-weight:\s*900/);

  const tamanhoMinimoPt = (1.08 * 16 * 72) / 96;
  assert.ok(tamanhoMinimoPt < 14, 'o mínimo do clamp não qualifica como texto grande em negrito');
  assert.ok(
    contraste(vermelhoTexto, branco) >= 5,
    `contraste ${contraste(vermelhoTexto, branco).toFixed(2)}:1; esperado ao menos 5:1`,
  );
});
