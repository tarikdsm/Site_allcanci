# Site definitivo da Allcanci — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar a proposta escolhida como o único site institucional da Allcanci na raiz local e no GitHub Pages, preservando o acervo anterior somente em um snapshot local ignorado pelo Git.

**Architecture:** Criar primeiro uma cópia recuperável do commit anterior à limpeza. Em seguida, promover a página escolhida para a raiz, neutralizar sua nomenclatura, remover rotas e recursos sem uso, reforçar os contratos automatizados e publicar a `main` existente. A configuração Astro, o conteúdo estruturado e o workflow do GitHub Pages permanecem como base.

**Tech Stack:** Astro 7, TypeScript, JavaScript ES modules, CSS, Node.js test runner, GitHub Actions, GitHub CLI e Playwright.

## Global Constraints

- O repositório continua em `tarikdsm/Site_allcanci` e permanece público.
- O GitHub Pages continua em `https://tarikdsm.github.io/Site_allcanci/`.
- O histórico Git existente será preservado, sem reescrita.
- `versoes_extras/` existe somente localmente e nunca integra commits ou builds.
- O servidor e o build expõem somente a página raiz; não criar aliases ou redirecionamentos para rotas antigas.
- O projeto principal não usa nomes numerados em arquivos, classes CSS, seletores, IDs, comentários, README, metadados ou testes.
- A apresentação e o comportamento do site escolhido não devem mudar durante a neutralização de nomes.
- A conta `tassiadsm` deve receber permissão de escrita; o e-mail informado não entra no código.
- Usar Node.js `>=22.12.0`, conforme `package.json`.
- Seguir `AGENTS.md`: iniciar o servidor Astro em modo background.

---

## File Structure

### Arquivos que permanecem ou são neutralizados

- `src/pages/index.astro`: única rota do site, contendo a página institucional escolhida.
- `src/styles/site.css`: apresentação exclusiva do site definitivo.
- `src/scripts/site.js`: interações visuais e integração do simulador.
- `src/scripts/simulador-core.js`: cálculos puros do simulador.
- `src/scripts/simulador-bind.js`: ligação entre os cálculos e o DOM.
- `src/layouts/Layout.astro`: shell HTML, fontes e metadados globais.
- `src/styles/tokens.css`: tokens compartilhados ainda usados pelo site.
- `src/data/*.ts`: conteúdo estruturado consumido pela página.
- `src/data/imagens.ts`: catálogo reduzido às seis imagens realmente importadas.
- `scripts/site-definitivo.test.js`: contrato estrutural do projeto final.
- `scripts/simulador-core.test.js`: contrato funcional do simulador.
- `scripts/check-dist.mjs`: contrato do artefato de produção.
- `README.md`: documentação do único site institucional.

### Arquivos removidos após o snapshot

- todas as subpastas numeradas de `src/pages/`;
- folhas numeradas de `src/styles/`;
- scripts numerados de `src/scripts/`;
- `src/components/ExperienceBody.astro` e `src/scripts/experiencias-core.js`;
- `scripts/experiencias-core.test.js`;
- `design-system/` e a documentação histórica anterior ao desenho aprovado;
- `src/assets/3d/` e `public/models/`;
- imagens e dependências não alcançáveis pela página definitiva.

---

### Task 1: Preservar e ignorar o acervo local

**Files:**
- Modify: `.gitignore`
- Create locally, ignored: `versoes_extras/site-com-30-versoes/`

**Interfaces:**
- Consumes: o commit limpo em `HEAD`, contendo todo o acervo anterior.
- Produces: snapshot local executável e regra `versoes_extras/` no `.gitignore`.

- [ ] **Step 1: Confirmar a linha de base antes do snapshot**

Run:

```powershell
git status --short --branch
npm test
npm run check
npm run build
```

Expected: branch `main` sem alterações não planejadas; testes, verificação Astro e build terminam com exit code `0`. Se houver falha, registrar e corrigir a linha de base antes de arquivar.

