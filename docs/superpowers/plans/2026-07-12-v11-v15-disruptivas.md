# Allcanci V11–V15 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar cinco novas experiências responsivas, interativas e visualmente distintas no site de propostas da Allcanci.

**Architecture:** Cada versão continua isolada em uma página Astro, um CSS e um módulo JS, consumindo apenas os dados compartilhados existentes. Um pequeno módulo puro concentra cálculos de estado testáveis; o Astro gera HTML estático e o JavaScript adiciona progressive enhancement.

**Tech Stack:** Astro 7, TypeScript no frontmatter, CSS moderno com fallbacks, SVG inline, JavaScript ESM, Node test runner e GitHub Pages.

## Global Constraints

- Manter V1–V10 sem regressões.
- Usar somente fatos e números de `src/data` e `src/scripts/simulador-core.js`.
- Preservar os oito ids de seção na ordem definida na especificação.
- Respeitar `import.meta.env.BASE_URL`, `prefers-reduced-motion`, WCAG AA e alvos de toque de 44×44 px.
- Não adicionar Three.js, model-viewer, WebGL, vídeo, áudio, backend ou coleta de dados.
- Validar 1440×900 e 390×844 antes do push.

---

## File Map

- `scripts/check-dist.mjs`: contrato estrutural do hub e de V1–V15.
- `scripts/experiencias-core.test.js`: testes dos helpers de navegação/estado.
- `src/scripts/experiencias-core.js`: helpers puros compartilhados por V11–V15.
- `src/pages/v11/index.astro`, `src/styles/v11.css`, `src/scripts/v11.js`: Ciclo Infinito.
- `src/pages/v12/index.astro`, `src/styles/v12.css`, `src/scripts/v12.js`: Pitch 90s.
- `src/pages/v13/index.astro`, `src/styles/v13.css`, `src/scripts/v13.js`: Corte o Desperdício.
- `src/pages/v14/index.astro`, `src/styles/v14.css`, `src/scripts/v14.js`: Campus Vivo.
- `src/pages/v15/index.astro`, `src/styles/v15.css`, `src/scripts/v15.js`: Dossiê FILL.
- `src/pages/index.astro`: hub com a nova série.
- `README.md`: catálogo e URLs atualizados.

---

### Task 1: Expandir o contrato estrutural (RED)

**Files:**
- Modify: `scripts/check-dist.mjs`

**Interfaces:**
- Consumes: `dist/<rota>/index.html` gerado pelo Astro.
- Produces: validação do hub V1–V15 e dos oito ids em qualquer rota versionada.

- [ ] **Step 1: Alterar a lista do hub para V1–V15**

```js
const versoes = Array.from({ length: 15 }, (_, i) => `v${i + 1}`);

// no ramo do hub
for (const versao of versoes) {
  if (!html.includes(`/Site_allcanci/${versao}/`)) {
    problemas.push(`link para /${versao}/ ausente`);
  }
}
```

- [ ] **Step 2: Rodar a build atual e observar a falha correta**

Run: `npm run build && node scripts/check-dist.mjs`  
Expected: `FALHOU dist/index.html` com links V11–V15 ausentes.

- [ ] **Step 3: Manter a falha enquanto as rotas não existem**

Não enfraquecer o teste nem criar links vazios. A falha é o contrato que dirige as tasks seguintes.

---

### Task 2: Criar helpers puros de experiência (RED→GREEN)

**Files:**
- Create: `scripts/experiencias-core.test.js`
- Create: `src/scripts/experiencias-core.js`

**Interfaces:**
- Produces: `clampPercent(value)`, `slideDeltaForKey(key)`, `nextIndex(current, delta, count)` e `addVisited(current, id)`.
- Consumed by: V11 progress, V12 keyboard navigation, V13 compare range e V15 checklist.

- [ ] **Step 1: Escrever os testes antes da implementação**

```js
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
```

- [ ] **Step 2: Confirmar RED**

