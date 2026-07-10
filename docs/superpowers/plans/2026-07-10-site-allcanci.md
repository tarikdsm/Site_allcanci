# Site Allcanci (5 versões + GitHub Pages) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar no GitHub Pages o repositório público `Site_allcanci` (conta **tarikdsm**) com um hub e 5 versões one-page radicalmente diferentes do site da Allcanci Tecnologia, todas dentro da marca, com conteúdo único compartilhado, design system sincronizado no claude.ai/design e deploy automático.

**Architecture:** Astro 6 (saída 100% estática) com dados TypeScript em `src/data/` consumidos por 6 páginas (`/` hub + `/v1`…`/v5`). Cada versão tem CSS/JS próprios e isolados; tokens da marca são globais. Deploy via GitHub Actions (`withastro/action@v6` → `actions/deploy-pages@v5`).

**Tech Stack:** Astro ^6, TypeScript, @fontsource (Poppins/Nunito/Nunito Sans), @astrojs/sitemap, JS vanilla (zero framework de UI), node:test para lógica, gh CLI para GitHub, DesignSync para claude.ai/design.

**Spec:** `docs/superpowers/specs/2026-07-10-site-allcanci-design.md` (leia antes de executar qualquer task).

## Global Constraints

- Repo local: `D:\Projetos TI\Allcanci\Site\Site_allcanci` (git já iniciado, branch `main`). Shell: PowerShell 5.1 — **não use `&&`**; separe comandos com `;` ou linhas.
- GitHub: usuário **tarikdsm**, repo público **Site_allcanci**. URLs finais: `https://tarikdsm.github.io/Site_allcanci/` e `/v1/`…`/v5/`.
- Astro config: `site: 'https://tarikdsm.github.io'`, `base: '/Site_allcanci'`. Todo link interno usa `import.meta.env.BASE_URL` (nunca `/` hardcoded).
- Paleta (exata, do manual): azul `#0000FE`, azul-claro `#008AFF`, névoa `#BBE0EF`, creme `#FEFFF0`, preto `#080808`; opostas `#00FF60`, `#FFD100`, `#FF0C00`; sombras `#0000DB`, `#0000B3`, `#00008A`, `#000061`. Fontes: **Poppins** (display), **Nunito** (títulos), **Nunito Sans** (texto). Nenhuma cor/fonte fora disso.
- Idioma PT-BR (`<html lang="pt-BR">`). Acessibilidade AA (contraste, foco visível, teclado, aria). Toda animação respeita `@media (prefers-reduced-motion: reduce)` com fallback estático.
- Conteúdo vem SOMENTE de `src/data/` — nenhum texto de produto/FAQ/contato hardcoded em páginas. Não inventar depoimentos nomeados.
- IDs de seção obrigatórios em toda versão: `hero`, `produtos`, `como-funciona`, `simulador`, `prova-social`, `sustentabilidade`, `faq`, `contato`.
- Imagens com xadrez de falsa transparência gravado no JPEG (ex.: garrafas Master Color, moedas 3D) só podem aparecer **sobre superfícies claras** — nunca soltas em fundo escuro.
- Todo commit termina com as duas linhas:
  `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`
  `Claude-Session: https://claude.ai/code/session_01FWCJd1bVy4332kBrcPdofM`
- Commits: use `git commit -m @'...'@` (here-string PowerShell, `'@` na coluna 0).

---

### Task 1: Scaffold Astro + tokens + Layout base

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`, `README.md`
- Create: `src/styles/tokens.css`, `src/layouts/Layout.astro`, `src/pages/index.astro` (placeholder mínimo), `public/favicon.svg`

**Interfaces:**
- Produces: `Layout.astro` com props `{ title: string; description: string; bodyClass?: string }` — todas as páginas usam. Tokens CSS globais (`--azul`, `--azul-claro`, `--nevoa`, `--creme`, `--preto`, `--verde`, `--amarelo`, `--vermelho`, `--azul-700/800/900/950`, `--branco`, `--font-display`, `--font-titulo`, `--font-texto`). Scripts npm: `dev`, `build`, `preview`, `check`, `test`.

- [ ] **Step 1: Scaffold do projeto na raiz do repo**

```powershell
cd "D:\Projetos TI\Allcanci\Site\Site_allcanci"
npm create astro@latest . -- --template minimal --no-git --install --yes
npx astro add sitemap --yes
npm install @fontsource/poppins @fontsource/nunito @fontsource/nunito-sans
npm install --save-dev typescript
```
Expected: projeto criado sem erro (o scaffold aceita diretório não-vazio mantendo `docs/`; se perguntar, responda que sim/continue). `npm run dev` funcional.

- [ ] **Step 2: Configurar `astro.config.mjs`**

```js
// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://tarikdsm.github.io',
  base: '/Site_allcanci',
  integrations: [sitemap()],
});
```

- [ ] **Step 3: `.gitignore`**

```
node_modules/
dist/
.astro/
```

- [ ] **Step 4: `src/styles/tokens.css`** (design system da marca — conteúdo completo)

```css
/* Design tokens — manual de marca Allcanci */
:root {
  /* Cores de trabalho */
  --azul: #0000fe;
  --azul-claro: #008aff;
  --nevoa: #bbe0ef;
  --creme: #fefff0;
  --preto: #080808;
  --branco: #ffffff;
  /* Cores opostas (acentos) */
  --verde: #00ff60;
  --amarelo: #ffd100;
  --vermelho: #ff0c00;
  /* Sombras do azul */
  --azul-700: #0000db;
  --azul-800: #0000b3;
  --azul-900: #00008a;
  --azul-950: #000061;
  /* Tipografia */
  --font-display: 'Poppins', system-ui, sans-serif;
  --font-titulo: 'Nunito', system-ui, sans-serif;
  --font-texto: 'Nunito Sans', system-ui, sans-serif;
  /* Escala tipográfica fluida */
  --texto-xs: 0.8rem;
  --texto-sm: 0.94rem;
  --texto-base: 1.06rem;
  --texto-lg: clamp(1.15rem, 1rem + 0.6vw, 1.35rem);
  --titulo-sm: clamp(1.4rem, 1.2rem + 1vw, 2rem);
  --titulo-md: clamp(2rem, 1.5rem + 2.2vw, 3.4rem);
  --titulo-lg: clamp(2.6rem, 1.8rem + 3.6vw, 4.6rem);
  --display-xl: clamp(3rem, 2rem + 5.5vw, 6.5rem);
  /* Espaços e formas */
  --espaco-secao: clamp(4rem, 3rem + 5vw, 7.5rem);
  --raio-sm: 10px;
  --raio-md: 22px;
  --raio-lg: 30px;
  --raio-pill: 999px;
  --largura-conteudo: 1180px;
  /* Sombras */
  --sombra-azul: 0 20px 60px rgba(0, 0, 254, 0.16);
  --sombra-tinta: 0 18px 40px rgba(8, 8, 8, 0.18);
}

