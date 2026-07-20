import { CONSTANTES_NEGOCIO } from './constantes-negocio.js';

export const etapasComodato = [
  { titulo: 'Diagnóstico', texto: 'Levantamos o número de professores, salas e o consumo atual de pincéis descartáveis da instituição.' },
  { titulo: 'Proposta sob medida', texto: 'Você recebe uma proposta de comodato com máquina, pincéis e créditos de recarga dimensionados para a sua realidade.' },
  { titulo: 'Instalação e treinamento', texto: `Entregamos em até ${CONSTANTES_NEGOCIO.entregaDiasUteis} dias úteis, instalamos a Ink Injector e treinamos a equipe.` },
  { titulo: 'Uso diário', texto: 'Professores usam os Eco Markers normalmente — sem pincel seco no meio da aula.' },
  { titulo: 'Recarga com créditos', texto: `Acabou a tinta? A recarga automática leva ~${CONSTANTES_NEGOCIO.recargaSegundos} segundos e consome 1 crédito (R$ ${CONSTANTES_NEGOCIO.precoCreditoReais.toFixed(2).replace('.', ',')}).` },
  { titulo: 'Gestão e suporte contínuos', texto: 'Acompanhe tudo pelo app e conte com suporte técnico durante toda a vigência do contrato.' },
];
