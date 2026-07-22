import { CONSTANTES_NEGOCIO } from '../data/constantes-negocio.js';

export const LIMITES_PROFESSORES = Object.freeze({ minimo: 1, maximo: 999, inicial: 20 });

/**
 * Núcleo puro do simulador FILL (sem DOM).
 * Premissas exibidas no site e ajustáveis pela Allcanci.
 */
export const PREMISSAS = {
  recargasPorProfessorAno: CONSTANTES_NEGOCIO.recargasPorProfessorAno,
  precoCreditoReais: CONSTANTES_NEGOCIO.precoCreditoReais,
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
  return {
    recargasAno,
    custoFill,
  };
}

export const reais = (v) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
