import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const htmlPath = 'dist/index.html';
const sitemapPath = 'dist/sitemap-0.xml';
const sitemapEsperado = ['https://tarikdsm.github.io/Site_allcanci/'];
const problemas = [];
let html = '';

function listHtmlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return listHtmlFiles(path);
    return entry.isFile() && entry.name.toLowerCase().endsWith('.html') ? [path] : [];
  });
}

function listCssFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return listCssFiles(path);
    return entry.isFile() && path.toLowerCase().endsWith('.css') ? [path] : [];
  });
}

function getMetaContent(source, attribute, value) {
  const tag = [...source.matchAll(/<meta\b[^>]*>/gi)]
    .map((match) => match[0])
    .find((candidate) => candidate.includes(`${attribute}="${value}"`));
  return tag?.match(/\bcontent="([^"]*)"/i)?.[1];
}

function getAttribute(tag, attribute) {
  return tag.match(new RegExp(`\\b${attribute}="([^"]*)"`, 'i'))?.[1];
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getWebpDimensions(buffer) {
  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') {
    throw new Error('asset não é WebP');
  }

  const chunk = buffer.toString('ascii', 12, 16);
  if (chunk === 'VP8 ') {
    if (buffer[23] !== 0x9d || buffer[24] !== 0x01 || buffer[25] !== 0x2a) {
      throw new Error('cabeçalho VP8 inválido');
    }
    return {
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff,
    };
  }
  if (chunk === 'VP8L') {
    if (buffer[20] !== 0x2f) throw new Error('cabeçalho VP8L inválido');
    const bits = buffer.readUInt32LE(21);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >>> 14) & 0x3fff) + 1,
    };
  }
  if (chunk === 'VP8X') {
    return {
      width: buffer.readUIntLE(24, 3) + 1,
      height: buffer.readUIntLE(27, 3) + 1,
    };
  }
  throw new Error(`chunk WebP não suportado: ${chunk}`);
}