Run: `node --test scripts/experiencias-core.test.js`  
Expected: FAIL porque `src/scripts/experiencias-core.js` ainda não existe.

- [ ] **Step 3: Implementar o mínimo**

```js
export const clampPercent = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(100, Math.max(0, number)) : 0;
};

export const slideDeltaForKey = (key) =>
  key === 'ArrowDown' || key === 'PageDown'
    ? 1
    : key === 'ArrowUp' || key === 'PageUp'
      ? -1
      : 0;

export const nextIndex = (current, delta, count) =>
  Math.min(Math.max(0, count - 1), Math.max(0, current + delta));

export const addVisited = (current, id) =>
  current.includes(id) ? [...current] : [...current, id];
```

- [ ] **Step 4: Confirmar GREEN e regressão**

Run: `npm test`  
Expected: 8 testes passando.

- [ ] **Step 5: Commitar o contrato e os helpers**

```powershell
git add scripts/check-dist.mjs scripts/experiencias-core.test.js src/scripts/experiencias-core.js
git commit -m "test: ampliar contratos para experiencias V11 a V15"
```

---

### Task 3: Implementar V11 — Ciclo Infinito

**Files:**
- Create: `src/pages/v11/index.astro`
- Create: `src/styles/v11.css`
- Create: `src/scripts/v11.js`

**Interfaces:**
- Consumes: todos os módulos `src/data`, `simular`, `reais`, `PREMISSAS`, `bindSimulador` e `clampPercent`.
- Produces: rota `/v11/`, botões `[data-cycle-step]`, marcador `[data-cycle-marker]` e seções padrão.

- [ ] **Step 1: Criar o frontmatter e o mapa de fotos**

Usar os mesmos imports tipados e os mesmos `alt` factuais de V1. Importar Poppins/Nunito já carregadas pelo Layout e `../../styles/v11.css`. Renderizar `sim0 = simular(20)` no servidor.

- [ ] **Step 2: Criar o HTML semântico completo**

Estrutura obrigatória:

```astro
<Layout title="Allcanci Ciclo Infinito — O fim do fim do pincel" ... bodyClass="v11">
  <a class="v11-skip" href="#hero">Pular para o conteúdo</a>
  <header class="v11-topo">...</header>
  <main>
    <section id="hero" aria-labelledby="v11-hero-title">...</section>
    <section id="produtos" aria-labelledby="v11-produtos-title">...</section>
    <section id="como-funciona" aria-labelledby="v11-como-title">...</section>
    <section id="simulador" aria-labelledby="v11-sim-title">...</section>
    <section id="prova-social" aria-labelledby="v11-prova-title">...</section>
    <section id="sustentabilidade" aria-labelledby="v11-sust-title">...</section>
    <section id="faq" aria-labelledby="v11-faq-title">...</section>
    <section id="contato" aria-labelledby="v11-contato-title">...</section>
  </main>
  <script src="../../scripts/v11.js"></script>
</Layout>
```

O hero inclui SVG de circuito decorativo, três botões `aria-pressed`, imagem eager da Ink Injector e CTAs. Produtos mapeiam os seis dados; processo mapeia as seis etapas; FAQ usa `details`.

- [ ] **Step 3: Implementar a direção de arte**

Declarar tokens em `body.v11`, prefixar todas as classes com `.v11-`, criar circuito responsivo, cards-cápsula, palco claro para fotos, simulador e breakpoints 640/900 px. Em `@supports (offset-path: path(...))`, animar o marcador; no fallback, destacar apenas a etapa ativa.

- [ ] **Step 4: Implementar comportamento**

`v11.js` importa `bindSimulador` e `clampPercent`, alterna `aria-pressed`/`data-cycle-active`, calcula o progresso das seções com IntersectionObserver e atualiza `--cycle-progress`. Reduced motion deixa estados imediatos.

- [ ] **Step 5: Verificar isoladamente e commit**

Run: `npm test && npm run check && npm run build && node scripts/check-dist.mjs v11`  
Expected: todos passam, exceto o check do hub que permanece pendente e não é executado aqui.

