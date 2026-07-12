# Allcanci V11–V15 — Design das experiências disruptivas

**Data:** 2026-07-12  
**Status:** Aprovado por delegação autônoma do usuário

## Objetivo

Adicionar cinco propostas responsivas e radicalmente diferentes à coleção do novo site da
Allcanci Tecnologia. As versões V11–V15 devem ampliar o campo de escolha sem repetir as linguagens
das dez propostas existentes e devem ser publicadas no mesmo GitHub Pages.

O resultado continua sendo um site institucional B2B em PT-BR para diretores, mantenedoras e
compras públicas. Impacto visual não pode reduzir clareza, confiança, acessibilidade ou conversão
para WhatsApp.

## Contexto observado

- A série original V1–V5 já cobre laboratório escuro, editorial suíço, quadro branco lúdico,
  scrollytelling de produto e tinta fluida.
- A série V6–V10 já cobre museu premium, blueprint industrial, neo-brutalismo pop, aurora glass
  e firmware/terminal, todos com 3D.
- O site oficial prioriza o ecossistema FILL, os benefícios operacionais, a comparação com a
  recarga manual, licitações, suporte e contato.
- O repositório usa Astro 7 com saída estática, dados centralizados em `src/data`, imagens
  otimizadas por `astro:assets` e deploy automático na `main`.
- O build atual possui um aviso de chunk grande relacionado à série 3D. As novas versões não
  usarão Three.js nem model-viewer.

## Estratégia escolhida

Foram consideradas três abordagens:

1. **Cinco arquétipos de interação** — cada versão tem uma mecânica central, uma narrativa e uma
   linguagem visual próprias. É a abordagem escolhida por maximizar variedade e memorabilidade sem
   depender de assets pesados.
2. **Cinco campanhas visuais** — mudaria principalmente tipografia, paleta e composição. Teria menor
   risco técnico, mas acrescentaria pouca diversidade à coleção existente.
3. **Cinco experimentos gráficos intensivos** — usaria WebGL/WebGPU e canvas em todas as versões.
   Teria alto impacto inicial, mas aumentaria consumo de bateria, peso, risco de incompatibilidade
   e repetiria a centralidade tecnológica da série 3D.

## Requisitos compartilhados

### Conteúdo e arquitetura

- Fonte da verdade: `src/data/*.ts`. Não inventar números, depoimentos, certificações ou clientes.
- Todas as versões contêm, nesta ordem, as seções com ids `hero`, `produtos`,
  `como-funciona`, `simulador`, `prova-social`, `sustentabilidade`, `faq` e `contato`.
- Cada página usa `Layout.astro`, title/description exclusivos, skip-link, landmarks semânticos,
  heading hierarchy coerente e link de retorno ao hub.
- Cada versão possui `src/pages/vN/index.astro`, `src/styles/vN.css` e `src/scripts/vN.js`.
- Lógica numérica reutilizável e testável pode viver em um módulo compartilhado; a direção de
  arte e o comportamento de DOM continuam isolados por versão.
- URLs de navegação e assets de `public` respeitam `import.meta.env.BASE_URL`.
- Fotos locais usam `Image`/`getImage` de `astro:assets`, dimensões explícitas, `sizes`, `alt`
  significativo e lazy loading fora do primeiro viewport.
- Imagens com xadrez gravado nunca aparecem diretamente sobre fundo escuro; recebem palco claro.

### Interação, movimento e compatibilidade

- Mobile-first, com layouts validados em 390×844 e desktop em 1440×900.
- Pointer Events para gestos; teclado e controles HTML equivalentes para toda interação por
  arrasto, toque ou clique.
- CSS scroll-driven animations e View Transitions são aprimoramentos progressivos. O conteúdo e a
  navegação permanecem completos sem suporte a essas APIs.
- `IntersectionObserver` ativa revelações apenas perto do viewport.
- `prefers-reduced-motion: reduce` remove parallax, autoanimações, transições espaciais e
  deslocamentos amplos; nenhum conteúdo fica oculto.