- [ ] **Step 2: Adicionar a regra de exclusão antes de materializar o snapshot**

Aplicar este patch em `.gitignore`:

```diff
 node_modules/
 dist/
 .astro/
 .superpowers/
 .worktrees/
 lh-*.json
+versoes_extras/
```

- [ ] **Step 3: Criar o snapshot a partir do commit atual**

Run from the repository root:

```powershell
$repoRoot = (Resolve-Path '.').Path
$extrasRoot = Join-Path $repoRoot 'versoes_extras'
$snapshotRoot = Join-Path $extrasRoot 'site-com-30-versoes'
$archivePath = Join-Path $extrasRoot 'site-com-30-versoes.tar'
New-Item -ItemType Directory -Force -Path $snapshotRoot | Out-Null
git archive --format=tar --output="$archivePath" HEAD
tar -xf "$archivePath" -C "$snapshotRoot"
Remove-Item -LiteralPath $archivePath
```

Expected: `versoes_extras/site-com-30-versoes/package.json`, `src/pages/index.astro` e as subpastas numeradas existem; `.git`, `node_modules`, `dist` e `.astro` não existem dentro do snapshot.

- [ ] **Step 4: Verificar isolamento e recuperabilidade**

Run:

```powershell
git check-ignore -v versoes_extras/site-com-30-versoes/package.json
git status --short
Test-Path versoes_extras/site-com-30-versoes/src/pages/v1/index.astro
Test-Path versoes_extras/site-com-30-versoes/src/pages/v30/index.astro
Test-Path versoes_extras/site-com-30-versoes/.git
Test-Path versoes_extras/site-com-30-versoes/node_modules
```

Expected: `git check-ignore` aponta `.gitignore`; `git status` mostra somente `.gitignore`; as duas páginas de amostra retornam `True`; `.git` e `node_modules` retornam `False`.

- [ ] **Step 5: Commitar a proteção do acervo**

```powershell
git add .gitignore
git commit -m "chore: preservar acervo local das propostas"
```

Expected: commit criado e nenhum conteúdo de `versoes_extras/` incluído.

---

### Task 2: Promover a página escolhida e neutralizar identificadores

**Files:**
- Create: `scripts/site-definitivo.test.js`
- Replace: `src/pages/index.astro`
- Rename: `src/pages/v3/index.astro` → `src/pages/index.astro`
- Rename: `src/styles/v3.css` → `src/styles/site.css`
- Rename: `src/scripts/v3.js` → `src/scripts/site.js`

**Interfaces:**
- Consumes: `Layout`, módulos de `src/data/` e `simular()`, `reais()` e `PREMISSAS` de `src/scripts/simulador-core.js`.
- Produces: rota `/`, classe de corpo `site`, prefixo CSS/DOM `site-` e script `src/scripts/site.js`.

- [ ] **Step 1: Escrever o contrato estrutural que falha no estado atual**

Create `scripts/site-definitivo.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');

test('a página definitiva ocupa a raiz e usa nomes neutros', () => {
  assert.equal(existsSync('src/styles/site.css'), true);
  assert.equal(existsSync('src/scripts/site.js'), true);

  const page = read('src/pages/index.astro');
  assert.match(page, /import '\.\.\/styles\/site\.css';/);
  assert.match(page, /bodyClass="site"/);
  assert.match(page, /<script src="\.\.\/scripts\/site\.js"><\/script>/);
  assert.doesNotMatch(page, /\bv\d+\b|v\d+-|30 propostas|Ver as .*propostas de design/i);

  const css = read('src/styles/site.css');
  const script = read('src/scripts/site.js');
  assert.doesNotMatch(css, /\bv\d+\b|v\d+-|--v\d+-/i);
  assert.doesNotMatch(script, /\bv\d+\b|v\d+-/i);
});
```

- [ ] **Step 2: Executar o teste e confirmar a falha esperada**

Run:

```powershell
node --test scripts/site-definitivo.test.js
```