```powershell
git add src/pages/v11 src/styles/v11.css src/scripts/v11.js
git commit -m "feat: criar experiencia V11 Ciclo Infinito"
```

---

### Task 4: Implementar V12 — Pitch 90s

**Files:**
- Create: `src/pages/v12/index.astro`
- Create: `src/styles/v12.css`
- Create: `src/scripts/v12.js`

**Interfaces:**
- Consumes: dados compartilhados, `bindSimulador`, `slideDeltaForKey`, `nextIndex`.
- Produces: `[data-pitch-slide]`, `[data-persona]`, `[data-pitch-progress]` e rota `/v12/`.

- [ ] **Step 1: Criar página completa com oito slides-seções**

Importar Archivo/DM Sans no frontmatter, dados, imagens, simulador e `v12.css`. As três personas são botões com `aria-pressed`; cada slide mantém um texto-base no HTML e até três microcopys factuais em `data-copy-*`.

- [ ] **Step 2: Criar CSS de palco**

Usar `.v12-slide` com `min-height: 90svh` somente no media query definido na especificação; progress rail sticky, mosaicos assimétricos, tipo grande e scroll snap apenas no mesmo media query. Desligar snap e transições em reduced motion.

- [ ] **Step 3: Implementar navegação acessível**

O script observa o slide ativo, atualiza a barra e intercepta Arrow/Page somente quando o alvo não é `input`, `button`, `a`, `summary`, `select` ou `textarea`. `nextIndex` limita o destino; `scrollIntoView` usa `behavior: 'auto'` em reduced motion. Persona altera classes e textos predefinidos, sem esconder seções.

- [ ] **Step 4: Ligar simulador e verificar**

Run: `npm test && npm run check && npm run build && node scripts/check-dist.mjs v12`  
Expected: exit 0.

- [ ] **Step 5: Commitar**

```powershell
git add src/pages/v12 src/styles/v12.css src/scripts/v12.js
git commit -m "feat: criar experiencia V12 Pitch 90s"
```

---

### Task 5: Implementar V13 — Corte o Desperdício

**Files:**
- Create: `src/pages/v13/index.astro`
- Create: `src/styles/v13.css`
- Create: `src/scripts/v13.js`

**Interfaces:**
- Consumes: dados, `bindSimulador`, `clampPercent`.
- Produces: `#v13-divisor`, `[data-compare]`, barras `[data-impact-bar]` e rota `/v13/`.

- [ ] **Step 1: Criar página antes/depois completa**

Hero com dois painéis sobrepostos e `input[type=range]` rotulado; todos os dados tradicionais exibidos vêm das premissas do simulador. Produtos, processo, simulador, prova, sustentabilidade, FAQ e contato seguem a especificação.

- [ ] **Step 2: Criar CSS de divisor**

Usar `--split: 50%`, `clip-path: inset(0 0 0 var(--split))` no painel FILL e handle visual separado do range real. Em `<640px`, trocar para composição vertical legível sem posicionamento fixed.

- [ ] **Step 3: Ligar divisor e impacto**

O range chama `clampPercent`, atualiza `--split` e `aria-valuetext`. O callback do `bindSimulador` atualiza a largura relativa das barras usando os resultados reais, sem criar nova fórmula financeira.

- [ ] **Step 4: Verificar e commit**

Run: `npm test && npm run check && npm run build && node scripts/check-dist.mjs v13`  
Expected: exit 0.

```powershell
git add src/pages/v13 src/styles/v13.css src/scripts/v13.js
git commit -m "feat: criar experiencia V13 Corte o Desperdicio"
```

---

### Task 6: Implementar V14 — Campus Vivo

**Files:**
- Create: `src/pages/v14/index.astro`
- Create: `src/styles/v14.css`
- Create: `src/scripts/v14.js`

**Interfaces:**
- Consumes: dados e `bindSimulador`.
- Produces: hotspots `[data-campus-target]`, mapa `[data-campus-map]`, rota ativa e `/v14/`.

