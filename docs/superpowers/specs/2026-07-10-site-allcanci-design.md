# Site Allcanci — Design Doc

**Data:** 2026-07-10
**Status:** Aprovado pelo usuário (brainstorming concluído)

## Objetivo

Criar o novo site institucional da Allcanci Tecnologia em 5 versões visuais radicalmente diferentes, publicadas no GitHub Pages, para que o dono escolha uma direção e ela seja refinada até substituir o site oficial (allcanci.com.br).

## Contexto da empresa

- **Allcanci Tecnologia** (Betim/MG) — única fabricante mundial do sistema FILL de recarga inteligente de pincéis de quadro branco. Tecnologia 100% nacional e patenteada. Atende 500+ escolas.
- **Linha FILL:** Ink Injector (máquina de recarga automática, 22s por recarga), Eco Marker (pincel reutilizável, recarga sem abrir, ~1 km de escrita), Master Color (tintas 500 ml em azul/preto/vermelho), Master Clean (estojo apagador 3P), refil de feltro removível, aplicativo de gestão de consumo.
- **Modelo comercial:** comodato com créditos de recarga (R$ 10,99/crédito; ~26 recargas/professor/ano) + venda institucional. Compatível com licitações públicas. Entrega em 15 dias úteis para todo o Brasil.
- **Contatos:** comercial@allcanci.com.br · (31) 98292-9147 · wa.link/9e5gos · Rua Dom Afonso Henrique, 713 — Betim/MG.
- **Redes:** instagram.com/allcanci.tecnologia · linkedin.com/company/allcanci · youtube.com/@allcanci.tecnologia.
- **Público-alvo:** decisores de instituições de ensino (diretores, mantenedoras, compras públicas) — B2B.

## Marca (obrigatório em todas as versões)

- **Cores de trabalho:** #0000FE (azul principal), #008AFF, #BBE0EF, #FEFFF0 (creme), #080808 (preto).
- **Cores opostas (apoio/acento):** #00FF60, #FFD100, #FF0C00.
- **Sombras do azul:** #0000DB, #0000B3, #00008A, #000061.
- **Fontes:** Nunito, Nunito Sans, Poppins (Google Fonts).
- Cada versão interpreta a marca livremente (ex.: dark mode com azul neon), mas nunca sai da paleta/tipografia oficiais.

## Conteúdo (único, compartilhado pelas 5 versões)

Fonte da verdade: combinação do site atual (institucional: 500+ escolas, 1 km, patente, 15 dias) com o modelo de comodato do exemplo (R$ 10,99, 22s, 26 recargas/ano). O usuário corrige números depois se necessário.

Seções da one-page (todas as versões):

1. **Hero** — proposta de valor + CTA (WhatsApp / simular economia).
2. **Ecossistema FILL** — os 4 produtos + refil + app.
3. **Como funciona** — fluxo do comodato (etapas).
4. **Simulador de economia** — calculadora interativa (nº professores/salas → recargas, custo, economia vs. pincéis descartáveis).
5. **Depoimentos** — prova social (500+ escolas).
6. **Sustentabilidade** — menos descarte, refil, impacto ambiental.
7. **FAQ** — perguntas frequentes (accordion).
8. **Contato** — WhatsApp, e-mail, telefone, endereço, redes sociais. Sem formulário com backend (GitHub Pages é estático); links diretos apenas.

Idioma: PT-BR. Responsivo mobile-first.

## As 5 versões

| # | Nome | Conceito | Elementos-chave |
|---|------|----------|-----------------|
| v1 | **Laboratório** | Tech escuro/futurista | Fundo #080808, azul neon (glow), glassmorphism, grade de pontos, máquina com tilt 3D, contadores animados |
| v2 | **Editorial** | Premium suíço claro | Fundo #FEFFF0, grid editorial rígido, Poppins gigante, números como gráfica, molduras finas, respiro generoso |
| v3 | **Sala de Aula** | Lúdico educacional | Quadro branco como metáfora, títulos com traço de marcador animado (SVG stroke no scroll), rabiscos/setas nas cores das tintas, cards arredondados Nunito |
| v4 | **Produto** | Scrollytelling minimalista | Seções full-viewport, história da recarga guiada pelo scroll (pincel → máquina → 22s → 1 km), tipografia leve, gradientes suaves |
| v5 | **Tinta Viva** | Imersivo disruptivo | Simulação de fluido/tinta em canvas no hero, transições líquidas, scroll horizontal nos produtos, cursor com rastro de tinta, marquee tipográfico |

Interatividade em JS vanilla por versão (sem frameworks de UI). Todas respeitam `prefers-reduced-motion` com fallbacks estáticos.

## Arquitetura

- **Stack:** Astro 5, saída 100% estática, TypeScript nos dados.
- **Repo:** `Site_allcanci` (público) na conta GitHub do usuário (já autenticada via `gh` no PowerShell). Raiz local: `D:\Projetos TI\Allcanci\Site\Site_allcanci`.
- **Estrutura:**
  - `src/data/` — produtos, FAQ, depoimentos, números, contatos, redes (TS tipado, único para as 5 versões).
  - `src/pages/index.astro` — hub de apresentação com cards para /v1…/v5.
  - `src/pages/v1…v5/index.astro` — cada versão, com CSS e JS próprios e isolados (sem vazamento de estilo entre versões).
  - `src/styles/tokens.css` — design tokens da marca compartilhados.
  - `src/assets/` — imagens renomeadas semanticamente a partir de `temp/` (ex.: `fill-ink-injector.jpg`, `eco-marker-trio.jpg`).
  - `.github/workflows/deploy.yml` — build + deploy automático no Pages.
- **Imagens:** otimização automática do Astro (WebP/AVIF responsivo, lazy loading). Fotos com checkerboard de "falsa transparência" gravado no JPEG passam por remoção de fundo antes de uso em fundos escuros; alternativamente são usadas apenas sobre fundos claros.
- **Qualidade:** HTML semântico; acessibilidade AA (contraste, teclado, aria); SEO (title/description por página, Open Graph, sitemap); performance (font-display swap, preload crítico, alvo Lighthouse ≥ 90 em performance/a11y/SEO).

## Design system + Claude Design

- Tokens e componentes de referência (botões, cards de produto, stat, accordion FAQ) documentados como previews HTML.
- Sincronizados via DesignSync num projeto **"Allcanci"** no claude.ai/design do usuário (criar projeto design-system; upload incremental com marcadores `@dsCard`).

## Deploy

- GitHub Actions: push na `main` → build Astro → GitHub Pages.
- URLs: `https://<usuario>.github.io/Site_allcanci/` (hub) e `/v1`…`/v5`.
- `site`/`base` configurados no `astro.config.mjs` para o subpath do Pages.

## Fluxo pós-escolha

Usuário navega nas 5 versões, escolhe uma e itera sobre ela até virar o site oficial. Migração do domínio allcanci.com.br (CNAME) fica para depois, fora deste escopo.

## Fora de escopo

- Formulário de contato com backend/envio de e-mail.
- Configuração do domínio customizado allcanci.com.br.
- CMS ou painel de edição.
- Blog/notícias.

## Critérios de sucesso

1. 5 versões navegáveis publicadas no GitHub Pages + hub, todas com o conteúdo completo das 8 seções.
2. Visualmente radicais entre si, todas dentro da marca.
3. Lighthouse ≥ 90 (performance, acessibilidade, SEO) em cada versão.
4. Conteúdo editável num único lugar (`src/data/`).
5. Design system visível no claude.ai/design.
6. Deploy automático funcionando a cada push.
