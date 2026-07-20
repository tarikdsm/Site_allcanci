# Consolidação do site definitivo da Allcanci

**Data:** 20 de julho de 2026  
**Status:** aprovado

## Objetivo

Transformar a proposta escolhida no único site principal da Allcanci, disponível diretamente na raiz do projeto, no servidor local e no GitHub Pages. O código compartilhado deve ter aparência de produto final, sem seletor, rotas, nomes internos ou textos que tratem o site como uma proposta numerada.

O acervo anterior deve permanecer recuperável apenas no computador local, dentro de um diretório ignorado pelo Git. O histórico de commits existente será preservado, sem reescrita.

## Estado final esperado

- `npm run dev` serve somente o site definitivo na raiz.
- O build gera somente a página principal e seus recursos necessários.
- Não existem rotas públicas alternativas para as propostas descartadas.
- Arquivos, classes CSS, identificadores, comentários, documentação e metadados do projeto principal usam nomes neutros.
- O repositório público continua em `tarikdsm/Site_allcanci`.
- O GitHub Pages continua em `https://tarikdsm.github.io/Site_allcanci/`.
- A usuária `tassiadsm` recebe acesso de escrita como colaboradora.
- O diretório `versoes_extras/` existe apenas localmente e nunca integra commits ou artefatos de publicação.

## Arquivo local recuperável

Antes da limpeza, será criado `versoes_extras/site-com-30-versoes/` a partir do commit atual e limpo. O snapshot incluirá código-fonte, configurações, documentação e todas as propostas existentes nesse commit.

O snapshot não incluirá `.git`, `node_modules`, `dist`, `.astro` nem outros caches ou artefatos regeneráveis. Ele deverá continuar executável no futuro após `npm install` e `npm run dev`.

`versoes_extras/` será adicionado ao `.gitignore` antes da validação do commit principal. Uma verificação explícita garantirá que nenhum arquivo do snapshot seja rastreado.

## Estrutura do projeto principal

O conteúdo escolhido passa de uma rota secundária para `src/pages/index.astro`. A antiga página de seleção é removida.

Os recursos exclusivos do site definitivo permanecem no projeto principal:

- layout e tokens globais necessários;
- dados institucionais, produtos, comodato, perguntas frequentes, prova social e sustentabilidade;
- imagens efetivamente importadas;
- lógica e vinculação do simulador;
- estilos e comportamentos da interface escolhida;
- fontes e dependências usadas pelo build.

Os recursos exclusivos das propostas descartadas saem da árvore rastreada pelo Git, incluindo páginas, folhas de estilo, scripts, modelos, documentação, testes e dependências sem uso. Nenhum arquivo compartilhado será removido sem confirmar que o site definitivo não depende dele.

Os nomes internos específicos da fase de propostas serão neutralizados. Isso inclui arquivo de página, CSS, JavaScript, classe do `body`, prefixos de classes, seletores, IDs, comentários e descrições de testes. A neutralização não deve alterar comportamento ou apresentação.

## Publicação

O projeto continua usando Astro e a configuração atual de `site` e `base`. O workflow da branch `main` continuará responsável por construir e publicar no GitHub Pages.

O fluxo de entrega será:

1. validar o projeto localmente;
2. revisar o diff e confirmar que o arquivo local está ignorado;
3. criar um commit atômico na `main`;
4. enviar a `main` para `origin`;
5. acompanhar o workflow até sua conclusão;
6. validar a página publicada na raiz.

As antigas URLs deixarão de existir. Não serão criados redirecionamentos, aliases ou páginas explicando a seleção anterior.

## Colaboração no GitHub

O repositório permanecerá público. A conta `tassiadsm` será convidada como colaboradora com permissão de escrita. O e-mail fornecido pelo responsável será usado apenas como referência e não será gravado no código nem publicado no site.

O resultado será considerado confirmado quando o GitHub informar que a conta já possui acesso ou que o convite está pendente de aceitação. Falhas de autorização da conta administradora serão relatadas com a ação necessária, sem expor credenciais.

## Validação

Antes do push, serão executados:

- testes automatizados do projeto;
- verificação estática do Astro;
- build de produção;
- inspeção do conteúdo de `dist`;
- busca por referências residuais à fase de propostas;
- teste do site em navegador real, incluindo navegação, imagens, simulador, contatos e layouts responsivos;
- teste de que a raiz responde e as rotas antigas não existem;
- inspeção de `git status` e `git check-ignore` para o arquivo local.

O `README.md`, os metadados, o sitemap e os testes automatizados serão atualizados para descrever e validar um único site institucional.

Após o push, serão verificados o workflow de publicação, a página pública e o estado do convite enviado à colaboradora.

## Recuperação e tratamento de falhas

O snapshot local é a recuperação rápida do acervo anterior. O histórico Git preservado é a segunda camada de auditoria e restauração.

Falhas locais de teste ou build devem ser corrigidas antes do push. Falhas externas de GitHub Pages ou de permissão para convidar a colaboradora não invalidam os arquivos locais, mas impedem declarar a entrega externa como concluída; a pendência e a ação corretiva serão informadas com precisão.

## Fora de escopo

- reescrever ou apagar o histórico Git;
- renomear o repositório ou alterar sua URL atual;
- configurar domínio próprio de produção;
- redesenhar o conteúdo ou a identidade visual escolhida;
- publicar o arquivo local em outra branch, tag, repositório ou serviço.
