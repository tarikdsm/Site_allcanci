import { CONSTANTES_NEGOCIO } from './constantes-negocio.js';

export const provaSocial = {
  titulo: 'Quem usou, aprovou',
  texto:
    'Mais de 500 escolas em todo o Brasil já trocaram o pincel descartável pelo ecossistema FILL — de redes municipais a grandes grupos educacionais.',
  selos: [
    'Tecnologia única',
    'Exclusividade mundial em fabricação',
    'Documentação para inexigibilidade e licitação',
    'Garantia total de satisfação',
    'Suporte durante todo o contrato',
    `Entrega em até ${CONSTANTES_NEGOCIO.entregaDiasUteis} dias úteis`,
  ],
  depoimentos: [
    {
      citacao: `A experiência da escola com a máquina FILL tem sido muito positiva. Tivemos uma economia significativa nos gastos relacionados à compra de pincéis, tintas e pontas, com redução de aproximadamente 40% nos custos do uso diário.

Além da economia, percebemos mais praticidade e organização para os professores, redução da sujeira e também dos problemas que tínhamos anteriormente com materiais de baixa qualidade/falsificados. Outro ponto importante foi o maior controle no uso dos pincéis, já que não utilizamos e nem recarregamos pincéis que não sejam da marca, o que trouxe mais padronização e durabilidade aos materiais.

Agradecemos pela parceria e pelo suporte oferecido pela Allcanci Tecnologia.`,
      autor: 'Kele — Diretora',
      instituicao: 'Escola Estadual Helena Guerra',
    },
    {
      citacao: `A Escola Estadual Doutor Juscelino Barbosa vem utilizando a máquina FILL com resultados muito positivos. Além da praticidade no dia a dia, percebemos uma grande economia no uso dos pincéis e das tintas, reduzindo significativamente o desperdício.

Os professores aprovaram a organização e a facilidade de utilização, tornando o trabalho mais ágil e eficiente em sala de aula. A máquina trouxe mais comodidade para a equipe e contribuiu para um melhor aproveitamento dos materiais escolares.

Agradecemos pela parceria e pela qualidade da solução oferecida pela Allcanci Tecnologia.`,
      autor: 'Alex — Diretor',
      instituicao: 'Escola Estadual Doutor Juscelino Barbosa',
    },
  ] as { citacao: string; autor: string; instituicao: string }[],
};