Expected: FAIL porque `src/styles/site.css` e `src/scripts/site.js` ainda não existem e a raiz ainda contém o seletor.

- [ ] **Step 3: Mover os três arquivos de implementação**

Run:

```powershell
git rm -- src/pages/index.astro
git mv src/pages/v3/index.astro src/pages/index.astro
git mv src/styles/v3.css src/styles/site.css
git mv src/scripts/v3.js src/scripts/site.js
```

Expected: Git registra a substituição da raiz e os dois renomes; `src/pages/v3/` fica vazio e deixa de ser uma rota.

- [ ] **Step 4: Ajustar imports, nomes e o rodapé da página**

Em `src/pages/index.astro`, substituir o bloco de imports pelo bloco completo:

```astro
import type { ImageMetadata } from 'astro';
import Layout from '../layouts/Layout.astro';
import { Image, getImage } from 'astro:assets';
import { empresa, numeros, contatos, redes } from '../data/site';
import { produtos } from '../data/produtos';
import { etapasComodato } from '../data/comodato';
import { faq } from '../data/faq';
import { provaSocial } from '../data/provaSocial';
import { sustentabilidade } from '../data/sustentabilidade';
import * as img from '../data/imagens';
import { simular, reais, PREMISSAS } from '../scripts/simulador-core.js';
import '../styles/site.css';
```

Aplicar também:

```diff

-const base = import.meta.env.BASE_URL;
-const hubUrl = base.endsWith('/') ? base : `${base}/`;
 const ano = new Date().getFullYear();

-  bodyClass="v3"
+  bodyClass="site"

-      <p><a href={hubUrl}>Ver as 5 propostas de design</a></p>

-  <script src="../../scripts/v3.js"></script>
+  <script src="../scripts/site.js"></script>
```

No arquivo inteiro, substituir de forma mecânica e completa:

```text
v3-  → site-
```

Isso inclui classes e o ID `site-custo-descartaveis`; não alterar textos comerciais como “proposta de comodato”.

- [ ] **Step 5: Neutralizar CSS e JavaScript sem mudar comportamento**

Em `src/styles/site.css`, substituir de forma completa:

```text
.v3     → .site
body.v3 → body.site
v3-     → site-
--v3-   → --site-
```

Substituir o cabeçalho por:

```css
/* ================================================================
   Site institucional Allcanci — linguagem visual de sala de aula
   ================================================================ */
```

Em `src/scripts/site.js`, substituir `v3-` por `site-` e trocar o comentário do custo por:

```js
// O custo anual dos descartáveis é calculado com as premissas exibidas no simulador.
```

- [ ] **Step 6: Executar contratos e inspeção de resíduos**

Run:

```powershell
node --test scripts/site-definitivo.test.js scripts/simulador-core.test.js
rg -n "\bV3\b|\bv3\b|v3-|--v3-|/v3/|propostas de design" src/pages/index.astro src/styles/site.css src/scripts/site.js
```

Expected: testes PASS; `rg` não retorna ocorrências.

- [ ] **Step 7: Commitar a promoção da página**

```powershell
git add scripts/site-definitivo.test.js src/pages/index.astro src/styles/site.css src/scripts/site.js
git commit -m "feat: tornar o site escolhido a página principal"
```

Expected: commit contém a página raiz e nomenclatura neutra, sem remoções ainda não tratadas.

---

### Task 3: Remover rotas e código das propostas descartadas

**Files:**
- Modify: `scripts/site-definitivo.test.js`
- Delete: todos os diretórios numerados de `src/pages/`, enumerados no Step 3.
- Delete: todos os arquivos numerados de `src/styles/`, enumerados no Step 4.
- Delete: todos os arquivos numerados de `src/scripts/`, enumerados no Step 4.
- Delete: `src/components/ExperienceBody.astro`
- Delete: `src/scripts/experiencias-core.js`
- Delete: `scripts/experiencias-core.test.js`
- Delete: `design-system/`
- Delete: documentação histórica anterior a `2026-07-20`

