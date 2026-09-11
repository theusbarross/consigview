export interface Banco {
  id: string;
  nome: string;
  prazos: { prazo: number; fator: number; taxa?: number }[];
}

export interface RegraPerfil {
  nome: string;
  minContratosDeferidos: number;
  maxContratosDeferidos: number | null;
  minPercentualTomado: number;
  maxPercentualTomado: number | null;
  descricao: string;
  corBadge?: string;
  condicaoOr?: boolean;
}

export interface BuscaHistorico {
  cpf: string;
  nome: string;
  data: string;
}

const STORAGE_KEY_BANCOS = 'consigview_bancos';
const STORAGE_KEY_REGRAS = 'consigview_regras';
const STORAGE_KEY_HISTORICO = 'consigview_historico';

export const defaultRegras: RegraPerfil[] = [
  {
    nome: 'Margem Virgem',
    minContratosDeferidos: 0,
    maxContratosDeferidos: 0,
    minPercentualTomado: 0,
    maxPercentualTomado: 0,
    descricao: 'Cliente que nunca tomou empréstimo, não tem nenhum histórico de contrato deferido e margem livre, é um perfil mais difícil de fechar proposta.',
    corBadge: 'bg-green-500 text-white'
  },
  {
    nome: 'Tomador Agressivo',
    minContratosDeferidos: 4,
    maxContratosDeferidos: null,
    minPercentualTomado: 70,
    maxPercentualTomado: null,
    descricao: 'Cliente com 4 ou mais contratos ativos e 70% ou mais da margem tomada.',
    corBadge: 'bg-red-500 text-white'
  },
  {
    nome: 'Tomador Moderado',
    minContratosDeferidos: 2,
    maxContratosDeferidos: 3,
    minPercentualTomado: 41,
    maxPercentualTomado: 69.99,
    descricao: 'Cliente que tem entre 2 ou 3 contratos deferidos e um percentual de 41% até 69% da margem tomada.',
    corBadge: 'bg-orange-500 text-white'
  },
  {
    nome: 'Tomador Iniciante',
    minContratosDeferidos: 0,
    maxContratosDeferidos: 1,
    minPercentualTomado: 0,
    maxPercentualTomado: 40,
    descricao: 'Cliente que tem até 1 contrato deferido ou até 40% da margem tomada.',
    corBadge: 'bg-blue-500 text-white',
    condicaoOr: true
  },
  {
    nome: 'Tomador',
    minContratosDeferidos: 0,
    maxContratosDeferidos: null,
    minPercentualTomado: 0,
    maxPercentualTomado: null,
    descricao: 'Perfil geral para clientes que possuem margem tomada ou contratos, mas não se enquadram perfeitamente nos perfis mais restritos.',
    corBadge: 'bg-gray-500 text-white'
  }
];

export const defaultBancos: Banco[] = [
  {
    id: 'banco-1',
    nome: 'Banco do Brasil',
    prazos: [
      { prazo: 96, fator: 0.0245, taxa: 1.80 },
      { prazo: 72, fator: 0.0280, taxa: 1.85 },
    ]
  },
  {
    id: 'banco-2',
    nome: 'Caixa Econômica',
    prazos: [
      { prazo: 96, fator: 0.0240, taxa: 1.75 },
      { prazo: 84, fator: 0.0255, taxa: 1.78 },
    ]
  },
  {
    id: 'banco-3',
    nome: 'Santander',
    prazos: [
      { prazo: 96, fator: 0.0250, taxa: 1.82 },
    ]
  }
];

export const storage = {
  getBancos: (): Banco[] => {
    if (typeof window === 'undefined') return [];
    const val = localStorage.getItem(STORAGE_KEY_BANCOS);
    return val ? JSON.parse(val) : defaultBancos;
  },
  setBancos: (bancos: Banco[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_BANCOS, JSON.stringify(bancos));
    }
  },
  getRegras: (): RegraPerfil[] => {
    if (typeof window === 'undefined') return defaultRegras;
    const val = localStorage.getItem(STORAGE_KEY_REGRAS);
    return val ? JSON.parse(val) : defaultRegras;
  },
  setRegras: (regras: RegraPerfil[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_REGRAS, JSON.stringify(regras));
    }
  },
  getHistorico: (): BuscaHistorico[] => {
    if (typeof window === 'undefined') return [];
    const val = localStorage.getItem(STORAGE_KEY_HISTORICO);
    return val ? JSON.parse(val) : [];
  },
  addHistorico: (busca: BuscaHistorico) => {
    if (typeof window !== 'undefined') {
      const historico = storage.getHistorico();
      // Remover se já existir o mesmo CPF
      const filtrado = historico.filter(h => h.cpf !== busca.cpf);
      // Adicionar no topo
      filtrado.unshift(busca);
      // Manter apenas os últimos 15
      localStorage.setItem(STORAGE_KEY_HISTORICO, JSON.stringify(filtrado.slice(0, 15)));
    }
  },
  clearHistorico: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_HISTORICO);
    }
  }
};
