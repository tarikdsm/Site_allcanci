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