*, *::before, *::after { box-sizing: border-box; }
html { scroll-behavior: smooth; }
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
}
body { margin: 0; font-family: var(--font-texto); color: var(--preto); }
img { display: block; max-width: 100%; height: auto; }
:focus-visible { outline: 3px solid var(--azul-claro); outline-offset: 3px; }
.visually-hidden { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
```

- [ ] **Step 5: `src/layouts/Layout.astro`**

```astro
---
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/900.css';
import '@fontsource/nunito/800.css';
import '@fontsource/nunito/900.css';
import '@fontsource/nunito-sans/400.css';
import '@fontsource/nunito-sans/700.css';
import '@fontsource/nunito-sans/800.css';
import '../styles/tokens.css';

interface Props { title: string; description: string; bodyClass?: string }
const { title, description, bodyClass = '' } = Astro.props;
const base = import.meta.env.BASE_URL;
---
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="icon" type="image/svg+xml" href={`${base}/favicon.svg`} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="pt_BR" />
  </head>
  <body class={bodyClass}>
    <slot />
  </body>
</html>
```

- [ ] **Step 6: `public/favicon.svg`** (ícone FILL: quadrado azul arredondado + gota branca)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="16" fill="#0000fe"/>
  <path d="M32 14c7 9 12 15 12 21a12 12 0 0 1-24 0c0-6 5-12 12-21z" fill="#fff"/>
  <path d="M12 44c6-3 14 3 20 0s14 3 20 0v8a12 12 0 0 1-12 12H24a12 12 0 0 1-12-12z" fill="#fff" opacity=".85"/>
</svg>
```

- [ ] **Step 7: `src/pages/index.astro` placeholder** (será substituído na Task 6)

```astro
---
import Layout from '../layouts/Layout.astro';
---
<Layout title="Allcanci Tecnologia — Novo site (5 versões)" description="Cinco propostas de novo site para a Allcanci Tecnologia.">
  <main style="min-height:100vh;display:grid;place-items:center;background:var(--azul);color:var(--branco);font-family:var(--font-display);">
    <h1>Allcanci — 5 versões em construção</h1>
  </main>
</Layout>
```

- [ ] **Step 8: `README.md`**

Conteúdo (em markdown normal; o bloco de desenvolvimento é um fence de código com `npm install` e `npm run dev`):

- Título: `# Site Allcanci — 5 versões`
- Parágrafo: `Novo site institucional da [Allcanci Tecnologia](https://allcanci.com.br) em 5 propostas visuais.`
- Lista: Hub `https://tarikdsm.github.io/Site_allcanci/`; Versões: `/v1` Laboratório · `/v2` Editorial · `/v3` Sala de Aula · `/v4` Produto · `/v5` Tinta Viva
- Parágrafo: `Stack: Astro 6, conteúdo único em src/data/, deploy automático via GitHub Actions.`
- Seção `## Desenvolvimento` com fence contendo as duas linhas: `npm install` e `npm run dev`

- [ ] **Step 9: Adicionar script `test` e `check` ao `package.json`** (merge nos scripts existentes)

```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "check": "astro check",
  "test": "node --test scripts/"
}
```
`astro check` pede: `npm i -D @astrojs/check typescript` — instale se o comando reclamar.

- [ ] **Step 10: Verificar build**

Run: `npm run build`
Expected: `Complete!` sem erros; `dist/index.html` existe e contém `Allcanci`.

- [ ] **Step 11: Commit**

```powershell
git add -A
git commit -m @'
feat: scaffold Astro 6 + tokens da marca + layout base

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FWCJd1bVy4332kBrcPdofM
'@
```

---

### Task 2: Repo GitHub + Pages + CI de deploy

**Files:**
- Create: `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: projeto buildável da Task 1.
- Produces: deploy automático em push na `main`; site no ar em `https://tarikdsm.github.io/Site_allcanci/`.

- [ ] **Step 1: Workflow `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v7
      - name: Build Astro
        uses: withastro/action@v6

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v5
```

- [ ] **Step 2: Commit do workflow**

```powershell
git add .github/workflows/deploy.yml
git commit -m @'
ci: deploy automatico no GitHub Pages via withastro/action

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FWCJd1bVy4332kBrcPdofM
'@
```

- [ ] **Step 3: Criar repo público e push**

```powershell
gh repo create Site_allcanci --public --description "Novo site da Allcanci Tecnologia - 5 versoes no GitHub Pages" --source . --remote origin --push
```
Expected: `✓ Created repository tarikdsm/Site_allcanci` e push da `main`.

- [ ] **Step 4: Habilitar Pages com source=GitHub Actions**

```powershell
gh api -X POST repos/tarikdsm/Site_allcanci/pages -f build_type=workflow
```
Expected: JSON com `"build_type": "workflow"`. Se retornar 409 (já existe), rode:
```powershell
gh api -X PUT repos/tarikdsm/Site_allcanci/pages -f build_type=workflow
```

- [ ] **Step 5: Acompanhar o run e validar o site no ar**

```powershell
gh run watch --repo tarikdsm/Site_allcanci --exit-status
curl.exe -sI https://tarikdsm.github.io/Site_allcanci/ | Select-Object -First 1
```
Expected: run `✓` concluído; resposta `HTTP/2 200`. Se o primeiro run tiver começado antes do Pages ser habilitado e falhar no deploy, rode `gh workflow run "Deploy to GitHub Pages" --repo tarikdsm/Site_allcanci` e repita a validação.

---

### Task 3: Camada de dados (conteúdo real único)

**Files:**
- Create: `src/data/site.ts`, `src/data/produtos.ts`, `src/data/comodato.ts`, `src/data/faq.ts`, `src/data/provaSocial.ts`, `src/data/sustentabilidade.ts`

**Interfaces:**
- Produces (exports exatos, consumidos por TODAS as páginas):
  - `site.ts`: `empresa { nome, slogan, descricao, cidade }`, `numeros { escolas: string; recargaSegundos: number; escritaKm: number; entregaDiasUteis: number; precoCreditoReais: number; recargasPorProfessorAno: number }`, `contatos { email, telefone, whatsappUrl, endereco }`, `redes: { nome: string; url: string }[]`, `diferenciais: { titulo: string; texto: string }[]`
  - `produtos.ts`: `type Produto = { id: string; nome: string; subtitulo: string; descricao: string; destaques: string[] }`, `produtos: Produto[]` (6 itens: ink-injector, eco-marker, master-color, master-clean, refil, app)
  - `comodato.ts`: `etapasComodato: { titulo: string; texto: string }[]` (6 etapas)
  - `faq.ts`: `faq: { pergunta: string; resposta: string }[]` (10 itens)
  - `provaSocial.ts`: `provaSocial { titulo: string; texto: string; selos: string[]; depoimentos: { citacao: string; autor: string; instituicao: string }[] }` (depoimentos = `[]` por enquanto)
  - `sustentabilidade.ts`: `sustentabilidade { titulo: string; texto: string; pontos: { titulo: string; texto: string }[] }`

- [ ] **Step 1: Escrever `src/data/site.ts`**

```ts
export const empresa = {
  nome: 'Allcanci Tecnologia',
  slogan: 'Recarga inteligente para quadro branco',
  descricao:
    'Tecnologia 100% nacional e patenteada que substitui pincéis descartáveis por um ecossistema de recarga automática: menos desperdício, mais controle.',
  cidade: 'Betim/MG',
};

export const numeros = {
  escolas: '+500',
  recargaSegundos: 22,
  escritaKm: 1,
  entregaDiasUteis: 15,
  precoCreditoReais: 10.99,
  recargasPorProfessorAno: 26,
};

export const contatos = {
  email: 'comercial@allcanci.com.br',
  telefone: '(31) 98292-9147',
  whatsappUrl: 'https://wa.link/9e5gos',
  endereco: 'Rua Dom Afonso Henrique, 713 — Betim/MG',
};

export const redes = [
  { nome: 'Instagram', url: 'https://instagram.com/allcanci.tecnologia/' },
  { nome: 'LinkedIn', url: 'https://linkedin.com/company/allcanci/' },
  { nome: 'YouTube', url: 'https://youtube.com/@allcanci.tecnologia' },
];

export const diferenciais = [
  { titulo: 'Única no mundo', texto: 'Única fabricante dessa tecnologia no mundo, com patente registrada.' },
  { titulo: 'Pronta para licitações', texto: 'Documentação completa para compras públicas, com nota fiscal eletrônica ou fatura de locação.' },
  { titulo: 'Suporte de verdade', texto: 'Suporte técnico especializado durante toda a vida útil do produto.' },
  { titulo: 'Garantia de satisfação', texto: 'Garantia total de satisfação, sem burocracia.' },
  { titulo: 'Entrega em todo o Brasil', texto: 'Entrega em até 15 dias úteis após a confirmação do pedido.' },
];
```

- [ ] **Step 2: Escrever `src/data/produtos.ts`**

```ts
export type Produto = {
  id: string;
  nome: string;
  subtitulo: string;
  descricao: string;
  destaques: string[];
};

export const produtos: Produto[] = [
  {
    id: 'ink-injector',
    nome: 'FILL Ink Injector',
    subtitulo: 'Máquina de recarga automática',
    descricao:
      'A máquina que recarrega pincéis de quadro branco de forma automática, precisa e sem sujeira — em cerca de 22 segundos.',
    destaques: ['Recarga automática em ~22s', 'Sem contato com a tinta, sem sujeira', 'Carrega azul, preto e vermelho'],
  },
  {
    id: 'eco-marker',
    nome: 'FILL Eco Marker',
    subtitulo: 'Pincel reutilizável',
    descricao:
      'O pincel que não precisa ser aberto para recarregar. Cada recarga rende cerca de 1 km de escrita, com traço sempre uniforme.',
    destaques: ['Recarga sem abrir o pincel', '~1 km de escrita por recarga', 'Feito para durar anos'],
  },
  {
    id: 'master-color',
    nome: 'FILL Master Color',
    subtitulo: 'Tinta 500 ml',
    descricao:
      'Tinta de alta performance desenvolvida com parceiro exclusivo, em frascos de 500 ml, para uso exclusivo na Ink Injector.',
    destaques: ['Azul, preto e vermelho', 'Padrões rigorosos de qualidade', 'Uso exclusivo na FILL Ink Injector'],
  },
  {
    id: 'master-clean',
    nome: 'FILL Master Clean 3P',
    subtitulo: 'Estojo apagador',
    descricao:
      'Estojo com apagador que armazena e protege até 3 pincéis, mantendo tudo organizado na mesa do professor.',
    destaques: ['Armazena 3 pincéis', 'Capa protetora', 'Apagador integrado'],
  },
  {
    id: 'refil',
    nome: 'Refil Removível FILL',
    subtitulo: 'Feltro trocável',
    descricao:
      'O feltro do Eco Marker é substituível: quando a ponta desgasta, troca-se só o refil — o pincel continua.',
    destaques: ['Troca em segundos', 'Prolonga a vida útil do pincel', 'Menos plástico descartado'],
  },
  {
    id: 'app',
    nome: 'App de Gestão Allcanci',
    subtitulo: 'Controle em tempo real',
    descricao:
      'Aplicativo de gestão para acompanhar o consumo de tinta e as recargas da instituição em tempo real.',
    destaques: ['Consumo por período', 'Controle de créditos', 'Visão por unidade escolar'],
  },
];
```

- [ ] **Step 3: Escrever `src/data/comodato.ts`**

```ts
export const etapasComodato = [
  { titulo: 'Diagnóstico', texto: 'Levantamos o número de professores, salas e o consumo atual de pincéis descartáveis da instituição.' },
  { titulo: 'Proposta sob medida', texto: 'Você recebe uma proposta de comodato com máquina, pincéis e créditos de recarga dimensionados para a sua realidade.' },
  { titulo: 'Instalação e treinamento', texto: 'Entregamos em até 15 dias úteis, instalamos a Ink Injector e treinamos a equipe.' },
  { titulo: 'Uso diário', texto: 'Professores usam os Eco Markers normalmente — sem pincel seco no meio da aula.' },
  { titulo: 'Recarga com créditos', texto: 'Acabou a tinta? A recarga automática leva ~22 segundos e consome 1 crédito (R$ 10,99).' },
  { titulo: 'Gestão e suporte contínuos', texto: 'Acompanhe tudo pelo app e conte com suporte técnico durante toda a vigência do contrato.' },
];
```

- [ ] **Step 4: Escrever `src/data/faq.ts`** (conteúdo real do site atual)

```ts
export const faq = [
  { pergunta: 'O sistema Allcanci serve para qualquer quadro branco ou de vidro?', resposta: 'Sim! Todos os produtos FILL são compatíveis com quadros brancos e de vidro.' },
  { pergunta: 'O serviço tem nota fiscal e documentação para licitação?', resposta: 'Sim. Todos os serviços da Allcanci são vendidos com nota fiscal eletrônica ou fatura de locação, com documentação completa para compras públicas.' },
  { pergunta: 'Qual é o prazo de entrega e quem faz a instalação?', resposta: 'O prazo de entrega é de até 15 dias úteis após a confirmação do pedido, para todo o Brasil, com instalação e treinamento incluídos.' },
  { pergunta: 'E se eu não ficar satisfeito com o produto?', resposta: 'A Allcanci oferece garantia total de satisfação, sem burocracia.' },
  { pergunta: 'Como funciona o suporte técnico?', resposta: 'O suporte técnico especializado acompanha o cliente durante toda a vida útil do produto.' },
  { pergunta: 'Vocês atendem escolas públicas e municipais?', resposta: 'Sim! Atendemos escolas públicas municipais, estaduais e federais em todo o Brasil.' },
  { pergunta: 'Posso usar qualquer marcador na máquina FILL?', resposta: 'Não. Desenvolvemos nossos próprios marcadores para garantir máxima durabilidade e eficiência na recarga.' },
  { pergunta: 'Quanto tempo dura uma recarga?', resposta: 'Cada recarga tem rendimento calculado de aproximadamente 1 km de escrita, garantindo economia real e previsibilidade no consumo.' },
  { pergunta: 'A tinta FILL é segura?', resposta: 'Sim! Nossa tinta é fornecida por parceiro exclusivo e atende a rigorosos padrões de qualidade.' },
  { pergunta: 'Quais cores a máquina recarrega?', resposta: 'A FILL Ink Injector recarrega pincéis nas cores azul, preto e vermelho.' },
];
```

- [ ] **Step 5: Escrever `src/data/provaSocial.ts` e `src/data/sustentabilidade.ts`**

```ts
// provaSocial.ts
export const provaSocial = {
  titulo: 'Quem usou, aprovou',
  texto:
    'Mais de 500 escolas em todo o Brasil já trocaram o pincel descartável pelo ecossistema FILL — de redes municipais a grandes grupos educacionais.',
  selos: [
    'Tecnologia patenteada',
    'Única fabricante no mundo',
    'Documentação para licitações',
    'Garantia total de satisfação',
    'Suporte por toda a vida útil',
    'Entrega em até 15 dias úteis',
  ],
  depoimentos: [] as { citacao: string; autor: string; instituicao: string }[],
};
```

```ts
// sustentabilidade.ts
export const sustentabilidade = {
  titulo: 'Menos descarte, mais futuro',
  texto:
    'Cada pincel descartável evitado é plástico que não vai para o lixo. O ecossistema FILL foi desenhado para reduzir resíduo em cada detalhe.',
  pontos: [
    { titulo: 'Pincéis que não viram lixo', texto: 'O Eco Marker é recarregado centenas de vezes em vez de ser descartado.' },
    { titulo: 'Refil em vez de pincel novo', texto: 'Desgastou a ponta? Troca-se apenas o feltro removível.' },
    { titulo: 'Tinta a granel', texto: 'Frascos de 500 ml recarregam dezenas de pincéis, substituindo dezenas de embalagens.' },
    { titulo: 'Consumo sob controle', texto: 'Com o app de gestão, a instituição enxerga e reduz o próprio consumo.' },
  ],
};
```

- [ ] **Step 6: Verificar tipos e build**

Run: `npm run check; npm run build`
Expected: 0 errors, build `Complete!` (dados ainda não usados — sem erro é o suficiente).

- [ ] **Step 7: Commit**

```powershell
git add src/data
git commit -m @'
feat: camada de dados unica com conteudo real (produtos, FAQ, comodato, prova social)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FWCJd1bVy4332kBrcPdofM
'@
```

---

### Task 4: Assets — catálogo e manifesto de imagens

**Files:**
- Create: `src/assets/` (imagens copiadas e renomeadas de `D:\Projetos TI\Allcanci\Site\temp\`)
- Create: `src/data/imagens.ts`

**Interfaces:**
- Produces: `imagens.ts` exportando `ImageMetadata` nomeadas: `logoAllcanci`, `inkInjector` (melhor foto da máquina), `ecoMarkerTrio`, `ecoMarkerPreto`, `masterColorTrio`, `masterColorVermelho`, `masterClean` (estojo), `moedasCredito`, `logoFillEcoMarker`, `logoFillInkInjector`, `logoFillMasterColor`, `logoFillMasterClean`, `logoEcoSistemaFill` + `imagensEscurasProibidas: string[]` (nomes dos arquivos com xadrez baked-in).

- [ ] **Step 1: Catalogar as 53 imagens**

Use a ferramenta Read para VER cada `temp\WhatsApp Image *.jpeg` (são 53). Classifique cada uma: produto (qual), logo, página do manual de marca, foto de contexto/escola, lifestyle. Mapeamentos já conhecidos:
- `11.33.42.jpeg` = página do manual: paleta de cores
- `11.34.01.jpeg` = página do manual: fontes + logo allcanci tecnologia
- `11.35.15 (5).jpeg` = garrafa Master Color vermelha (FUNDO XADREZ — só sobre claro)
- `11.35.16 (3).jpeg` = trio de garrafas Master Color azul/vermelha/preta (FUNDO XADREZ)
- `11.35.16 (10).jpeg` = Eco Marker preto individual (fundo branco real)
- `11.36.09.jpeg` = logo FILL Eco Marker (horizontal, fundo cinza-claro)
- `11.36.10 (2).jpeg` = moedas 3D azuis de crédito (FUNDO XADREZ)
- `11.36.37.jpeg` = trio Eco Marker vermelho/preto/azul (fundo cinza-claro real)
- `11.43.44.jpeg` = logo FILL Master Clean
- `11.47.28.jpeg` = logo FILL Eco Marker (variação)
- `11.47.29.jpeg` = logo FILL Ink Injector
- `11.51.24.jpeg` = logo Eco Sistema FILL
- `11.51.24 (2).jpeg` = logo FILL Master Color

- [ ] **Step 2: Copiar com nomes semânticos para `src/assets/`**

Padrão de nome: kebab-case descritivo, ex.:
```powershell
New-Item -ItemType Directory -Force src/assets
Copy-Item "..\temp\WhatsApp Image 2026-07-10 at 11.36.37.jpeg" "src/assets/eco-marker-trio.jpg"
Copy-Item "..\temp\WhatsApp Image 2026-07-10 at 11.35.16 (10).jpeg" "src/assets/eco-marker-preto.jpg"
Copy-Item "..\temp\WhatsApp Image 2026-07-10 at 11.35.16 (3).jpeg" "src/assets/master-color-trio.jpg"
# ...repita para TODAS as imagens úteis (produtos, máquina, contexto). Páginas do manual de marca NÃO vão para src/assets (não são conteúdo do site).
```
A foto da máquina Ink Injector deve estar entre as não catalogadas — identifique-a no Step 1 e nomeie `ink-injector.jpg` (se houver várias, sufixe `-frontal`, `-aberta`, etc.).

- [ ] **Step 3: Escrever `src/data/imagens.ts`**

```ts
import logoFillEcoMarker from '../assets/logo-fill-eco-marker.jpg';
import ecoMarkerTrio from '../assets/eco-marker-trio.jpg';
import ecoMarkerPreto from '../assets/eco-marker-preto.jpg';
import masterColorTrio from '../assets/master-color-trio.jpg';
// ...importe todas as catalogadas com estes nomes de export:
export {
  logoFillEcoMarker,
  ecoMarkerTrio,
  ecoMarkerPreto,
  masterColorTrio,
  // + inkInjector, masterColorVermelho, masterClean, moedasCredito,
  //   logoFillInkInjector, logoFillMasterColor, logoFillMasterClean, logoEcoSistemaFill, logoAllcanci
};

/** Arquivos com xadrez de falsa transparência gravado — usar SOMENTE sobre fundo claro */
export const imagensEscurasProibidas = ['master-color-trio.jpg', 'master-color-vermelho.jpg', 'moedas-credito.jpg'];
```
(Ajuste a lista `imagensEscurasProibidas` conforme o catálogo real do Step 1.)

- [ ] **Step 4: Verificar build**

Run: `npm run build`
Expected: `Complete!` — Astro valida os imports de imagem em `imagens.ts`.

- [ ] **Step 5: Commit**

```powershell
git add src/assets src/data/imagens.ts
git commit -m @'
feat: catalogo de imagens da marca com nomes semanticos + manifesto tipado

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FWCJd1bVy4332kBrcPdofM
'@
```

---

### Task 5: Núcleo do simulador de economia (TDD)

**Files:**
- Create: `src/scripts/simulador-core.js`, `src/scripts/simulador-bind.js`
- Test: `scripts/simulador-core.test.js`

**Interfaces:**
- Produces: `PREMISSAS` (objeto com `recargasPorProfessorAno: 26, precoCreditoReais: 10.99, kmPorRecarga: 1, metrosPorDescartavel: 400, precoDescartavelReais: 4.5, kgPlasticoPorDescartavel: 0.02`), `simular(professores, premissas?) => { recargasAno, custoFill, descartaveis, custoDescartaveis, economia, plasticoEvitadoKg }`, `reais(n) => string` (formato BRL) — de `simulador-core.js`.
- Produces: `bindSimulador(aoRenderizar?)` de `simulador-bind.js` — liga o simulador ao DOM. Contrato de markup usado por TODAS as versões na seção `#simulador`: `#sim-professores` (input range), `#sim-professores-num` (input number), e alvos de texto `#sim-recargas`, `#sim-custo-fill`, `#sim-descartaveis`, `#sim-economia`, `#sim-plastico`. O callback opcional `aoRenderizar(resultado)` permite efeitos extras por versão (ex.: tanque de tinta da V5).

- [ ] **Step 1: Escrever o teste que falha — `scripts/simulador-core.test.js`**

```js
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
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test`
Expected: FAIL — `Cannot find module ... simulador-core.js`.

- [ ] **Step 3: Implementar `src/scripts/simulador-core.js`**

```js
/**
 * Núcleo puro do simulador de economia FILL (sem DOM).
 * Premissas conservadoras — exibidas no site e ajustáveis pela Allcanci:
 * 1 recarga rende ~1 km; um descartável comum rende ~400 m; descartável médio R$ 4,50; ~20 g de plástico por pincel.
 */
export const PREMISSAS = {
  recargasPorProfessorAno: 26,
  precoCreditoReais: 10.99,
  kmPorRecarga: 1,
  metrosPorDescartavel: 400,
  precoDescartavelReais: 4.5,
  kgPlasticoPorDescartavel: 0.02,
};

export function simular(professores, premissas = PREMISSAS) {
  const n = Number.isFinite(professores) && professores > 0 ? Math.floor(professores) : 0;
  const recargasAno = n * premissas.recargasPorProfessorAno;
  const custoFill = recargasAno * premissas.precoCreditoReais;
  const descartaveis = Math.ceil((recargasAno * premissas.kmPorRecarga * 1000) / premissas.metrosPorDescartavel);
  const custoDescartaveis = descartaveis * premissas.precoDescartavelReais;
  return {
    recargasAno,
    custoFill,
    descartaveis,
    custoDescartaveis,
    economia: custoDescartaveis - custoFill,
    plasticoEvitadoKg: descartaveis * premissas.kgPlasticoPorDescartavel,
  };
}

export const reais = (v) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test`
Expected: `pass 4` / `fail 0`.

- [ ] **Step 5: Implementar `src/scripts/simulador-bind.js`** (bind DOM compartilhado pelas 5 versões)

```js
import { simular, reais } from './simulador-core.js';

/**
 * Liga o simulador ao markup padrão da seção #simulador.
 * @param {(r: ReturnType<typeof simular>) => void} [aoRenderizar] efeito extra por versão
 */
export function bindSimulador(aoRenderizar) {
  const faixa = document.querySelector('#sim-professores');
  const numero = document.querySelector('#sim-professores-num');
  if (!faixa || !numero) return;

  const set = (id, v) => { const el = document.querySelector(id); if (el) el.textContent = v; };
  const render = (n) => {
    const r = simular(n);
    set('#sim-recargas', r.recargasAno.toLocaleString('pt-BR'));
    set('#sim-custo-fill', reais(r.custoFill));
    set('#sim-descartaveis', r.descartaveis.toLocaleString('pt-BR'));
    set('#sim-economia', reais(r.economia));
    set('#sim-plastico', `${r.plasticoEvitadoKg.toLocaleString('pt-BR')} kg`);
    aoRenderizar?.(r);
  };
  const sync = (v) => { faixa.value = v; numero.value = v; render(Number(v)); };
  faixa.addEventListener('input', () => sync(faixa.value));
  numero.addEventListener('input', () => sync(numero.value));
  sync(faixa.value || 20);
}
```

- [ ] **Step 6: Commit**

```powershell
git add src/scripts/simulador-core.js src/scripts/simulador-bind.js scripts/simulador-core.test.js
git commit -m @'
feat: nucleo do simulador de economia com testes (node:test)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FWCJd1bVy4332kBrcPdofM
'@
```

---

### Task 6: Verificador de dist + página hub

**Files:**
- Create: `scripts/check-dist.mjs`
- Modify: `src/pages/index.astro` (substituir placeholder pelo hub definitivo)

**Interfaces:**
- Consumes: `Layout.astro`, tokens, dados (`empresa`, `redes`).
- Produces: `node scripts/check-dist.mjs` (hub) e `node scripts/check-dist.mjs v1` (versões) — usado por TODAS as tasks seguintes.

- [ ] **Step 1: Escrever `scripts/check-dist.mjs`**

```js
import { readFileSync } from 'node:fs';

const page = process.argv[2] ?? '';
const path = `dist/${page ? page + '/' : ''}index.html`;
const html = readFileSync(path, 'utf8');
const problemas = [];

if (!/<title>[^<]{5,}<\/title>/.test(html)) problemas.push('title ausente/curto');
if (!html.includes('lang="pt-BR"')) problemas.push('lang pt-BR ausente');

if (page) {
  for (const id of ['hero', 'produtos', 'como-funciona', 'simulador', 'prova-social', 'sustentabilidade', 'faq', 'contato']) {
    if (!html.includes(`id="${id}"`)) problemas.push(`seção #${id} ausente`);
  }
} else {
  for (const v of ['v1', 'v2', 'v3', 'v4', 'v5']) {
    if (!html.includes(`/Site_allcanci/${v}/`)) problemas.push(`link para /${v}/ ausente`);
  }
}