**Interfaces:**
- Consumes: rota raiz e recursos neutros da Task 2.
- Produces: uma única rota Astro e nenhuma implementação alternativa rastreada.

- [ ] **Step 1: Ampliar o teste para exigir uma única implementação**

Adicionar imports e o segundo teste em `scripts/site-definitivo.test.js`:

```js
import { existsSync, readFileSync, readdirSync } from 'node:fs';

test('não existem rotas nem implementações alternativas', () => {
  const routeDirs = readdirSync('src/pages', { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^v\d+$/.test(entry.name))
    .map((entry) => entry.name);
  assert.deepEqual(routeDirs, []);

  const numberedStyles = readdirSync('src/styles')
    .filter((name) => /^v\d+\.css$/.test(name));
  const numberedScripts = readdirSync('src/scripts')
    .filter((name) => /^v\d+\.js$/.test(name));
  assert.deepEqual(numberedStyles, []);
  assert.deepEqual(numberedScripts, []);

  for (const path of [
    'src/components/ExperienceBody.astro',
    'src/scripts/experiencias-core.js',
    'scripts/experiencias-core.test.js',
    'design-system',
  ]) {
    assert.equal(existsSync(path), false, `${path} deve ter sido removido`);
  }
});
```

No import existente, substituir a linha de `node:fs` para não duplicá-la.

- [ ] **Step 2: Executar e observar a falha pelos arquivos legados**

Run:

```powershell
node --test scripts/site-definitivo.test.js
```

Expected: FAIL listando diretórios, estilos, scripts ou componentes alternativos.

- [ ] **Step 3: Remover as rotas alternativas explicitamente**

Run:

```powershell
git rm -r -- src/pages/v1 src/pages/v2 src/pages/v4 src/pages/v5 src/pages/v6 src/pages/v7 src/pages/v8 src/pages/v9 src/pages/v10 src/pages/v11 src/pages/v12 src/pages/v13 src/pages/v14 src/pages/v15 src/pages/v16 src/pages/v17 src/pages/v18 src/pages/v19 src/pages/v20 src/pages/v21 src/pages/v22 src/pages/v23 src/pages/v24 src/pages/v25 src/pages/v26 src/pages/v27 src/pages/v28 src/pages/v29 src/pages/v30
```

Expected: somente `src/pages/index.astro` permanece como página.

- [ ] **Step 4: Remover estilos e scripts alternativos explicitamente**

Run:

```powershell
git rm -- src/styles/v1.css src/styles/v2.css src/styles/v4.css src/styles/v5.css src/styles/v6.css src/styles/v7.css src/styles/v8.css src/styles/v9.css src/styles/v10.css src/styles/v11.css src/styles/v12.css src/styles/v13.css src/styles/v14.css src/styles/v15.css src/styles/v16.css src/styles/v17.css src/styles/v18.css src/styles/v19.css src/styles/v20.css src/styles/v21.css src/styles/v22.css src/styles/v23.css src/styles/v24.css src/styles/v25.css src/styles/v26.css src/styles/v27.css src/styles/v28.css src/styles/v29.css src/styles/v30.css
git rm -- src/scripts/v1.js src/scripts/v2.js src/scripts/v4.js src/scripts/v5.js src/scripts/v6.js src/scripts/v7.js src/scripts/v8.js src/scripts/v9.js src/scripts/v10.js src/scripts/v11.js src/scripts/v12.js src/scripts/v13.js src/scripts/v14.js src/scripts/v15.js src/scripts/v16.js src/scripts/v17.js src/scripts/v18.js src/scripts/v19.js src/scripts/v20.js src/scripts/v21.js src/scripts/v22.js src/scripts/v23.js src/scripts/v24.js src/scripts/v25.js src/scripts/v26.js src/scripts/v27.js src/scripts/v28.js src/scripts/v29.js src/scripts/v30.js
git rm -- src/components/ExperienceBody.astro src/scripts/experiencias-core.js scripts/experiencias-core.test.js
```

