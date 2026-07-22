import { CONSTANTES_NEGOCIO } from './constantes-negocio.js';

export const provaSocial = {
  titulo: 'Quem usou, aprovou',
  texto:
    'Mais de 500 escolas em todo o Brasil já trocaram o pincel descartável pelo ecossistema FILL — de redes municipais a grandes grupos educacionais.',
  selos: [
    'Tecnologia patenteada',
    'Única fabricante no mundo',
    'Documentação para inexigibilidade',
    'Garantia total de satisfação',
    'Suporte por toda a vida útil',
    `Entrega em até ${CONSTANTES_NEGOCIO.entregaDiasUteis} dias úteis`,
  ],
  depoimentos: [] as { citacao: string; autor: string; instituicao: string }[],
};
