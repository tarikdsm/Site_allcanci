import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const checkerPath = fileURLToPath(new URL('./check-dist.mjs', import.meta.url));

function executarCheckDist(html) {
  const directory = mkdtempSync(join(tmpdir(), 'allcanci-check-dist-'));
  const htmlPath = join(directory, 'dist', 'index.html');
  mkdirSync(dirname(htmlPath), { recursive: true });
  writeFileSync(htmlPath, html);

  try {
    return spawnSync(process.execPath, [checkerPath], {
      cwd: directory,
      encoding: 'utf8',
    });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test('check-dist rejeita canonical e Open Graph incoerentes no HTML final', () => {
  const resultado = executarCheckDist(`<!doctype html>
    <html lang="pt-BR">
      <head>
        <title>Allcanci Tecnologia</title>
        <meta name="description" content="Descrição institucional da Allcanci">
        <link rel="canonical" href="https://example.com/pagina-errada/">
        <meta property="og:title" content="Título divergente">
        <meta property="og:description" content="Descrição divergente">
        <meta property="og:type" content="article">
        <meta property="og:locale" content="en_US">
        <meta property="og:url" content="https://example.com/outra-pagina/">
      </head>
      <body><main id="conteudo" tabindex="-1"><h1>Título</h1></main></body>
    </html>`);

  assert.equal(resultado.status, 1);
  assert.match(resultado.stderr, /canonical inesperada/);
  assert.match(resultado.stderr, /og:url não corresponde à canonical/);
  assert.match(resultado.stderr, /og:title não corresponde ao title/);
  assert.match(resultado.stderr, /og:description não corresponde à description/);
  assert.match(resultado.stderr, /og:type incorreto ou ausente/);
  assert.match(resultado.stderr, /og:locale incorreto ou ausente/);
});

test('check-dist rejeita contratos essenciais de acessibilidade ausentes no HTML final', () => {
  const resultado = executarCheckDist(`<!doctype html>
    <html lang="pt-BR">
      <head><title>Allcanci Tecnologia</title></head>
      <body>
        <a class="site-skip" href="#conteudo">Pular</a>
        <main id="conteudo"><h1>Um</h1><h1>Dois</h1>
          <section id="simulador" aria-labelledby="titulo-ausente">
            <input id="sim-professores">
            <p id="sim-resultado-status" role="status" aria-live="assertive"></p>
          </section>
        </main>
      </body>
    </html>`);

  assert.equal(resultado.status, 1);
  assert.match(resultado.stderr, /esperado exatamente 1 h1/);
  assert.match(resultado.stderr, /main #conteudo não é focável/);
  assert.match(resultado.stderr, /aria-labelledby aponta para id ausente/);
  assert.match(resultado.stderr, /input #sim-professores sem nome acessível/);
  assert.match(resultado.stderr, /região de status do simulador inválida/);
});
