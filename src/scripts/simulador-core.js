/**
 * Núcleo puro do simulador de economia FILL (sem DOM).
 * Premissas conservadoras — exibidas no site e ajustáveis pela Allcanci:
 * 1 recarga rende ~1 km; um descartável comum rende ~400 m; descartável médio R$ 4,50; ~20 g de plástico por pincel.
 */
export const PREMISSAS = {
  recargasPorProfessorAno: 26,
  precoCreditoReais: 10.99,
  kmPorRecarga: 1,
  metrosPorDescartavel: 400,
  precoDescartavelReais: 4.5,
  kgPlasticoPorDescartavel: 0.02,
};

export function simular(professores, premissas = PREMISSAS) {
  const n = Number.isFinite(professores) && professores > 0 ? Math.floor(professores) : 0;
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