- Sem scroll-jacking. Scroll snap pode sugerir seções, mas deve permitir rolagem natural e ser
  desligado em telas baixas ou reduced motion.
- Sem permissões de microfone, câmera, localização ou sensores.
- JavaScript deve ser pequeno, modular e carregado como ESM pelo Astro. Nenhuma nova biblioteca
  gráfica é necessária.

### Qualidade

- Contraste WCAG AA, foco visível, alvos de toque de pelo menos 44×44 px e estados que não
  dependem apenas de cor.
- Navegação funcional com teclado; drawers, tabs e controles anunciam estado com ARIA adequado.
- O simulador preserva o contrato atual (`sim-professores`, `sim-professores-num` e leituras
  existentes) e as premissas de `simulador-core.js`.
- Nenhum erro no console durante fluxos principais.
- `npm test`, `npm run check`, `npm run build` e `node scripts/check-dist.mjs` passam.
- O hub lista V1–V15, com a nova série destacada como “Experiências”.

## V11 — Ciclo Infinito

### Conceito

O site materializa a economia circular. Um circuito visual contínuo conecta usar, recarregar e
continuar, comunicando que o pincel deixa de ser descartável e passa a integrar um sistema.

### Direção de arte

- Fundo papel mineral `#f1efe7`, texto `#11221b`, azul Allcanci `#0000fe`, verde circular
  `#00a85a`, lima `#d7ff54` e coral pontual `#ff5b45`.
- Poppins pesado para mensagens e Nunito Sans para leitura.
- Anéis, linhas orbitais, setas e etiquetas de fluxo; fotos recortadas visualmente em cápsulas
  ovais. Textura pontilhada sutil, sem simular o quadro da V3.

### Mecânica assinatura

Um SVG de circuito acompanha o scroll. O marcador de progresso percorre a rota com
`offset-path` quando suportado; o fallback atualiza apenas a etapa destacada. Um controle
acessível “Gire o ciclo” permite selecionar Usar, Recarregar ou Continuar por botões e teclado.

### Seções

- Hero: headline “O fim do fim do pincel”, circuito central e CTA.
- Produtos: os seis elementos do ecossistema como estações do mesmo loop.
- Como funciona: três atos grandes — usar, recarregar, continuar — alimentados pelos passos reais.
- Simulador: painel “quantas voltas sua escola evita?” com resultados oficiais.
- Prova social: números em selos circulares; depoimentos apenas se existirem nos dados.
- Sustentabilidade: circuito amplia e revela impacto, materiais e refil.
- FAQ: perguntas em arcos/linhas, com `details` nativo.
- Contato: o loop termina no CTA e recomeça visualmente no topo.

## V12 — Pitch 90s

### Conceito

O site se comporta como uma apresentação decisiva para uma reunião escolar: direta, visual e
navegável. O visitante escolhe uma lente — Direção, Compras ou Sustentabilidade — que altera a
ênfase das mensagens, nunca os fatos nem a ordem semântica.

### Direção de arte

- Fundo `#0d1026`, azul elétrico `#4b5cff`, creme `#fff9e8`, amarelo `#ffd100`, vermelho
  `#ff3b30` e ciano `#57e5ff`.
- Archivo para headlines condensadas visualmente e DM Sans para interface.
- Slides de alto contraste, legendas de palco, barras de progresso e transições por blocos.

### Mecânica assinatura

Cada seção usa `min-height: 90svh` quando a viewport tem pelo menos 720 px de largura e 700 px de
altura, com progress rail lateral.
Setas, Page Up/Down e swipe mudam o slide quando o foco não está em um controle. A escolha de
lente atualiza microcopys predefinidas no HTML e `aria-pressed`; sem JS, a trilha Direção fica
visível e todo o conteúdo essencial continua presente.

### Seções