- [ ] **Step 5: Remover protótipos e documentos históricos já preservados no snapshot**

Run:

```powershell
git rm -r -- design-system
git rm -- docs/superpowers/plans/2026-07-10-site-allcanci.md docs/superpowers/plans/2026-07-12-v11-v15-disruptivas.md docs/superpowers/specs/2026-07-10-site-allcanci-design.md docs/superpowers/specs/2026-07-11-v6-v10-3d-design.md docs/superpowers/specs/2026-07-12-v11-v15-disruptivas-design.md
```

Expected: permanecem apenas o desenho e o plano neutros de consolidação.

- [ ] **Step 6: Verificar e commitir a remoção**

Run:

```powershell
node --test scripts/site-definitivo.test.js scripts/simulador-core.test.js
Get-ChildItem src/pages -Recurse -File
git diff --check
```

Expected: testes PASS; a listagem de páginas contém somente `src/pages/index.astro`; diff sem erros.

```powershell
git add scripts/site-definitivo.test.js
git commit -m "refactor: remover implementações alternativas do site"
```

---

### Task 4: Reduzir imagens, modelos e dependências ao necessário

**Files:**
- Modify: `scripts/site-definitivo.test.js`
- Modify: `src/data/imagens.ts`
- Modify: `package.json`
- Modify: `package-lock.json`
- Delete: imagens não usadas de `src/assets/`
- Delete: `src/assets/3d/`
- Delete: `public/models/`

**Interfaces:**
- Consumes: símbolos `inkInjector`, `ecoMarkerTrio`, `ecoMarkerPreto`, `masterColorTrio`, `masterClean` e `moedasCredito` usados por `src/pages/index.astro`.
- Produces: catálogo de seis imagens e conjunto mínimo de dependências de runtime.

- [ ] **Step 1: Adicionar o contrato de recursos mínimos**

Usar `existsSync`, `readFileSync` e `readdirSync` do import já consolidado de `node:fs` e adicionar:

```js
test('somente recursos usados pelo site definitivo permanecem', () => {
  const assets = readdirSync('src/assets', { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort();
  assert.deepEqual(assets, [
    'eco-marker-preto.jpg',
    'eco-marker-trio.jpg',
    'ink-injector-frontal.jpg',
    'master-clean.jpg',
    'master-color-trio.jpg',
    'moedas-credito.jpg',
  ]);
  assert.equal(existsSync('src/assets/3d'), false);
  assert.equal(existsSync('public/models'), false);
  assert.equal(existsSync('public/favicon.ico'), false);

  const pkg = JSON.parse(read('package.json'));
  assert.deepEqual(Object.keys(pkg.dependencies).sort(), [
    '@astrojs/sitemap',
    '@fontsource/nunito',
    '@fontsource/nunito-sans',
    '@fontsource/poppins',
    'astro',
  ]);
});
```

- [ ] **Step 2: Executar e confirmar a falha por recursos excedentes**

Run:

```powershell
node --test scripts/site-definitivo.test.js
```

Expected: FAIL mostrando imagens, diretórios e dependências extras.

- [ ] **Step 3: Reduzir o catálogo de imagens ao contrato consumido**

Substituir `src/data/imagens.ts` por:

```ts
import inkInjector from '../assets/ink-injector-frontal.jpg';
import ecoMarkerTrio from '../assets/eco-marker-trio.jpg';
import ecoMarkerPreto from '../assets/eco-marker-preto.jpg';
import masterColorTrio from '../assets/master-color-trio.jpg';
import masterClean from '../assets/master-clean.jpg';
import moedasCredito from '../assets/moedas-credito.jpg';

export {
  inkInjector,
  ecoMarkerTrio,
  ecoMarkerPreto,
  masterColorTrio,
  masterClean,
  moedasCredito,
};
```

- [ ] **Step 4: Remover imagens e modelos não usados**

Run:

