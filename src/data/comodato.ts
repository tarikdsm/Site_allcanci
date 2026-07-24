import { CONSTANTES_NEGOCIO } from './constantes-negocio.js';

export const etapasComodato = [
  { titulo: 'Diagnóstico', texto: 'Realizamos o levantamento do número de professores, salas e unidades escolares, além da estimativa anual de consumo de recargas.' },
  { titulo: 'Proposta sob medida', texto: 'Você recebe uma proposta de locação personalizada, com máquina, pincéis e pontas adequados às necessidades da sua instituição.' },
  { titulo: 'Implementação e treinamento', texto: `Entregamos em até ${CONSTANTES_NEGOCIO.entregaDiasUteis} dias úteis, implementamos a Ink Injector e treinamos sua equipe designada.` },
  { titulo: 'Uso diário', texto: 'Os professores utilizam os Eco Markers normalmente, com praticidade e qualidade durante as aulas.' },
  { titulo: 'Recarga com créditos', texto: `Acabou a tinta? A recarga automática leva ~${CONSTANTES_NEGOCIO.recargaSegundos} segundos e consome 1 crédito (R$ ${CONSTANTES_NEGOCIO.precoCreditoReais.toFixed(2).replace('.', ',')}).` },
  { titulo: 'Gestão e suporte contínuos', texto: 'Acompanhe tudo pelo app e conte com suporte técnico durante toda a vigência do contrato.' },
];