if (problemas.length) {
  console.error(`FALHOU ${path}:\n- ${problemas.join('\n- ')}`);
  process.exit(1);
}
console.log(`OK ${path}`);
```

- [ ] **Step 2: Rodar contra o placeholder e ver falhar**

Run: `npm run build; node scripts/check-dist.mjs`
Expected: FAIL — links para /v1/…/v5/ ausentes.

- [ ] **Step 3: Construir o hub definitivo em `src/pages/index.astro`**

Requisitos de design (o hub também é vitrine — capriche):
- Fundo azul `--azul` com textura sutil (grade de pontos), logo/wordmark "allcanci tecnologia" no topo, título display Poppins: "Escolha o futuro do site da Allcanci" + subtítulo de 1 linha explicando as 5 propostas.
- 5 cards grandes (grid responsivo 1→2→3 colunas), um por versão, cada um com: número (V1…V5), nome do conceito, descrição de 1 frase, mini-paleta visual do conceito (faixas de cor), link para `${import.meta.env.BASE_URL}/v1/` etc. Hover: elevação + borda acesa. Cards navegáveis por teclado (o card inteiro é um `<a>`).
- Rodapé com contatos e redes (dados de `site.ts`).
- Nomes/descrições dos cards: V1 Laboratório — "A máquina como protagonista, no escuro do laboratório"; V2 Editorial — "Poppins gigante, grid suíço, confiança institucional"; V3 Sala de Aula — "O site é um quadro branco: traços de marcador ganham vida"; V4 Produto — "Um scroll, uma história: a recarga em 22 segundos"; V5 Tinta Viva — "A tinta reage ao seu cursor. O mais ousado".

- [ ] **Step 4: Rodar e ver passar**

Run: `npm run build; node scripts/check-dist.mjs`
Expected: `OK dist/index.html`.

- [ ] **Step 5: Commit + push (deploy automático)**

```powershell
git add -A
git commit -m @'
feat: hub de apresentacao das 5 versoes + verificador de dist

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FWCJd1bVy4332kBrcPdofM
'@
git push
```

---

### Task 7: V1 — "Laboratório" (tech escuro/futurista)

**Files:**
- Create: `src/pages/v1/index.astro`, `src/styles/v1.css`, `src/scripts/v1.js`

**Interfaces:**
- Consumes: `Layout.astro`; todos os exports de `src/data/*` (site, produtos, comodato, faq, provaSocial, sustentabilidade, imagens); `simular/reais/PREMISSAS` de `../../scripts/simulador-core.js`.
- Produces: página `/v1/` completa com os 8 ids obrigatórios.

- [ ] **Step 1: Estrutura da página (8 seções, ids obrigatórios)**

```astro
---
import Layout from '../../layouts/Layout.astro';
import { Image } from 'astro:assets';
import { empresa, numeros, contatos, redes, diferenciais } from '../../data/site';
import { produtos } from '../../data/produtos';
import { etapasComodato } from '../../data/comodato';
import { faq } from '../../data/faq';
import { provaSocial } from '../../data/provaSocial';
import { sustentabilidade } from '../../data/sustentabilidade';
import * as img from '../../data/imagens';
import '../../styles/v1.css';
---
<Layout title="Allcanci Tecnologia — Recarga inteligente para quadro branco" description={empresa.descricao} bodyClass="v1">
  <header><!-- nav fixa translúcida: wordmark + âncoras + CTA WhatsApp --></header>
  <main>
    <section id="hero">…</section>
    <section id="produtos">…</section>
    <section id="como-funciona">…</section>
    <section id="simulador">…</section>
    <section id="prova-social">…</section>
    <section id="sustentabilidade">…</section>
    <section id="faq">…</section>
    <section id="contato">…</section>
  </main>
  <footer><!-- contatos, redes, endereço --></footer>
  <script src="../../scripts/v1.js"></script>
</Layout>
```
(Os `…` acima são preenchidos NESTA task seguindo o brief do Step 2 — nada fica vazio.)

- [ ] **Step 2: Implementar o conceito visual (brief obrigatório)**

- Fundo global `#080808`; texto claro `--creme`/`--branco`; azul `--azul-claro` e `--azul` como neon: bordas 1px luminosas, `box-shadow` com azul translúcido, textos-glow em números.
- Grade de pontos de engenharia como fundo do hero (radial-gradient repetido), leve parallax.
- **Hero:** headline display (Poppins 900, `--display-xl`) "A recarga inteligente que o quadro branco esperava", sub com `empresa.descricao`, CTA primário WhatsApp + secundário "#simulador". Protagonista: foto da máquina `img.inkInjector` dentro de um "estágio de vidro" (card glassmorphism claro — imagens xadrez só sobre claro) com **tilt 3D** controlado por pointermove e badge "22s por recarga".
- **Stats neon** no hero: `+500 escolas`, `22s`, `1 km`, `15 dias` (contadores animados — Step 3).
- **#produtos:** grid de cards glass escuros com estágio interno claro para a foto de cada produto; hover acende borda azul.
- **#como-funciona:** timeline vertical com 6 `etapasComodato`, linha conectora azul neon, números Poppins.
- **#simulador:** painel "console de laboratório": input range + number de professores; saídas `recargasAno`, `custoFill`, `descartaveis` evitados, `economia`, `plasticoEvitadoKg`; nota de premissas (usar `PREMISSAS`). Bind via `v1.js`.
- **#prova-social:** `provaSocial.titulo/texto` + grid de selos (chips com check azul). (Array de depoimentos vazio → não renderizar bloco de citações.)
- **#sustentabilidade:** 4 `pontos` em cards com acento `--verde` (único uso do verde).
- **#faq:** `<details>/<summary>` estilizados (10 itens), marcador `+` que gira.
- **#contato:** card final azul-elétrico com CTA WhatsApp gigante, e-mail, telefone, endereço, redes.
- Mobile-first; nav vira menu simples ancorado; sem scroll horizontal.

- [ ] **Step 3: `src/scripts/v1.js` — tilt 3D + contadores + simulador**

```js
import { bindSimulador } from './simulador-bind.js';

const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Tilt 3D do estágio da máquina
const stage = document.querySelector('[data-tilt]');
if (stage && !reduz) {
  const amp = 9;
  stage.addEventListener('pointermove', (e) => {
    const r = stage.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    stage.style.transform = `perspective(900px) rotateY(${x * amp}deg) rotateX(${-y * amp}deg)`;
  });
  stage.addEventListener('pointerleave', () => (stage.style.transform = ''));
}

// Contadores animados
const conta = (el) => {
  const alvo = parseFloat(el.dataset.contador);
  const t0 = performance.now();
  const dur = 1200;
  const tick = (t) => {
    const p = Math.min((t - t0) / dur, 1);
    el.textContent = el.dataset.prefixo + Math.round(alvo * (1 - Math.pow(1 - p, 3))) + (el.dataset.sufixo ?? '');
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
const io = new IntersectionObserver((es) =>
  es.forEach((e) => { if (e.isIntersecting) { conta(e.target); io.unobserve(e.target); } }));
document.querySelectorAll('[data-contador]').forEach((el) => {
  el.dataset.prefixo = el.dataset.prefixo ?? '';
  if (reduz) el.textContent = el.dataset.prefixo + el.dataset.contador + (el.dataset.sufixo ?? '');
  else io.observe(el);
});

// Simulador (bind compartilhado — ver contrato de markup na Task 5)
bindSimulador();
```
Os ids `#sim-*` e atributos `data-contador`/`data-tilt` devem existir no markup do Step 2. Exiba as premissas na seção `#simulador` renderizando no frontmatter do `.astro`: `import { PREMISSAS, reais } from '../../scripts/simulador-core.js';` → texto tipo `26 recargas/professor/ano · crédito {reais(PREMISSAS.precoCreditoReais)} · descartável ~{PREMISSAS.metrosPorDescartavel} m`.

- [ ] **Step 4: Verificar**

Run: `npm run build; node scripts/check-dist.mjs v1; npm test`
Expected: `OK dist/v1/index.html`; testes `pass`.
Depois: `npm run dev` e inspecione http://localhost:4321/Site_allcanci/v1/ (hero com tilt, simulador reagindo, FAQ abrindo, mobile via devtools).

- [ ] **Step 5: Commit + push**

```powershell
git add -A
git commit -m @'
feat(v1): versao Laboratorio - tech escura com maquina protagonista

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FWCJd1bVy4332kBrcPdofM
'@
git push
```

---

### Task 8: V2 — "Editorial" (premium suíço claro)

**Files:**
- Create: `src/pages/v2/index.astro`, `src/styles/v2.css`, `src/scripts/v2.js`

**Interfaces:**
- Consumes: mesmos imports da V1 (Layout, todos os `src/data/*`, `simulador-core.js`).
- Produces: página `/v2/` completa com os 8 ids obrigatórios (`hero`, `produtos`, `como-funciona`, `simulador`, `prova-social`, `sustentabilidade`, `faq`, `contato`) — mesma regra de estrutura da V1, markup próprio.

- [ ] **Step 1: Implementar o conceito visual (brief obrigatório)**

- Fundo `--creme`; tinta `--preto`; azul `--azul` só em elementos de ênfase (regra editorial: 90% preto/creme, 10% azul). Filetes finos `1px solid` pretos separando seções, estilo jornal de design.
- Grid de 12 colunas explícito (`display:grid`), com elementos deliberadamente atravessando colunas; margens generosas; números de seção pequenos no canto ("01 — Ecossistema").
- **Hero:** manchete Poppins 900 em `--display-xl` ocupando 10 colunas: "O fim do pincel descartável." — com ponto final azul gigante; linha fina; subtítulo `empresa.descricao` em coluna estreita à direita; foto `ecoMarkerTrio` grande sangrando a margem direita; CTA sublinhado editorial (link com underline espesso azul, não botão).
- **Números como gráfica:** seção-faixa com `+500`, `22s`, `1 km`, `15 dias` em Poppins gigantes, legendas pequenas em versalete (letter-spacing).
- **#produtos:** lista editorial vertical — cada produto é uma linha-artigo: número, nome grande, subtítulo itálico, descrição em 2 colunas, foto pequena alinhada à direita; hover: fundo `--nevoa` suave.
- **#como-funciona:** as 6 etapas como sumário de revista (índice numerado com linhas pontilhadas).
- **#simulador:** tabela tipográfica limpa: inputs discretos, resultados em números grandes alinhados por baseline; use o contrato de markup `#sim-*` (Task 5) e chame `bindSimulador()` de `../../scripts/simulador-bind.js` em `v2.js`.
- **#prova-social:** citação-manchete do `provaSocial.texto` entre aspas tipográficas gigantes azuis; selos como lista de rodapé de matéria.
- **#sustentabilidade:** 4 pontos em 4 colunas com iniciais capitulares.
- **#faq:** duas colunas de `<details>` com filete entre perguntas.
- **#contato:** "colofão" de revista: bloco final preto com texto creme, contatos em colunas, redes.
- **JS mínimo (`v2.js`):** simulador + IntersectionObserver adicionando classe `.visivel` para revelar seções com fade/slide sutil (respeitando `reduz` — se reduce, adicionar `.visivel` direto).

- [ ] **Step 2: Verificar**

Run: `npm run build; node scripts/check-dist.mjs v2`
Expected: `OK dist/v2/index.html`. Inspecionar visualmente em dev como na V1.

- [ ] **Step 3: Commit + push**

```powershell
git add -A
git commit -m @'
feat(v2): versao Editorial - grid suico premium em creme e Poppins gigante

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FWCJd1bVy4332kBrcPdofM
'@
git push
```

---

### Task 9: V3 — "Sala de Aula" (lúdico educacional)

**Files:**
- Create: `src/pages/v3/index.astro`, `src/styles/v3.css`, `src/scripts/v3.js`

**Interfaces:**
- Consumes: mesmos imports da V1 (Layout, todos os `src/data/*`, `simulador-core.js`).
- Produces: página `/v3/` completa com os 8 ids obrigatórios (`hero`, `produtos`, `como-funciona`, `simulador`, `prova-social`, `sustentabilidade`, `faq`, `contato`).

- [ ] **Step 1: Implementar o conceito visual (brief obrigatório)**

- O site É um quadro branco: fundo `--branco` com leve sombra de moldura (borda arredondada cinza-alumínio no viewport via `body::before` fixo). Elementos "desenhados a marcador": sublinhados ondulados, círculos, setas — SVGs inline com `stroke` nas cores das tintas (`--azul`, `--vermelho`, `--preto`) e acentos `--verde`/`--amarelo`.
- Tipografia: títulos Nunito 900 (arredondada, amigável), texto Nunito Sans.
- **Efeito-assinatura (Step 2):** títulos de seção têm um traço de marcador SVG por baixo que **se desenha quando a seção entra na tela** (stroke-dashoffset → 0).
- **Hero:** "Nenhum professor merece pincel seco." com "pincel seco" circulado em vermelho-marcador; sub `empresa.descricao`; CTA botão-pílula azul com sombra dura deslocada (estilo sticker); foto `ecoMarkerTrio`; post-its amarelos (`--amarelo`) com os números (+500 escolas, 22s, 1 km) levemente rotacionados.
- **#produtos:** cards-sticker brancos com borda 3px preta e sombra dura colorida alternando azul/vermelho/verde; foto do produto no topo, destaques como checklist "de giz".
- **#como-funciona:** 6 etapas como trilha desenhada — linha tracejada SVG serpenteando entre cartões numerados com círculos de marcador.
- **#simulador:** "continha no quadro": inputs grandes, resultados escritos como equação (650 pincéis × R$ 4,50 = …), contrato de markup `#sim-*` (Task 5) + `bindSimulador()` em `v3.js`.
- **#prova-social:** selos como adesivos/carimbo ("PATENTEADA" em carimbo vermelho rotacionado), texto principal.
- **#sustentabilidade:** 4 pontos em post-its verdes/amarelos alternados.
- **#faq:** `<details>` como caderno pautado (linhas horizontais), marcador de seta desenhada.
- **#contato:** quadro-negro invertido? Não — manter quadro branco: card grande com moldura de marcador azul desenhada, CTA WhatsApp verde-pílula, contatos e redes com ícones rabiscados.
- Rabiscos decorativos e rotação: no mobile, reduzir rotações e esconder decorações que atrapalhem leitura.

- [ ] **Step 2: `v3.js` — traço de marcador que se desenha + simulador**

```js
import { bindSimulador } from './simulador-bind.js';

const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Traços de marcador (SVG paths com classe .traco)
document.querySelectorAll('.traco path').forEach((p) => {
  const L = p.getTotalLength();
  p.style.strokeDasharray = String(L);
  p.style.strokeDashoffset = reduz ? '0' : String(L);
});
if (!reduz) {
  const io = new IntersectionObserver((es) =>
    es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('desenhado'); io.unobserve(e.target); } }),
    { threshold: 0.4 });
  document.querySelectorAll('.traco').forEach((s) => io.observe(s));
}
// CSS correspondente em v3.css:
// .traco path { transition: stroke-dashoffset 900ms ease-out; }
// .traco.desenhado path { stroke-dashoffset: 0 !important; }

// Simulador (contrato de markup na Task 5)
bindSimulador();
```
Exemplo de traço sob título (inline no .astro):
```html
<svg class="traco" viewBox="0 0 320 14" aria-hidden="true">
  <path d="M4 10 C 60 2, 120 14, 180 8 S 280 4, 316 9" fill="none" stroke="var(--azul)" stroke-width="6" stroke-linecap="round"/>
</svg>
```

- [ ] **Step 3: Verificar**

Run: `npm run build; node scripts/check-dist.mjs v3`
Expected: `OK dist/v3/index.html`. Dev: traços se desenham ao rolar; com reduced-motion ficam prontos.

- [ ] **Step 4: Commit + push**

```powershell
git add -A
git commit -m @'
feat(v3): versao Sala de Aula - quadro branco ludico com tracos de marcador animados

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FWCJd1bVy4332kBrcPdofM
'@
git push
```

---

### Task 10: V4 — "Produto" (scrollytelling minimalista)

**Files:**
- Create: `src/pages/v4/index.astro`, `src/styles/v4.css`, `src/scripts/v4.js`

**Interfaces:**
- Consumes: mesmos imports da V1 (Layout, todos os `src/data/*`, `simulador-core.js`).
- Produces: página `/v4/` completa com os 8 ids obrigatórios (`hero`, `produtos`, `como-funciona`, `simulador`, `prova-social`, `sustentabilidade`, `faq`, `contato`).

- [ ] **Step 1: Implementar o conceito visual (brief obrigatório)**

- Estética Apple-like: fundo branco→gradientes suaves de `--nevoa`/azul; Poppins 500/700 leve; muito espaço; cada seção ≈ uma tela, uma ideia.
- **Hero:** produto centrado (`ecoMarkerPreto`), título enorme e curto "22 segundos.", sub "É o tempo de recarregar um pincel para escrever 1 km." CTA discreto. Indicador de scroll.
- **#como-funciona = scrollytelling-assinatura (Step 2):** um "palco" sticky com a cena da recarga; ao rolar, 4 atos trocam (`data-etapa="1..4"`): (1) pincel Eco Marker; (2) pincel encaixado na Ink Injector com anel de progresso de 22s; (3) contador de tinta enchendo; (4) pincel pronto + "1 km de escrita". Cada ato tem texto lateral (das `etapasComodato`, condensadas em 4 atos: diagnóstico/proposta ficam num bloco introdutório acima do palco). Transições por opacity/transform CSS conforme `data-etapa` do palco.
- **#produtos:** carrossel horizontal suave com scroll-snap (cards grandes minimalistas, foto + nome + 1 destaque), setas de navegação acessíveis.
- **#simulador:** painel clean centrado, um slider grande, resultados em 3 números-herói; contrato de markup `#sim-*` (Task 5) + `bindSimulador()` em `v4.js`.
- **#prova-social:** faixa com `+500 escolas` em destaque e selos em linha discreta.
- **#sustentabilidade:** seção de respiro com fundo gradiente `--verde` bem suave, 4 pontos minimalistas.
- **#faq:** accordion minimal (linhas finas).
- **#contato:** convite final centrado "Vamos equipar sua escola?" + botões WhatsApp/e-mail; rodapé leve.

- [ ] **Step 2: `v4.js` — motor do scrollytelling + simulador**

```js
import { bindSimulador } from './simulador-bind.js';

const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Scrollytelling: .sy-palco (sticky) + .sy-passo[data-etapa]
const palco = document.querySelector('.sy-palco');
const passos = [...document.querySelectorAll('.sy-passo')];
if (palco && passos.length) {
  if (reduz) {
    palco.dataset.etapa = 'todas'; // CSS mostra a cena final estática com legenda completa
  } else {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) palco.dataset.etapa = e.target.dataset.etapa; }),
      { rootMargin: '-45% 0px -45% 0px' }
    );
    passos.forEach((p) => io.observe(p));
  }
}
// CSS: .sy-cena [data-ato] { opacity:0; transform:translateY(14px) scale(.98); transition: 500ms ease; }
//      .sy-palco[data-etapa="2"] [data-ato="2"] { opacity:1; transform:none; } (idem 1,3,4)
//      .sy-palco[data-etapa="todas"] [data-ato="4"] { opacity:1; }

// Anel de progresso 22s (SVG circle com stroke-dasharray, anima quando etapa=2)

// Simulador (contrato de markup na Task 5)
bindSimulador();
```

- [ ] **Step 3: Verificar**

Run: `npm run build; node scripts/check-dist.mjs v4`
Expected: `OK dist/v4/index.html`. Dev: atos trocam ao rolar; reduced-motion mostra cena final estática.

- [ ] **Step 4: Commit + push**

```powershell
git add -A
git commit -m @'
feat(v4): versao Produto - scrollytelling minimalista da recarga em 22s

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FWCJd1bVy4332kBrcPdofM
'@
git push
```

---

### Task 11: V5 — "Tinta Viva" (imersivo disruptivo)

**Files:**
- Create: `src/pages/v5/index.astro`, `src/styles/v5.css`, `src/scripts/v5.js`

**Interfaces:**
- Consumes: mesmos imports da V1 (Layout, todos os `src/data/*`, `simulador-core.js`).
- Produces: página `/v5/` completa com os 8 ids obrigatórios (`hero`, `produtos`, `como-funciona`, `simulador`, `prova-social`, `sustentabilidade`, `faq`, `contato`).

- [ ] **Step 1: Implementar o conceito visual (brief obrigatório)**

- Fundo `--creme`; a tinta é viva: canvas fixo atrás do hero onde **gotas de tinta azul se espalham seguindo o cursor** (Step 2). Tipografia display gigante com palavras alternando cor de tinta (azul/vermelho/preto).
- **Hero:** "TINTA VIVA." em Poppins 900 descomunal + marquee contínuo "MENOS DESCARTE — MAIS CONTROLE — RECARGA EM 22S — 1 KM DE ESCRITA —" (CSS keyframes, pausado em reduced-motion); CTA WhatsApp em pílula preta.
- **#produtos:** trilho horizontal com scroll-snap ocupando a viewport — cada produto é um painel de cor alternada (azul/creme/preto/névoa) com foto em estágio claro e nome vertical; dica "arraste →". Acessível: também navegável por Tab/setas (botões prev/next).
- **#como-funciona:** 6 etapas como "gotas" numa linha do tempo horizontal que respinga (blobs SVG `border-radius` orgânicos animados no hover).
- **#simulador:** "tanque de tinta": um SVG de garrafa Master Color que **enche proporcionalmente à economia** (height do retângulo interno) conforme o usuário move o slider; contrato de markup `#sim-*` (Task 5) + `bindSimulador(aoRenderizar)` com callback atualizando o tanque.
- **#prova-social:** manchete gigante `provaSocial.texto` com palavras-chave destacadas em cores de tinta; selos em marquee lento.
- **#sustentabilidade:** painel escuro (`--preto`) de contraste com acentos `--verde`, 4 pontos.
- **#faq:** accordion com numeração gigante fantasma.
- **#contato:** tela final azul `--azul` com wordmark, CTA branco gigante, contatos, redes; cursor-gota (dot follower) apenas em desktop com pointer fino e sem reduced-motion.

- [ ] **Step 2: `v5.js` — tinta no canvas + trilho + simulador**

```js
import { bindSimulador } from './simulador-bind.js';

const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Tinta viva: manchas que crescem e esmaecem onde o cursor passa
const canvas = document.querySelector('#tinta');
if (canvas && !reduz) {
  const ctx = canvas.getContext('2d');
  const CORES = ['#0000fe', '#0000db', '#008aff'];
  let manchas = [];
  const ajusta = () => { canvas.width = innerWidth; canvas.height = canvas.parentElement.offsetHeight; };
  ajusta(); addEventListener('resize', ajusta);
  canvas.parentElement.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    manchas.push({ x: e.clientX - r.left, y: e.clientY - r.top, raio: 4, max: 60 + Math.random() * 80, cor: CORES[(Math.random() * CORES.length) | 0], alfa: 0.5 });
    if (manchas.length > 120) manchas.shift();
  });
  (function desenha() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    manchas = manchas.filter((m) => m.alfa > 0.01);
    for (const m of manchas) {
      m.raio = Math.min(m.raio + 1.6, m.max);
      if (m.raio >= m.max) m.alfa *= 0.96;
      ctx.globalAlpha = m.alfa;
      ctx.fillStyle = m.cor;
      ctx.beginPath(); ctx.arc(m.x, m.y, m.raio, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(desenha);
  })();
}

// Trilho horizontal de produtos: botões prev/next acessíveis
const trilho = document.querySelector('.trilho');
document.querySelector('.trilho-prev')?.addEventListener('click', () => trilho.scrollBy({ left: -trilho.clientWidth, behavior: reduz ? 'auto' : 'smooth' }));
document.querySelector('.trilho-next')?.addEventListener('click', () => trilho.scrollBy({ left: trilho.clientWidth, behavior: reduz ? 'auto' : 'smooth' }));

// Simulador + tanque de tinta: #sim-tanque é o <rect> interno do SVG da garrafa.
// A altura do retângulo é proporcional à razão economia/custoDescartaveis.
const tanque = document.querySelector('#sim-tanque');
const ALTURA_MAX = 180; // altura útil do rect no viewBox da garrafa
bindSimulador((r) => {
  if (!tanque) return;
  const fracao = r.custoDescartaveis > 0 ? Math.max(0, r.economia / r.custoDescartaveis) : 0;
  const h = Math.round(ALTURA_MAX * Math.min(1, fracao * 10)); // ×10 para tornar a fração visível
  tanque.setAttribute('height', String(h));
  tanque.setAttribute('y', String(200 - h)); // fundo da garrafa em y=200 no viewBox
});
```

- [ ] **Step 3: Verificar**

Run: `npm run build; node scripts/check-dist.mjs v5`
Expected: `OK dist/v5/index.html`. Dev: manchas de tinta seguem o cursor; trilho navega por botões e arrasto; reduced-motion desliga canvas e marquee.

- [ ] **Step 4: Commit + push**

```powershell
git add -A
git commit -m @'
feat(v5): versao Tinta Viva - canvas de tinta interativo e trilho horizontal

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FWCJd1bVy4332kBrcPdofM
'@
git push
```

---

### Task 12: SEO/meta polish

**Files:**
- Modify: `src/layouts/Layout.astro` (og:image + og:url + canonical), `src/pages/v1..v5/index.astro` e `src/pages/index.astro` (descriptions únicas), Create: `public/robots.txt`

**Interfaces:**
- Consumes: `Layout.astro` da Task 1.
- Produces: metas completas por página; `robots.txt`; sitemap validado.

- [ ] **Step 1: Ampliar `Layout.astro`**

Adicionar às Props: `ogImage?: string`. No `<head>`:
```astro
const canonical = new URL(Astro.url.pathname, Astro.site);
---
<link rel="canonical" href={canonical} />
<meta property="og:url" content={canonical} />
{ogImage && <meta property="og:image" content={ogImage} />}
<meta name="twitter:card" content="summary_large_image" />
```
Nas páginas, passe `ogImage` usando uma foto de produto otimizada (use `getImage` de `astro:assets` para gerar URL absoluta com `Astro.site`).

- [ ] **Step 2: Descriptions únicas por versão**

Cada página define `description` própria de ~150 caracteres descrevendo a Allcanci (não o conceito visual — o público final é a escola). Hub descreve a escolha de propostas.

- [ ] **Step 3: `public/robots.txt`**

```
User-agent: *
Allow: /

Sitemap: https://tarikdsm.github.io/Site_allcanci/sitemap-index.xml
```

- [ ] **Step 4: Verificar**

Run: `npm run build`
Depois: confira que `dist/sitemap-index.xml` existe e que `dist/v1/index.html` contém `og:image`, `canonical` e description única:
```powershell
Select-String -Path dist/v1/index.html -Pattern 'og:image','canonical' | Select-Object -First 4
Test-Path dist/sitemap-index.xml
```
Expected: matches encontrados; `True`.

- [ ] **Step 5: Commit + push**

```powershell
git add -A
git commit -m @'
feat: seo completo - canonical, og:image, robots.txt e descriptions unicas

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FWCJd1bVy4332kBrcPdofM
'@
git push
```

---

### Task 13: Design system no claude.ai/design (DesignSync)

**Files:**
- Create: `design-system/01-cores.html`, `design-system/02-tipografia.html`, `design-system/03-botoes.html`, `design-system/04-cards.html`, `design-system/05-stats.html`, `design-system/06-faq.html`

**Interfaces:**
- Consumes: tokens de `src/styles/tokens.css` (valores copiados inline — previews são standalone).
- Produces: projeto **"Allcanci"** no claude.ai/design com 6 cards visíveis no Design System pane.

- [ ] **Step 1: Criar os 6 previews standalone**

Cada arquivo: HTML completo autossuficiente (CSS inline no `<style>`, fontes via Google Fonts CDN `Poppins/Nunito/Nunito+Sans` — previews não passam pelo build do Astro), **primeira linha obrigatória** com o marcador de card:
- `01-cores.html`: `<!-- @dsCard group="Brand" -->` — grade das 3 famílias de cor do manual (trabalho, opostas, sombras) com nome + hex de cada swatch.
- `02-tipografia.html`: `<!-- @dsCard group="Type" -->` — escala display/título/texto nas 3 fontes com exemplos reais de headline do site.
- `03-botoes.html`: `<!-- @dsCard group="Components" -->` — botão primário (pílula azul), secundário (contorno), CTA WhatsApp (verde), link editorial sublinhado; estados hover/focus.
- `04-cards.html`: `<!-- @dsCard group="Components" -->` — card de produto claro, card glass escuro (V1), card-sticker (V3).
- `05-stats.html`: `<!-- @dsCard group="Components" -->` — stat block (+500 escolas / 22s / 1 km) em variante clara e escura.
- `06-faq.html`: `<!-- @dsCard group="Components" -->` — item `<details>` estilizado aberto+fechado.

- [ ] **Step 2: Sincronizar via DesignSync**

1. `DesignSync { method: 'list_projects' }` — se já existir projeto "Allcanci" gravável, use o `projectId`; senão:
2. `DesignSync { method: 'create_project', name: 'Allcanci' }` → guarde `projectId`.
3. `DesignSync { method: 'finalize_plan', projectId, writes: ['design-system/**'], localDir: 'D:\\Projetos TI\\Allcanci\\Site\\Site_allcanci' }` → `planId`.
4. `DesignSync { method: 'write_files', projectId, planId, files: [{ path: 'design-system/01-cores.html', localPath: 'design-system/01-cores.html' }, …os 6] }`.

- [ ] **Step 3: Verificar**

`DesignSync { method: 'list_files', projectId }` → os 6 paths presentes. Informe ao usuário a URL do projeto no claude.ai/design para conferência visual.

- [ ] **Step 4: Commit + push**

```powershell
git add design-system
git commit -m @'
feat: design system Allcanci com previews sincronizados no claude.ai/design

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FWCJd1bVy4332kBrcPdofM
'@
git push
```

---

### Task 14: QA final — Lighthouse e entrega

**Files:**
- Modify: o que os relatórios apontarem (qualquer página/CSS).

**Interfaces:**
- Consumes: site completo no ar (Tasks 1–13).
- Produces: scores registrados ≥90 (performance/acessibilidade/SEO) nas 6 páginas publicadas; entrega final ao usuário.

- [ ] **Step 1: Confirmar deploy atual**

```powershell
gh run watch --repo tarikdsm/Site_allcanci --exit-status
curl.exe -sI https://tarikdsm.github.io/Site_allcanci/v5/ | Select-Object -First 1
```
Expected: run `✓`; `HTTP/2 200`.

- [ ] **Step 2: Lighthouse nas 6 URLs publicadas**

```powershell
npx --yes lighthouse https://tarikdsm.github.io/Site_allcanci/ --only-categories=performance,accessibility,seo --preset=desktop --output=json --output-path=lh-hub.json --chrome-flags="--headless=new"
# repita para /v1/ /v2/ /v3/ /v4/ /v5/ → lh-v1.json … lh-v5.json
node -e "['hub','v1','v2','v3','v4','v5'].forEach(p=>{const r=JSON.parse(require('fs').readFileSync('lh-'+p+'.json'));console.log(p, Object.values(r.categories).map(c=>c.title+': '+Math.round(c.score*100)).join(' | '))})"
```
Expected: todas as categorias ≥90. Se alguma ficar abaixo: corrija (imagens sem dimensão, contraste, alt ausente, JS bloqueante são os suspeitos comuns), commit, push, aguarde deploy e meça de novo. Os `lh-*.json` NÃO são commitados (adicione `lh-*.json` ao `.gitignore`).

- [ ] **Step 3: Varredura manual final**

Em cada versão publicada: simulador responde; FAQ abre/fecha por teclado; links WhatsApp/e-mail/redes corretos (conferir com `src/data/site.ts`); sem scroll horizontal no mobile (devtools 360px); imagens xadrez não aparecem sobre fundo escuro.

- [ ] **Step 4: Commit final + resumo ao usuário**

```powershell
git add -A
git commit -m @'
chore: ajustes finais de QA (Lighthouse >= 90 nas 6 paginas)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FWCJd1bVy4332kBrcPdofM
'@
git push
```
Entregar ao usuário: URL do hub e das 5 versões + URL do projeto no claude.ai/design + scores Lighthouse + instrução de como pedir iterações na versão escolhida.