```powershell
git rm -- src/assets/como-usar.jpg src/assets/eco-marker-embalagens.jpg src/assets/eco-marker-trio-tampas.jpg src/assets/ink-injector-aberta.jpg src/assets/kit-completo.jpg src/assets/logo-allcanci.jpg src/assets/logo-eco-sistema-fill.jpg src/assets/logo-fill-eco-marker.jpg src/assets/logo-fill-ink-injector.jpg src/assets/logo-fill-master-clean.jpg src/assets/logo-fill-master-color.jpg src/assets/master-clean-aberto.jpg src/assets/master-color-vermelho.jpg
git rm -r -- src/assets/3d public/models
git rm -- public/favicon.ico
```

Expected: permanecem exatamente as seis JPEGs listadas pelo teste, além de `favicon.svg` e `robots.txt` em `public`.

- [ ] **Step 5: Remover dependências sem consumidores**

Run:

```powershell
npm uninstall @fontsource-variable/archivo @fontsource-variable/bricolage-grotesque @fontsource-variable/dm-sans @fontsource-variable/fraunces @fontsource-variable/inter @fontsource-variable/outfit @fontsource-variable/space-grotesk @fontsource/archivo-black @fontsource/chakra-petch @fontsource/ibm-plex-mono @google/model-viewer three
```

Expected: `package.json` e `package-lock.json` mantêm apenas Astro, sitemap e as três famílias importadas por `Layout.astro`.

- [ ] **Step 6: Executar testes, check e build**

Run:

```powershell
npm test
npm run check
npm run build
```

Expected: todos terminam com exit code `0`; nenhuma importação de imagem ou pacote removido falha.

- [ ] **Step 7: Commitar a redução de recursos**

```powershell
git add scripts/site-definitivo.test.js src/data/imagens.ts package.json package-lock.json
git commit -m "refactor: manter somente recursos do site definitivo"
```

---

### Task 5: Atualizar documentação e contrato do build

**Files:**
- Modify: `README.md`
- Modify: `src/styles/tokens.css`
- Modify: `scripts/check-dist.mjs`
- Modify: `package.json`
- Modify: `package-lock.json` only if npm updates metadata

**Interfaces:**
- Consumes: a única rota raiz e os IDs `hero`, `produtos`, `como-funciona`, `simulador`, `prova-social`, `sustentabilidade`, `faq` e `contato`.
- Produces: comando `npm run verify` e validação determinística de `dist/index.html`.

- [ ] **Step 1: Reescrever o verificador do artefato para uma única página**

Substituir `scripts/check-dist.mjs` por:

```js
import { existsSync, readFileSync, readdirSync } from 'node:fs';

const htmlPath = 'dist/index.html';
const problemas = [];

if (!existsSync(htmlPath)) {
  problemas.push('dist/index.html ausente');
} else {
  const html = readFileSync(htmlPath, 'utf8');
  if (!/<title>[^<]{5,}<\/title>/.test(html)) problemas.push('title ausente ou curto');
  if (!html.includes('lang="pt-BR"')) problemas.push('lang pt-BR ausente');

  for (const id of [
    'hero',
    'produtos',
    'como-funciona',
    'simulador',
    'prova-social',
    'sustentabilidade',
    'faq',
    'contato',
  ]) {
    if (!html.includes(`id="${id}"`)) problemas.push(`seção #${id} ausente`);
  }

  if (/\/Site_allcanci\/v\d+\//i.test(html)) problemas.push('link para rota numerada encontrado');
  if (/30 propostas|propostas de design/i.test(html)) problemas.push('texto do seletor encontrado');
}

