import { CONSTANTES_NEGOCIO } from './constantes-negocio.js';

export type Produto = {
  id: string;
  nome: string;
  subtitulo: string;
  descricao: string;
  destaques: string[];
};

export const produtos: Produto[] = [
  {
    id: 'eco-marker',
    nome: 'FILL Eco Marker',
    subtitulo: 'Pincel reutilizável',
    descricao:
      `O pincel que não precisa ser aberto para recarregar. Cada recarga rende cerca de ${CONSTANTES_NEGOCIO.kmPorRecarga} km de escrita, com traço sempre uniforme.`,
    destaques: ['Recarga sem abrir o pincel', `~${CONSTANTES_NEGOCIO.kmPorRecarga} km de escrita por recarga`, 'Fácil de apagar'],
  },
  {
    id: 'ink-injector',
    nome: 'FILL Ink Injector',
    subtitulo: 'Máquina de recarga automática',
    descricao:
      `A máquina que recarrega pincéis de quadro branco de forma automática, precisa e sem sujeira — em cerca de ${CONSTANTES_NEGOCIO.recargaSegundos} segundos.`,
    destaques: [`Recarga automática em ~${CONSTANTES_NEGOCIO.recargaSegundos}s`, 'Sem contato com a tinta, sem sujeira', 'Carrega azul, preto e vermelho'],
  },
  {
    id: 'master-color',
    nome: 'FILL Master Color',
    subtitulo: 'Tinta 500 ml',
    descricao:
      'Tinta exclusiva de alta performance, com escrita nítida e fácil remoção, fornecida em frascos desenvolvidos especialmente para o abastecimento da Fill Ink Injector.',
    destaques: ['Azul, preto e vermelho', 'Padrões rigorosos de qualidade', 'Uso exclusivo na FILL Ink Injector'],
  },
  {
    id: 'master-clean',
    nome: 'FILL Master Clean 3P',
    subtitulo: 'Estojo apagador',
    descricao:
      'Estojo com apagador integrado, desenvolvido para armazenar e proteger até três pincéis, mantendo a mesa do professor organizada. Conta ainda com uma capa protetora que retém resíduos e ajuda a preservar os quadros.',
    destaques: ['Armazena 3 pincéis', 'Capa protetora', 'Refil com 3 feltros'],
  },
  {
    id: 'refil',
    nome: 'Ponteira Removível FILL',
    subtitulo: 'Ponteiras substituíveis',
    descricao:
      'A ponteira do Eco Marker é substituível: quando a ponta desgasta, troca-se só o refil — o pincel continua.',
    destaques: ['Troca em segundos', 'Prolonga a vida útil do pincel', 'Menos plástico descartado'],
  },
  {
    id: 'app',
    nome: 'App de Gestão Allcanci',
    subtitulo: 'Controle em tempo real',
    descricao:
      'Aplicativo de gestão para acompanhar o consumo de tinta e as recargas da instituição em tempo real.',
    destaques: ['Consumo por período', 'Controle de créditos', 'Visão por unidade escolar'],
  },
];
