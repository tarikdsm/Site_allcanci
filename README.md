# Site Allcanci — 10 versões

Novo site institucional da [Allcanci Tecnologia](https://allcanci.com.br) em 10 propostas visuais.

- Hub: `https://tarikdsm.github.io/Site_allcanci/`
- Série original: `/v1` Laboratório · `/v2` Editorial · `/v3` Sala de Aula · `/v4` Produto · `/v5` Tinta Viva
- Série 3D (máquina FILL em 3D interativo): `/v6` Vitrine · `/v7` Linha de Produção · `/v8` Quiosque Pop · `/v9` Levitação · `/v10` FILL OS

Stack: Astro 7, conteúdo único em src/data/, modelo 3D em public/models/ (model-viewer e three.js), deploy automático via GitHub Actions.

O modelo `maquina_fill_web.glb` e os renders de `src/assets/3d/` são gerados a partir do projeto Blender em `../3D/` (fora deste repo).

## Desenvolvimento

```sh
npm install
npm run dev
```