- [ ] **Step 1: Desenhar SVG isométrico sem dados fictícios**

Criar quatro grupos visuais (sala, coordenação, estoque, recarga) com formas SVG, `aria-hidden`; sobrepor quatro botões HTML posicionados e rotulados. Os botões apontam para seções existentes, não para escolas reais.

- [ ] **Step 2: Criar as oito seções e conteúdo**

Importar Bricolage Grotesque/DM Sans, dados, imagens e CSS. Usar cards de inventário, rota em seis etapas, central de gestão para o simulador, área verde de sustentabilidade e portaria para contato.

- [ ] **Step 3: Criar CSS responsivo e movimento reduzido**

Desktop usa mapa em palco largo e sombras isométricas; mobile apresenta minimapa curto e lista de destinos. Pulse/veículos decorativos param em reduced motion. Hotspots mantêm 44 px.

- [ ] **Step 4: Ligar mapa e seções**

Cliques usam `scrollIntoView`; IntersectionObserver define `data-active-zone` e `aria-current="location"` no destino correspondente. Ligar simulador e revelações.

- [ ] **Step 5: Verificar e commit**

Run: `npm test && npm run check && npm run build && node scripts/check-dist.mjs v14`  
Expected: exit 0.

```powershell
git add src/pages/v14 src/styles/v14.css src/scripts/v14.js
git commit -m "feat: criar experiencia V14 Campus Vivo"
```

---

### Task 7: Implementar V15 — Dossiê FILL

**Files:**
- Create: `src/pages/v15/index.astro`
- Create: `src/styles/v15.css`
- Create: `src/scripts/v15.js`

**Interfaces:**
- Consumes: dados, `bindSimulador`, `addVisited`.
- Produces: abas `[data-dossier-tab]`, itens `[data-check-section]`, contador de leitura e `/v15/`.

- [ ] **Step 1: Criar a pasta documental completa**

Importar Fraunces/IBM Plex Mono, dados, imagens e CSS. Cada seção é uma folha com metadados e uma aba correspondente. O checklist possui checkboxes reais e rótulos; visitar a seção pode marcá-los, mas o usuário pode alterar o estado.

- [ ] **Step 2: Criar CSS de papel premium**

Mesa escura, folha clara, abas coloridas, carimbos textuais decorativos com `aria-hidden`, clipes CSS e layout de planilha para o simulador. Mobile remove a mesa lateral e transforma abas em rail horizontal rolável.

- [ ] **Step 3: Ligar abas, checklist e transições**

IntersectionObserver usa `addVisited`, atualiza `aria-current` e checkboxes ainda não alterados manualmente. Cliques nas abas rolam de forma nativa; se `document.startViewTransition` existir e não houver reduced motion, envolver apenas a troca de classe visual.

- [ ] **Step 4: Verificar e commit**

Run: `npm test && npm run check && npm run build && node scripts/check-dist.mjs v15`  
Expected: exit 0.

```powershell
git add src/pages/v15 src/styles/v15.css src/scripts/v15.js
git commit -m "feat: criar experiencia V15 Dossie FILL"
```

---

### Task 8: Atualizar hub e documentação

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `README.md`

**Interfaces:**
- Consumes: rotas V1–V15.
- Produces: hub completo com `serieExperiencias` e documentação de acesso.

- [ ] **Step 1: Adicionar `serieExperiencias`**

