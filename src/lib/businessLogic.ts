import { Banco, RegraPerfil } from './storage';
import { Contrato, Margem } from './margemApi';

export function calcularPercentualTomado(margens: Margem[], servico: string = 'EMPRESTIMO'): number {
  const margem = margens.find(m => m.servico.toUpperCase().includes(servico.toUpperCase()));
  if (!margem || margem.margemTotal === 0) return 0;
  
  const tomada = margem.margemTotal - margem.margemDisponivel;
  return Math.max(0, (tomada / margem.margemTotal) * 100);
}

export function classificarPerfil(contratos: Contrato[], percentualTomado: number, regras: RegraPerfil[]): RegraPerfil | null {
  const deferidos = contratos.filter(c => c.situacao.toLowerCase() === 'deferida').length;

  for (const regra of regras) {
    const contratosMatch = deferidos >= regra.minContratosDeferidos && 
                           (regra.maxContratosDeferidos === null || deferidos <= regra.maxContratosDeferidos);
    
    const percentualMatch = percentualTomado >= regra.minPercentualTomado && 
                            (regra.maxPercentualTomado === null || percentualTomado <= regra.maxPercentualTomado);
    
    const isMatch = regra.condicaoOr 
      ? (contratosMatch || percentualMatch)
      : (contratosMatch && percentualMatch);

    if (isMatch) {
      return regra;
    }
  }

  return null;
}

export interface Simulacao {
  bancoId: string;
  bancoNome: string;
  prazo: number;
  fator: number;
  taxa?: number;
  valorLiberado: number;
}

export function simularValores(margens: Margem[], bancos: Banco[], servico: string = 'EMPRESTIMO'): Simulacao[] {
  const margem = margens.find(m => m.servico.toUpperCase().includes(servico.toUpperCase()));
  if (!margem || margem.margemDisponivel <= 0) return [];

  const simulacoes: Simulacao[] = [];

  for (const banco of bancos) {
    for (const prazoInfo of banco.prazos) {
      simulacoes.push({
        bancoId: banco.id,
        bancoNome: banco.nome,
        prazo: prazoInfo.prazo,
        fator: prazoInfo.fator,
        taxa: prazoInfo.taxa,
        valorLiberado: margem.margemDisponivel / prazoInfo.fator,
      });
    }
  }

  simulacoes.sort((a, b) => b.valorLiberado - a.valorLiberado);
  return simulacoes;
}
