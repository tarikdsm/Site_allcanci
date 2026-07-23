import { CONSTANTES_NEGOCIO } from './constantes-negocio.js';

export const provaSocial = {
  titulo: 'Quem usou, aprovou',
  texto:
    'Mais de 500 escolas em todo o Brasil já trocaram o pincel descartável pelo ecossistema FILL — de redes municipais a grandes grupos educacionais.',
  selos: [
    'Tecnologia exclusiva',
    'Exclusividade mundial em fabricação',
    'Documentação para inexigibilidade',
    'Garantia total de satisfação',
    'Suporte durante todo o contrato',
    `Entrega em até ${CONSTANTES_NEGOCIO.entregaDiasUteis} dias úteis`,
  ],
  depoimentos: [] as { citacao: string; autor: string; instituicao: string }[],
};
