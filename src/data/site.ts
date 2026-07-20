export const empresa = {
  nome: 'Allcanci Tecnologia',
  slogan: 'Recarga inteligente para quadro branco',
  descricao:
    'Tecnologia 100% nacional e patenteada que substitui pincéis descartáveis por um ecossistema de recarga automática: menos desperdício, mais controle.',
  cidade: 'Betim/MG',
};

export const numeros = {
  escolas: '+500',
};

export const contatos = {
  email: 'comercial@allcanci.com.br',
  telefone: '(31) 98292-9147',
  whatsappUrl: 'https://wa.me/5531982929147',
  endereco: {
    logradouro: 'Rua Dom Afonso Henrique, 713',
    cidade: 'Betim',
    estado: 'MG',
    pais: 'BR',
  },
};

export type IconeRedeSocial =
  | 'instagram'
  | 'linkedin'
  | 'youtube';

export interface RedeSocial {
  nome: string;
  url: string;
  icone: IconeRedeSocial;
}

export const redes = [
  { nome: 'Instagram', url: 'https://instagram.com/allcanci.tecnologia/', icone: 'instagram' },
  { nome: 'LinkedIn', url: 'https://linkedin.com/company/allcanci/', icone: 'linkedin' },
  { nome: 'YouTube', url: 'https://youtube.com/@allcanci.tecnologia', icone: 'youtube' },
] satisfies readonly RedeSocial[];