- Hero: capa do pitch, seletor de lente e CTA “Começar”.
- Produtos: uma frase forte e um mosaico que se reorganiza visualmente por lente.
- Como funciona: storyboard em seis quadros.
- Simulador: slide de prova com input grande e resultados que entram como argumentos.
- Prova social: `+500` ocupa o palco e os demais sinais aparecem como notas.
- Sustentabilidade: visual de “placar final” com dados existentes.
- FAQ: slide de objeções, navegável sem modal.
- Contato: último slide com resumo, WhatsApp e links diretos.

## V13 — Corte o Desperdício

### Conceito

Uma linha vertical separa dois sistemas: consumo fragmentado e ecossistema FILL. O visitante
arrasta o divisor para revelar a mudança. A comparação é baseada somente em dados e premissas já
presentes no projeto.

### Direção de arte

- Lado tradicional em cinza quente `#dedbd2`, carvão `#292824` e laranja de alerta `#ff6a3d`.
- Lado FILL em creme `#fefff0`, azul `#0000fe`, azul-claro `#bbe0ef` e verde `#00a85a`.
- Inter para leitura e Archivo Black para números/títulos. Colagens fotográficas limpas e linha
  de corte vermelha/azul.

### Mecânica assinatura

No hero, um `input[type=range]` acessível controla a posição do divisor e o `clip-path` do painel
FILL. O mesmo valor influencia detalhes decorativos nas seções seguintes. No mobile, a comparação
vira antes/depois vertical e o range continua disponível sem bloquear o scroll.

### Seções

- Hero: headline “Arraste a escola para o lado inteligente” e comparação controlada.
- Produtos: problema/solução por categoria, sem alegar benefícios além dos dados.
- Como funciona: a linha de corte vira fluxo de implantação.
- Simulador: resultados atualizam barras de comparação e textos numéricos.
- Prova social: fatos verificados no lado FILL.
- Sustentabilidade: visualização de plástico evitado derivada do simulador.
- FAQ: objeção à esquerda, resposta à direita em `details`.
- Contato: painel FILL ocupa 100% e apresenta CTA.

## V14 — Campus Vivo

### Conceito

A Allcanci é apresentada como infraestrutura da escola. Um mapa isométrico autoral, construído
em SVG e CSS, conecta sala de aula, coordenação, estoque e ponto de recarga. Cada ambiente explica
uma parte do ecossistema e leva à seção correspondente.

### Direção de arte

- Céu `#ccecff`, terreno `#dfffbd`, construções creme `#fff8e7`, azul `#0000fe`, vermelho
  `#ff4b3e`, amarelo `#ffd100` e asfalto `#202234`.
- Bricolage Grotesque para títulos e Nunito Sans para interface.
- Isometria leve, sombras chapadas, placas, rotas tracejadas e microanimações de atividade.

### Mecânica assinatura

O SVG do campus tem hotspots reais com botões e rótulos. Clique, toque ou teclado destacam o
ambiente e rolam para a seção. Conforme o visitante navega, `IntersectionObserver` atualiza a rota
ativa no mapa. No mobile o mapa vira um minimapa sticky curto e uma lista de destinos.

### Seções

- Hero: campus isométrico explorável e headline “Uma escola inteira em fluxo”.
- Produtos: inventário por ambiente, preservando os produtos reais.
- Como funciona: rota da recarga do professor ao ponto FILL e de volta à sala.
- Simulador: central de gestão com os mesmos inputs e resultados.
- Prova social: sinalização do campus com os números oficiais.
- Sustentabilidade: área verde do mapa e narrativa de reuso/refil.
- FAQ: central de informações com `details`.
- Contato: portaria/central Allcanci com CTA e endereço real.

## V15 — Dossiê FILL

### Conceito

Uma experiência premium voltada à decisão institucional. O site é uma pasta de projeto bem
organizada: visão executiva, solução, implantação, simulação, evidências, sustentabilidade,
dúvidas e contato. A linguagem de documento transmite preparo para compras públicas sem imitar
um portal governamental.

