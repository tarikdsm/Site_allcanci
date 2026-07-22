import { CONSTANTES_NEGOCIO } from '../data/constantes-negocio.js';

export const LIMITES_PROFESSORES = Object.freeze({ minimo: 1, maximo: 999, inicial: 20 });

/**
 * Núcleo puro do simulador de economia FILL (sem DOM).
 * Premissas conservadoras — exibidas no site e ajustáveis pela Allcanci:
 * rendimento e custo da recarga, rendimento e custo do descartável e plástico por pincel.
 */
export const PREMISSAS = {
  recargasPorProfessorAno: CONSTANTES_NEGOCIO.recargasPorProfessorAno,
  precoCreditoReais: CONSTANTES_NEGOCIO.precoCreditoReais,
  kmPorRecarga: CONSTANTES_NEGOCIO.kmPorRecarga,
  metrosPorDescartavel: 400,
  precoDescartavelReais: 7.99,
  kgPlasticoPorDescartavel: 0.02,
};

export function normalizarProfessores(valor, fallback = 0) {
  if (typeof valor === 'string' && valor.trim() === '') return fallback;
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return fallback;
  return Math.min(
    LIMITES_PROFESSORES.maximo,
    Math.max(LIMITES_PROFESSORES.minimo, Math.floor(numero)),
  );
}

export function simular(professores, premissas = PREMISSAS) {
  const n = normalizarProfessores(professores);
  const recargasAno = n * premissas.recargasPorProfessorAno;
  const custoFill = recargasAno * premissas.precoCreditoReais;
  const descartaveis = Math.ceil((recargasAno * premissas.kmPorRecarga * 1000) / premissas.metrosPorDescartavel);
  const custoDescartaveis = descartaveis * premissas.precoDescartavelReais;
  return {
    recargasAno,
    custoFill,
    descartaveis,
    custoDescartaveis,
    economia: custoDescartaveis - custoFill,
    plasticoEvitadoKg: descartaveis * premissas.kgPlasticoPorDescartavel,
  };
}

export const reais = (v) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
