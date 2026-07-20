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
