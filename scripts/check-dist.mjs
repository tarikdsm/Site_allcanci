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
  const versoes = Array.from({ length: 30 }, (_, i) => `v${i + 1}`);
  for (const v of versoes) {
    if (!html.includes(`/Site_allcanci/${v}/`)) problemas.push(`link para /${v}/ ausente`);
  }
}

if (problemas.length) {
  console.error(`FALHOU ${path}:\n- ${problemas.join('\n- ')}`);
  process.exit(1);
}
console.log(`OK ${path}`);