if (!existsSync(htmlPath)) {
  problemas.push('dist/index.html ausente');
} else {
  html = readFileSync(htmlPath, 'utf8');
  if (!/<title>[^<]{5,}<\/title>/.test(html)) problemas.push('title ausente ou curto');
  if (!html.includes('lang="pt-BR"')) problemas.push('lang pt-BR ausente');

  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1];
  const description = getMetaContent(html, 'name', 'description');
  const canonicalTags = [...html.matchAll(/<link\b[^>]*>/gi)]
    .map((match) => match[0])
    .filter((tag) => getAttribute(tag, 'rel') === 'canonical');
  const canonical = canonicalTags.length === 1 ? getAttribute(canonicalTags[0], 'href') : undefined;
  if (canonicalTags.length !== 1 || canonical !== sitemapEsperado[0]) {
    problemas.push(`canonical inesperada: ${canonical ?? `encontradas ${canonicalTags.length}`}`);
  }
  if (getMetaContent(html, 'property', 'og:url') !== canonical) {
    problemas.push('og:url n\u00e3o corresponde \u00e0 canonical');
  }
  if (!title || getMetaContent(html, 'property', 'og:title') !== title) {
    problemas.push('og:title n\u00e3o corresponde ao title');
  }
  if (!description || getMetaContent(html, 'property', 'og:description') !== description) {
    problemas.push('og:description n\u00e3o corresponde \u00e0 description');
  }
  if (getMetaContent(html, 'property', 'og:type') !== 'website') {
    problemas.push('og:type incorreto ou ausente');
  }
  if (getMetaContent(html, 'property', 'og:locale') !== 'pt_BR') {
    problemas.push('og:locale incorreto ou ausente');
  }

  const h1Count = [...html.matchAll(/<h1\b[^>]*>/gi)].length;
  if (h1Count !== 1) problemas.push(`esperado exatamente 1 h1, encontrados ${h1Count}`);

  const mainTags = [...html.matchAll(/<main\b[^>]*>/gi)].map((match) => match[0]);
  if (mainTags.length !== 1) {
    problemas.push(`esperado exatamente 1 main, encontrados ${mainTags.length}`);
  } else if (getAttribute(mainTags[0], 'id') !== 'conteudo' || getAttribute(mainTags[0], 'tabindex') !== '-1') {
    problemas.push('main #conteudo n\u00e3o \u00e9 foc\u00e1vel');
  }

  const skipLinks = [...html.matchAll(/<a\b[^>]*>/gi)]
    .map((match) => match[0])
    .filter((tag) => getAttribute(tag, 'class')?.split(/\s+/).includes('site-skip'));
  if (skipLinks.length !== 1 || getAttribute(skipLinks[0], 'href') !== '#conteudo') {
    problemas.push('skip link n\u00e3o aponta para #conteudo');
  }

  const whatsappUrl = 'https://wa.me/5531982929147';
  const whatsappLinks = [...html.matchAll(/<a\b[^>]*>/gi)]
    .map((match) => getAttribute(match[0], 'href'))
    .filter((href) => href?.startsWith('https://wa.me/') || href?.includes('wa.link'));
  if (whatsappLinks.length !== 3 || whatsappLinks.some((href) => href !== whatsappUrl)) {
    problemas.push('CTAs do WhatsApp devem usar a URL oficial transparente esperada');
  }

  for (const match of html.matchAll(/<section\b[^>]*>/gi)) {
    const tag = match[0];
    const sectionId = getAttribute(tag, 'id') ?? '(sem id)';
    const labelledBy = getAttribute(tag, 'aria-labelledby');
    if (!labelledBy) {
      problemas.push(`section #${sectionId} sem aria-labelledby`);
      continue;
    }
    for (const labelId of labelledBy.split(/\s+/)) {
      if (!new RegExp(`\\bid="${escapeRegExp(labelId)}"`, 'i').test(html)) {
        problemas.push(`section #${sectionId}: aria-labelledby aponta para id ausente: ${labelId}`);
      }
    }
  }

  for (const match of html.matchAll(/<input\b[^>]*>/gi)) {
    const tag = match[0];
    const inputId = getAttribute(tag, 'id');
    if (!inputId) continue;
    const ariaLabel = getAttribute(tag, 'aria-label');
    const hasLabel = new RegExp(`<label\\b[^>]*\\bfor="${escapeRegExp(inputId)}"`, 'i').test(html);
    if (!ariaLabel?.trim() && !hasLabel) problemas.push(`input #${inputId} sem nome acess\u00edvel`);
  }

  const statusTags = [...html.matchAll(/<[a-z][^>]*\bid="sim-resultado-status"[^>]*>/gi)]
    .map((match) => match[0]);
  const status = statusTags[0];
  if (
    statusTags.length !== 1
    || getAttribute(status, 'role') !== 'status'
    || getAttribute(status, 'aria-live') !== 'polite'
    || getAttribute(status, 'aria-atomic') !== 'true'
  ) {
    problemas.push('regi\u00e3o de status do simulador inv\u00e1lida');
  }

  const cspMeta = html.match(
    /<meta http-equiv="Content-Security-Policy" content="([^"]+)">/
  );
  if (!cspMeta) {
    problemas.push('CSP via meta ausente');
  } else {
    const policy = cspMeta[1];
    for (const directive of [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'none'",
      "object-src 'none'",
      "img-src 'self' data:",
      "script-src 'self'",
      "style-src 'self'",
      'upgrade-insecure-requests',
    ]) {
      if (!policy.includes(directive)) problemas.push(`diretiva CSP ausente: ${directive}`);
    }
    if (/unsafe-inline|unsafe-eval/.test(policy)) problemas.push('CSP permite execução inline insegura');
    const firstGovernedResource = html.search(/<(?:link|script|style)\b/i);
    if (firstGovernedResource >= 0 && cspMeta.index > firstGovernedResource) {
      problemas.push('CSP via meta aparece depois de recurso governado');
    }
  }

  if (!html.includes('<meta name="referrer" content="strict-origin-when-cross-origin">')) {
    problemas.push('política de referrer ausente');
  }

  const socialImage = getMetaContent(html, 'property', 'og:image');
  const socialImageAlt = 'Três pincéis recarregáveis FILL Eco Marker nas cores vermelho, preto e azul';
  const socialWidth = Number(getMetaContent(html, 'property', 'og:image:width'));
  const socialHeight = Number(getMetaContent(html, 'property', 'og:image:height'));
  if (getMetaContent(html, 'property', 'og:site_name') !== 'Allcanci Tecnologia') {
    problemas.push('og:site_name incorreto ou ausente');
  }
  if (getMetaContent(html, 'property', 'og:image:alt') !== socialImageAlt) {
    problemas.push('og:image:alt incorreto ou ausente');
  }
  if (getMetaContent(html, 'name', 'twitter:image') !== socialImage) {
    problemas.push('twitter:image não reutiliza og:image');
  }
  if (getMetaContent(html, 'name', 'twitter:image:alt') !== socialImageAlt) {
    problemas.push('twitter:image:alt incorreto ou ausente');
  }
  if (!socialImage) {
    problemas.push('og:image ausente');
  } else {
    try {
      const imageUrl = new URL(socialImage);
      const imagePrefix = '/Site_allcanci/';
      if (imageUrl.origin !== 'https://tarikdsm.github.io' || !imageUrl.pathname.startsWith(imagePrefix)) {
        problemas.push(`og:image fora da origem/base esperada: ${socialImage}`);
      } else {
        const imagePath = join('dist', ...decodeURIComponent(imageUrl.pathname.slice(imagePrefix.length)).split('/'));
        if (!existsSync(imagePath)) {
          problemas.push(`asset de og:image ausente: ${imagePath}`);
        } else {
          const dimensions = getWebpDimensions(readFileSync(imagePath));
          if (socialWidth !== dimensions.width || socialHeight !== dimensions.height) {
            problemas.push(
              `dimensões sociais ${socialWidth}x${socialHeight} divergem do asset ${dimensions.width}x${dimensions.height}`
            );
          }
          if (dimensions.width !== 1200 || dimensions.height !== 1200) {
            problemas.push(`og:image inesperada: ${dimensions.width}x${dimensions.height}`);
          }
        }
      }
    } catch (error) {
      problemas.push(`og:image inválida: ${error.message}`);
    }
  }
  if (/<script\b(?![^>]*\bsrc=)(?![^>]*\btype="application\/ld\+json")[^>]*>/i.test(html)) {
    problemas.push('script executável inline encontrado');
  }
  if (/<style\b[^>]*>/i.test(html)) problemas.push('style inline encontrado');

  const jsonLdScripts = [...html.matchAll(
    /<script\b[^>]*\btype="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi
  )];
  if (jsonLdScripts.length !== 1) {
    problemas.push(`esperado 1 bloco JSON-LD, encontrados ${jsonLdScripts.length}`);
  } else {
    try {
      const organization = JSON.parse(jsonLdScripts[0][1]);
      assertStructuredData(organization, problemas);
    } catch (error) {
      problemas.push(`JSON-LD inválido: ${error.message}`);
    }
  }

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

