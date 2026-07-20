import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const htmlPath = 'dist/index.html';
const sitemapPath = 'dist/sitemap-0.xml';
const sitemapEsperado = ['https://tarikdsm.github.io/Site_allcanci/'];
const problemas = [];

function listHtmlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return listHtmlFiles(path);
    return entry.isFile() && entry.name.toLowerCase().endsWith('.html') ? [path] : [];
  });
}

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

const routeHtmlFiles = existsSync('dist')
  ? listHtmlFiles('dist')
      .filter((path) => relative('dist', path) !== 'index.html')
      .map((path) => relative('dist', path).replaceAll(sep, '/'))
  : [];

if (routeHtmlFiles.length) problemas.push(`arquivos HTML de rota gerados: ${routeHtmlFiles.join(', ')}`);

if (!existsSync(sitemapPath)) {
  problemas.push(`${sitemapPath} ausente`);
} else {
  const sitemap = readFileSync(sitemapPath, 'utf8');
  const locais = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  if (JSON.stringify(locais) !== JSON.stringify(sitemapEsperado)) {
    problemas.push(`URLs do sitemap inesperadas: ${JSON.stringify(locais)}`);
  }
}

if (problemas.length) {
  console.error(`FALHOU ${htmlPath}:\n- ${problemas.join('\n- ')}`);
  process.exit(1);
}

console.log(`OK ${htmlPath}: somente o site definitivo foi gerado`);