const routeDirs = existsSync('dist')
  ? readdirSync('dist', { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && /^v\d+$/.test(entry.name))
      .map((entry) => entry.name)
  : [];

if (routeDirs.length) problemas.push(`rotas numeradas geradas: ${routeDirs.join(', ')}`);

if (problemas.length) {
  console.error(`FALHOU ${htmlPath}:\n- ${problemas.join('\n- ')}`);
  process.exit(1);
}

console.log(`OK ${htmlPath}: somente o site definitivo foi gerado`);
```

- [ ] **Step 2: Atualizar o README com conteúdo definitivo**

Substituir `README.md` por:

````markdown
# Site Allcanci

Site institucional da [Allcanci Tecnologia](https://allcanci.com.br), construído com Astro.

- Site publicado: `https://tarikdsm.github.io/Site_allcanci/`
- Conteúdo estruturado: `src/data/`
- Página principal: `src/pages/index.astro`

## Desenvolvimento

Requer Node.js 22.12 ou superior.

```sh
npm ci
npm run dev
```

## Qualidade

```sh
npm run verify
```

Esse comando executa os testes, a verificação estática do Astro, o build de produção e a inspeção do artefato gerado.

## Publicação

O push para a branch `main` aciona o workflow de GitHub Pages em `.github/workflows/deploy.yml`.
````

- [ ] **Step 3: Neutralizar o comentário global de tokens**

Em `src/styles/tokens.css`, substituir:

```css
/* Base segura para TODAS as versões (inclusive futuras).
```

por:

```css
/* Base segura para o site institucional.
```

- [ ] **Step 4: Adicionar o comando único de verificação**

Em `package.json`, adicionar após `test`:

```json
"verify": "npm test && astro check && astro build && node scripts/check-dist.mjs"
```

Preservar a vírgula JSON necessária entre `test` e `verify`.

- [ ] **Step 5: Executar o contrato completo**

Run:

```powershell
npm run verify
rg -n "\bV[0-9]+\b|\bv[0-9]+\b|v[0-9]+-|--v[0-9]+-|30 propostas|propostas de design|todas as versões" src README.md package.json scripts public .github
```

Expected: `npm run verify` termina com exit code `0`; a busca não encontra resíduos no produto. Expressões legítimas como “proposta de comodato” não são proibidas.

- [ ] **Step 6: Commitar documentação e contratos**

```powershell
git add README.md src/styles/tokens.css scripts/check-dist.mjs package.json package-lock.json
git commit -m "docs: documentar o site institucional definitivo"
```

---

### Task 6: Verificar a experiência em navegador real

**Files:**
- Test: `src/pages/index.astro`
- Test: `src/styles/site.css`
- Test: `src/scripts/site.js`

**Interfaces:**
- Consumes: build validado e comando Astro em background.
- Produces: evidência de que a página raiz funciona em desktop e mobile, e de que rotas antigas não existem.

- [ ] **Step 1: Iniciar o servidor conforme `AGENTS.md`**

Run:

```powershell
npx astro dev --background
npx astro dev status
```

Expected: servidor ativo e URL local informada. Se a porta padrão estiver ocupada, usar a URL retornada pelo status.

- [ ] **Step 2: Validar a página desktop com Playwright**

Abrir a raiz com viewport `1440x900` e verificar:

```text
- título: “Allcanci Tecnologia — Nenhum professor merece pincel seco”
- header e seções hero, produtos, como funciona, simulador, prova social,
  sustentabilidade, FAQ e contato visíveis
- imagens sem quebra
- nenhum erro ou warning relevante no console
- nenhum texto ou link relacionado ao antigo seletor
```

Expected: todas as verificações passam e a captura de página inteira mantém a linguagem visual escolhida.

- [ ] **Step 3: Exercitar o simulador**

No navegador, localizar `#sim-professores`, preencher `10` e conferir:

```text
recargas/ano: 260
descartáveis evitados: 650
plástico evitado: 13 kg
economia estimada: valor monetário formatado em BRL
```

Expected: valores atualizados sem recarregar a página e sem erros no console.

- [ ] **Step 4: Validar mobile e ausência das rotas antigas**

Usar viewport `390x844`, recarregar a raiz e conferir que não existe overflow horizontal, que os CTAs são acessíveis e que header, cards, FAQ e contato não se sobrepõem. Abrir `/v1/`, `/v3/` e `/v30/`.

Expected: raiz utilizável em mobile; as três URLs antigas respondem com página não encontrada e nunca exibem propostas arquivadas.

- [ ] **Step 5: Encerrar o servidor e repetir a verificação automatizada**

Run:

```powershell
npx astro dev stop
npm run verify
git status --short --branch
```

Expected: servidor encerrado; verificação PASS; árvore de trabalho limpa. Se o navegador revelar um defeito, corrigi-lo com teste de regressão e criar um commit `fix:` antes de repetir esta task.

---

### Task 7: Publicar, acompanhar o Pages e compartilhar com a Tassia

**Files:**
- No local file changes expected.
- External state: `origin/main`, GitHub Actions, GitHub Pages e colaboradores do repositório.

**Interfaces:**
- Consumes: branch `main` local validada e commits atômicos das tasks anteriores.
- Produces: `origin/main` atualizado, site público definitivo e convite de escrita para `tassiadsm`.

- [ ] **Step 1: Fazer a verificação final antes de qualquer mutação externa**

Usar `superpowers:verification-before-completion` e executar:

```powershell
npm run verify
git diff --check
git status --short --branch
git log --oneline origin/main..HEAD
git check-ignore -v versoes_extras/site-com-30-versoes/package.json
git ls-files versoes_extras
```

Expected: verificação PASS; somente commits planejados à frente de `origin/main`; `git check-ignore` confirma a regra; `git ls-files versoes_extras` não retorna nada.

- [ ] **Step 2: Enviar a branch principal**

Run:

```powershell
git push origin main
```

Expected: push bem-sucedido sem force; `main` local e `origin/main` apontam para o mesmo commit.

- [ ] **Step 3: Localizar e acompanhar o workflow de publicação**

Run:

```powershell
$headSha = git rev-parse HEAD
$runId = gh run list --workflow deploy.yml --branch main --commit $headSha --limit 1 --json databaseId --jq '.[0].databaseId'
if (-not $runId) { throw "Workflow do commit $headSha ainda não foi registrado" }
gh run watch $runId --exit-status
```

Expected: workflow termina com `conclusion: success`. Se ainda não tiver aparecido, repetir a consulta após o GitHub registrar o push; não acompanhar um run de commit anterior.

- [ ] **Step 4: Validar a página pública sem depender de cache**

Run:

```powershell
$headSha = git rev-parse HEAD
$response = Invoke-WebRequest "https://tarikdsm.github.io/Site_allcanci/?revision=$headSha"
$response.StatusCode
$response.Content -match '<title>Allcanci Tecnologia — Nenhum professor merece pincel seco</title>'
$response.Content -match '/Site_allcanci/v[0-9]+/'
```

Expected: status `200`, título retorna `True`, links numerados retornam `False`.

- [ ] **Step 5: Convidar a colaboradora com escrita**

Run:

```powershell
gh api --method PUT repos/tarikdsm/Site_allcanci/collaborators/tassiadsm -f permission=push --include
```

Expected: HTTP `201 Created` quando um convite novo é enviado, ou `204 No Content` se a usuária já for colaboradora. Não usar nem publicar o e-mail fornecido.

- [ ] **Step 6: Confirmar acesso ou convite pendente**

Run:

```powershell
gh api repos/tarikdsm/Site_allcanci/collaborators/tassiadsm/permission
gh api repos/tarikdsm/Site_allcanci/invitations --jq '.[] | select(.invitee.login == "tassiadsm") | {login: .invitee.login, permissions, created_at}'
```

Expected: a primeira chamada confirma `push` se o convite já foi aceito; caso retorne `404`, a segunda mostra o convite pendente com a permissão solicitada.

- [ ] **Step 7: Registrar o estado final**

Run:

```powershell
git status --short --branch
git log -7 --oneline --decorate
gh run list --workflow deploy.yml --branch main --limit 1 --json status,conclusion,url,headSha
```

Expected: `main...origin/main` sem divergência, árvore limpa, workflow bem-sucedido. Informar ao usuário a URL pública, o caminho absoluto do snapshot local e se a Tassia já tem acesso ou precisa aceitar o convite.