function assertStructuredData(organization, errors) {
  const expectedSameAs = [
    'https://instagram.com/allcanci.tecnologia/',
    'https://linkedin.com/company/allcanci/',
    'https://youtube.com/@allcanci.tecnologia',
  ];

  if (organization['@context'] !== 'https://schema.org') errors.push('contexto schema.org ausente');
  if (organization['@type'] !== 'Organization') errors.push('tipo Organization ausente');
  if (organization.name !== 'Allcanci Tecnologia') errors.push('nome da organização incorreto');
  if (organization.url !== sitemapEsperado[0]) errors.push('URL da organização incorreta');
  if (organization.email !== 'comercial@allcanci.com.br') errors.push('email da organização incorreto');
  if (organization.telephone !== '+5531982929147') errors.push('telefone da organização incorreto');
  if (JSON.stringify(organization.sameAs) !== JSON.stringify(expectedSameAs)) {
    errors.push('perfis sociais da organização incorretos');
  }

  const address = organization.address;
  if (address?.['@type'] !== 'PostalAddress') errors.push('endereço não usa PostalAddress');
  if (address?.streetAddress !== 'Rua Dom Afonso Henrique, 713') errors.push('logradouro incorreto');
  if (address?.addressLocality !== 'Betim') errors.push('cidade incorreta');
  if (address?.addressRegion !== 'MG') errors.push('estado incorreto');
  if (address?.addressCountry !== 'BR') errors.push('país incorreto');
  if ('postalCode' in (address ?? {})) errors.push('CEP não publicado foi incluído');
}

const routeHtmlFiles = existsSync('dist')
  ? listHtmlFiles('dist')
      .filter((path) => relative('dist', path) !== 'index.html')
      .map((path) => relative('dist', path).replaceAll(sep, '/'))
  : [];

if (routeHtmlFiles.length) problemas.push(`arquivos HTML de rota gerados: ${routeHtmlFiles.join(', ')}`);

if (existsSync('dist')) {
  const generatedCss = listCssFiles('dist').map((cssPath) => ({
    path: cssPath,
    content: readFileSync(cssPath, 'utf8'),
  }));
  for (const css of generatedCss) {
    if (/font-family:\s*['\"]?Poppins\b/i.test(css.content)) {
      problemas.push(`fonte Poppins sem uso gerada: ${css.path}`);
    }
  }
  const css = generatedCss.map(({ content }) => content).join('\n');
  if (/\b(?:nunito|nunito-sans)-(?:cyrillic|cyrillic-ext|vietnamese|latin-ext)-/i.test(css)) {
    problemas.push('subset de fonte não latino gerado');
  }
  const fontFaces = css.match(/@font-face\{font-family:(?:Nunito|Nunito Sans);[^}]*\}/g) ?? [];
  if (fontFaces.length !== 5) {
    problemas.push(`esperadas 5 declarações @font-face de Nunito, encontradas ${fontFaces.length}`);
  }

  const criticalFontUrl = css.match(
    /url\((['"]?)([^)'"\s]*nunito-latin-900-normal\.[^)'"\s]*\.woff2)\1\)/i
  )?.[2];
  const fontPreloads = [...html.matchAll(
    /<link\b(?=[^>]*\brel="preload")(?=[^>]*\bas="font")(?=[^>]*\btype="font\/woff2")(?=[^>]*\bcrossorigin="anonymous")[^>]*\bhref="([^"]+)"[^>]*>/gi
  )].map((match) => match[1]);
  if (!criticalFontUrl) {
    problemas.push('URL WOFF2 da fonte crítica Nunito 900 ausente no CSS');
  } else if (fontPreloads.length !== 1 || fontPreloads[0] !== criticalFontUrl) {
    problemas.push(
      `preload da fonte crítica deve reutilizar ${criticalFontUrl}; encontrados ${JSON.stringify(fontPreloads)}`
    );
  }
}

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
