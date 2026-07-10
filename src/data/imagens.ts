import type { ImageMetadata } from 'astro';

// Logos
import logoAllcanci from '../assets/logo-allcanci.jpg';
import logoFillEcoMarker from '../assets/logo-fill-eco-marker.jpg';
import logoFillInkInjector from '../assets/logo-fill-ink-injector.jpg';
import logoFillMasterColor from '../assets/logo-fill-master-color.jpg';
import logoFillMasterClean from '../assets/logo-fill-master-clean.jpg';
import logoEcoSistemaFill from '../assets/logo-eco-sistema-fill.jpg';

// Produtos — fotos principais
import inkInjector from '../assets/ink-injector-frontal.jpg';
import ecoMarkerTrio from '../assets/eco-marker-trio.jpg';
import ecoMarkerPreto from '../assets/eco-marker-preto.jpg';
import masterColorTrio from '../assets/master-color-trio.jpg';
import masterColorVermelho from '../assets/master-color-vermelho.jpg';
import masterClean from '../assets/master-clean.jpg';
import moedasCredito from '../assets/moedas-credito.jpg';

// Extras — ângulos/detalhes/contexto adicionais úteis para o site
import inkInjectorAberta from '../assets/ink-injector-aberta.jpg';
import ecoMarkerTrioTampas from '../assets/eco-marker-trio-tampas.jpg';
import ecoMarkerEmbalagens from '../assets/eco-marker-embalagens.jpg';
import masterCleanAberto from '../assets/master-clean-aberto.jpg';
import kitCompleto from '../assets/kit-completo.jpg';
import comoUsar from '../assets/como-usar.jpg';

export {
  // Logos
  logoAllcanci,
  logoFillEcoMarker,
  logoFillInkInjector,
  logoFillMasterColor,
  logoFillMasterClean,
  logoEcoSistemaFill,
  // Produtos
  inkInjector,
  ecoMarkerTrio,
  ecoMarkerPreto,
  masterColorTrio,
  masterColorVermelho,
  masterClean,
  moedasCredito,
  // Extras
  inkInjectorAberta,
  ecoMarkerTrioTampas,
  ecoMarkerEmbalagens,
  masterCleanAberto,
  kitCompleto,
  comoUsar,
};

export type { ImageMetadata };

/**
 * Arquivos com fundo em xadrez de falsa transparência GRAVADO na própria JPEG
 * (o "fundo transparente" na verdade é um checkerboard cinza/branco assado na imagem).
 * Usar SOMENTE sobre fundo claro — sobre fundo escuro ou colorido o xadrez fica visível.
 */
export const imagensEscurasProibidas: string[] = [
  'ink-injector-frontal.jpg',
  'master-color-trio.jpg',
  'master-color-vermelho.jpg',
  'moedas-credito.jpg',
];
