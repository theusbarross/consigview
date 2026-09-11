// src/lib/margemApi.ts

// 1. Raw Types (As per API Documentation)
export interface ContratoRaw {
  numero?: string;
  vlr_prestacao?: string;
  saldo_devedor?: string | number;
  situacao?: string;
  ade?: string;
  qtd_prestacao?: string;
  prestacoes_pagas?: string;
  deferimento?: string | null;
  quitacao?: string | null;
  dt_ultimo_desconto?: string | null;
  dt_ultima_parcela?: string | null;
  servico?: string;
}

export interface ConsignatariaRaw {
  nome?: string;
  consignataria?: string;
  codigo?: string;
  contratos: ContratoRaw[];
}

export interface ServidorRaw {
  matricula: string;
  tipo_servico?: string;
  servico?: string;
  consignatarias: ConsignatariaRaw[];
  margem_disponivel?: string;
  margem_total?: string;
}

export interface RespostaConsiglogRaw {
  meta: {
    tentativas_key: number;
    tentativas_extrato: number;
    max_key: number;
    max_extrato: number;
  };
  cpf: string;
  nome: string;
  processado_em: string;
  servidores: ServidorRaw[];
}

// 2. Normalized Domain Types
export interface Margem {
  servidor: string;
  matricula: string;
  cpf: string;
  servico: string;
  margemDisponivel: number;
  margemTotal: number;
}

export interface Contrato {
  consignataria: string;
  situacao: 'Quitada' | 'Cancelada' | 'Deferida' | string;
  ade: string;
  servico: string;
  prestacoes: number;
  pagas: number;
  prestacao: number;
  deferimento: string | null;
  quitacao: string | null;
  ultimoDesconto: string | null;
  ultimaParcela: string | null;
}

export interface ConsultaResult {
  cpf: string;
  nome: string;
  margens: Margem[];
  contratos: Contrato[];
  erro?: string;
}

// 3. Normalizer
export function normalizarParaDominio(raw: RespostaConsiglogRaw): ConsultaResult {
  const margens: Margem[] = [];
  const contratos: Contrato[] = [];

  const parseNum = (val: string | number | undefined | null): number => {
    if (val === undefined || val === null || val === '') return 0;
    if (typeof val === 'number') return val;
    return parseFloat(val.replace(/\./g, '').replace(',', '.'));
  };

  raw.servidores?.forEach((servidor) => {
    margens.push({
      servidor: raw.nome,
      matricula: servidor.matricula,
      cpf: raw.cpf,
      servico: servidor.tipo_servico || servidor.servico || 'EMPRÉSTIMO',
      margemDisponivel: parseNum(servidor.margem_disponivel),
      margemTotal: parseNum(servidor.margem_total),
    });

    servidor.consignatarias?.forEach((contratoRaw: any) => {
      contratos.push({
        consignataria: contratoRaw.consignataria || contratoRaw.nome || 'Desconhecida',
        situacao: contratoRaw.situacao ?? 'Deferida',
        ade: contratoRaw.ade ?? contratoRaw.numero ?? '',
        servico: contratoRaw.servico || servidor.tipo_servico || 'EMPRÉSTIMO',
        prestacoes: parseNum(contratoRaw.qtd_prestacao) || parseNum(contratoRaw.prestacoes) || 0,
        pagas: parseNum(contratoRaw.prestacoes_pagas) || parseNum(contratoRaw.pagas) || 0,
        prestacao: parseNum(contratoRaw.vlr_prestacao) || parseNum(contratoRaw.valor_parcela) || 0,
        deferimento: contratoRaw.deferimento || null,
        quitacao: contratoRaw.quitacao || null,
        ultimoDesconto: contratoRaw.dt_ultimo_desconto || contratoRaw.ultimo_desconto || null,
        ultimaParcela: contratoRaw.dt_ultima_parcela || contratoRaw.ultima_parcela || null,
      });
    });
  });

  return {
    cpf: raw.cpf,
    nome: raw.nome,
    margens,
    contratos,
  };
}

// 4. API Client (Frontend -> Next.js Route Proxy)
export async function buscarPorCpf(cpf: string): Promise<ConsultaResult> {
  try {
    const res = await fetch(`/api/consulta?cpf=${cpf}`);
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const error = new Error(errorData.error || `Erro HTTP: ${res.status}`);
      (error as any).status = res.status;
      if (res.status === 429) {
        (error as any).uso = errorData.uso;
        (error as any).limite = errorData.limite;
      }
      throw error;
    }

    const rawData: RespostaConsiglogRaw = await res.json();
    return normalizarParaDominio(rawData);
  } catch (error: any) {
    console.error('Erro ao buscar CPF:', error);
    throw error;
  }
}