```js
const serieExperiencias = [
  { num: 'V11', slug: 'v11', nome: 'Ciclo Infinito', descricao: 'Usar, recarregar e continuar em um circuito vivo.', paleta: ['#f1efe7', '#0000fe', '#00a85a', '#d7ff54'] },
  { num: 'V12', slug: 'v12', nome: 'Pitch 90s', descricao: 'Uma apresentação imersiva para cada decisor.', paleta: ['#0d1026', '#4b5cff', '#ffd100', '#57e5ff'] },
  { num: 'V13', slug: 'v13', nome: 'Corte o Desperdício', descricao: 'Arraste a escola para o lado inteligente.', paleta: ['#dedbd2', '#ff6a3d', '#fefff0', '#0000fe'] },
  { num: 'V14', slug: 'v14', nome: 'Campus Vivo', descricao: 'Explore o ecossistema FILL dentro da escola.', paleta: ['#ccecff', '#dfffbd', '#0000fe', '#ffd100'] },
  { num: 'V15', slug: 'v15', nome: 'Dossiê FILL', descricao: 'A decisão institucional organizada em uma pasta viva.', paleta: ['#10192f', '#f3ead8', '#1746d1', '#c93832'] },
];
```

- [ ] **Step 2: Renderizar a nova série primeiro**

Reutilizar o card existente, badge “Interativa”, atualizar hero, title, description e textos de 10 para 15. Ajustar o seletor de layout para cinco cards sem depender de `nth-child` de outra série.

- [ ] **Step 3: Atualizar README**

Documentar as três séries e URLs V11–V15; atualizar o título para 15 versões.

- [ ] **Step 4: Confirmar o contrato completo**

Run: `npm run build && node scripts/check-dist.mjs`  
Expected: `OK dist/index.html`.

- [ ] **Step 5: Commitar**

```powershell
git add src/pages/index.astro README.md
git commit -m "feat: apresentar V11 a V15 no hub"
```

---

### Task 9: QA automatizado e visual

**Files:**
- Modify only if verification reveals a defect in scoped files.

- [ ] **Step 1: Rodar a verificação completa fresca**

Run:

```powershell
npm test
npm run check
npm run build
node scripts/check-dist.mjs
11..15 | ForEach-Object { node scripts/check-dist.mjs "v$_" }
git diff --check
```

Expected: testes sem falhas, Astro com 0 erros/warnings/hints, 16 páginas geradas, todos os checks `OK` e diff limpo.

- [ ] **Step 2: Servir a build**

Run: `npx astro preview --host 127.0.0.1` em background conforme `AGENTS.md`/ferramenta disponível.  
Expected: site acessível em `http://127.0.0.1:4321/Site_allcanci/`.

- [ ] **Step 3: Validar desktop e mobile**

Para hub e V11–V15, capturar screenshots em 1440×900 e 390×844. Em cada rota, verificar topo, hero, uma seção intermediária e contato; confirmar sem overflow horizontal e sem sobreposição.

- [ ] **Step 4: Exercitar interações**

- V11: selecionar as três etapas do ciclo.
- V12: trocar persona e navegar por teclado.
- V13: mover divisor e alterar professores.
- V14: acionar hotspots e confirmar rota ativa.
- V15: navegar por abas e editar checklist.
- Todas: abrir FAQ, tabular pelos controles, confirmar CTA e console sem erros.

- [ ] **Step 5: Corrigir no máximo três ciclos e repetir a verificação completa**

Qualquer bug recebe reprodução automatizada quando aplicável antes da correção.

---

### Task 10: Publicar e verificar GitHub Pages

**Files:**
- No new files unless deployment diagnosis requires an in-scope fix.

- [ ] **Step 1: Confirmar estado local**

Run: `git status --short && git log -10 --oneline --decorate`  
Expected: worktree limpo e commits atômicos presentes na `main`.

- [ ] **Step 2: Fazer push**

Run: `git push origin main`  
Expected: `main -> main` sem rejeição.

- [ ] **Step 3: Aguardar workflow**

Run: `gh run list --workflow deploy.yml --limit 1` e `gh run watch <id> --exit-status`.  
Expected: conclusão `success`.

- [ ] **Step 4: Verificar produção**

Abrir `https://tarikdsm.github.io/Site_allcanci/` e as rotas `/v11/`–`/v15/`; confirmar HTTP/DOM, assets sob o base path e pelo menos uma interação em produção.

- [ ] **Step 5: Relatar entrega**

Informar URL do hub, cinco URLs novas, checks executados, workflow e qualquer limitação residual real.