### Direção de arte

- Mesa azul-noite `#10192f`, papel `#f3ead8`, tinta `#17213a`, azul carimbo `#1746d1`, vermelho
  `#c93832`, verde aprovação `#207a4a` e dourado fosco `#c8a96b`.
- Fraunces para títulos editoriais e IBM Plex Mono para metadados, etiquetas e checklist.
- Papel texturizado em CSS, clipes, abas, numeração, carimbos e margens de arquivo.

### Mecânica assinatura

Uma pasta sticky mostra abas para as oito seções. A aba ativa acompanha o scroll. Um checklist
“pronto para decidir” marca itens automaticamente quando as seções são visitadas e permite
controle manual; o estado é apenas da sessão e não bloqueia o CTA. Abertura de documentos usa
View Transition quando disponível e transição CSS simples como fallback.

### Seções

- Hero: capa do dossiê, resumo executivo e CTA.
- Produtos: fichas catalográficas do ecossistema.
- Como funciona: plano de implantação em passos, sem criar prazos novos.
- Simulador: planilha visual com cálculos oficiais.
- Prova social: folha de evidências com os fatos disponíveis.
- Sustentabilidade: anexo de impacto e materiais/refis.
- FAQ: índice de objeções e respostas em `details`.
- Contato: folha de encaminhamento com WhatsApp, e-mail, telefone, endereço e redes.

## Hub

- Atualizar o hero de “10 propostas” para “15 propostas”.
- Criar `serieExperiencias` com V11–V15 antes das séries 3D e original.
- Cada card informa nome, descrição, paleta e badge “Interativa”.
- Atualizar SEO, textos de rodapé e qualquer link interno que ainda diga “10 propostas”.

## Testes e verificação

1. Expandir `scripts/check-dist.mjs` antes das páginas para exigir V1–V15, as oito seções,
   metadados e links do hub.
2. Criar testes unitários para qualquer helper numérico/estado compartilhado usado pelas novas
   interações.
3. Rodar testes e confirmar falha esperada antes da implementação.
4. Implementar V11–V15 e hub incrementalmente, mantendo os testes verdes.
5. Rodar `npm test`, `npm run check`, `npm run build` e `node scripts/check-dist.mjs`.
6. Servir a build e validar hub + V11–V15 em 1440×900 e 390×844.
7. Em cada versão, exercitar a mecânica assinatura, simulador, FAQ, teclado, CTA e verificar o
   console.
8. Revisar `prefers-reduced-motion`, overflow horizontal, imagens, foco e contraste.

## Publicação

- Commitar as mudanças na `main` com mensagens claras e atômicas.
- Fazer push para `origin/main`, acionando `.github/workflows/deploy.yml`.
- Aguardar o workflow do GitHub Pages e verificar o hub publicado e as rotas `/v11/`–`/v15/`.

## Fora de escopo

- Alterar ou remover V1–V10.
- Substituir o domínio oficial `allcanci.com.br`.
- Formulário com backend, CRM, CMS, login ou coleta de dados pessoais.
- Inventar localização de escolas/clientes no mapa do Campus Vivo.
- Adicionar novo modelo 3D, vídeo, áudio ou dependência gráfica pesada.

## Critérios de aceitação

1. V11–V15 estão navegáveis, completas e visualmente distintas entre si e de V1–V10.
2. As cinco mecânicas assinatura funcionam com mouse, toque e teclado ou possuem controle HTML
   equivalente.
3. Todas as versões são responsivas, legíveis e sem overflow horizontal nos dois viewports-alvo.
4. A experiência reduzida por `prefers-reduced-motion` mantém todo o conteúdo e a navegação.
5. O hub apresenta as 15 propostas e todos os checks automatizados passam.
6. O deploy do GitHub Pages conclui com sucesso e as seis rotas novas (hub + V11–V15) respondem.
