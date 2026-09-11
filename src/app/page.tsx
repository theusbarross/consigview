"use client";

import { useState, useEffect } from 'react';
import { buscarPorCpf, ConsultaResult } from '@/lib/margemApi';
import { storage, Banco, RegraPerfil, BuscaHistorico } from '@/lib/storage';
import { classificarPerfil, simularValores, Simulacao, calcularPercentualTomado } from '@/lib/businessLogic';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, AlertCircle, Loader2, DollarSign, Briefcase, FileText, Copy, Printer } from 'lucide-react';

export default function Dashboard() {
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ConsultaResult | null>(null);

  const [bancos, setBancos] = useState<Banco[]>([]);
  const [regras, setRegras] = useState<RegraPerfil[]>([]);
  const [perfil, setPerfil] = useState<RegraPerfil | null>(null);
  const [simulacoes, setSimulacoes] = useState<Simulacao[]>([]);
  const [historico, setHistorico] = useState<BuscaHistorico[]>([]);

  // Novos estados para a UI interativa
  const [selectedSimIndex, setSelectedSimIndex] = useState<number>(0);
  const [filtroContrato, setFiltroContrato] = useState('');
  const [filtroSituacao, setFiltroSituacao] = useState('Todas');

  useEffect(() => {
    setBancos(storage.getBancos());
    setRegras(storage.getRegras());
    setHistorico(storage.getHistorico());
  }, []);

  const executarBusca = async (cpfBusca: string) => {
    const cpfLimpo = cpfBusca.replace(/\D/g, '');
    if (cpfLimpo.length < 11) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setCpf(cpfLimpo); // Atualiza o input com o CPF clicado
    setSelectedSimIndex(0);
    setFiltroContrato('');
    setFiltroSituacao('Todas');
    
    try {
      const data = await buscarPorCpf(cpfLimpo);
      setResult(data);
      
      const percentual = calcularPercentualTomado(data.margens);
      const perfilEncontrado = classificarPerfil(data.contratos, percentual, regras);
      setPerfil(perfilEncontrado);

      const sims = simularValores(data.margens, bancos);
      setSimulacoes(sims);

      // Salva no histórico
      const novaBusca: BuscaHistorico = {
        cpf: cpfLimpo,
        nome: data.nome,
        data: new Date().toISOString()
      };
      storage.addHistorico(novaBusca);
      setHistorico(storage.getHistorico());

    } catch (err: any) {
      if (err.status === 429) {
        setError(`Limite de consultas atingido. Uso: ${err.uso}/${err.limite}. Tente novamente mais tarde.`);
      } else {
        setError(err.message || 'Erro ao buscar dados do servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await executarBusca(cpf);
  };

  const handleCopyResumo = () => {
    if (!result) return;
    
    let texto = `📄 *Resumo de Margem - ConsigView*\n`;
    texto += `👤 Cliente: ${result.nome}\n`;
    if (perfil) texto += `📊 Perfil: ${perfil.nome}\n`;
    texto += `\n`;
    
    result.margens.forEach(m => {
      texto += `💰 Margem Livre (${m.servico}): ${formatCurrency(m.margemDisponivel)}\n`;
    });
    
    if (simulacoes.length > 0) {
      texto += `\n🏦 Melhores Opções:\n`;
      simulacoes.slice(0, 3).forEach((sim, idx) => {
        texto += `${idx + 1}. ${sim.bancoNome} - ${sim.prazo}x - ${formatCurrency(sim.valorLiberado)}\n`;
      });
    }

    navigator.clipboard.writeText(texto);
    alert('Resumo copiado para a área de transferência!');
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const formatCpf = (v: string) => v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

  const filteredContratos = result?.contratos.filter(c => {
    const searchMatch = filtroContrato === '' || 
      c.consignataria.toLowerCase().includes(filtroContrato.toLowerCase()) || 
      c.ade.includes(filtroContrato);
    const situacaoMatch = filtroSituacao === 'Todas' || 
      c.situacao.toLowerCase() === filtroSituacao.toLowerCase();
    
    return searchMatch && situacaoMatch;
  }) || [];

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-10 animate-in fade-in duration-700">
      
      <div className="no-print relative flex flex-col items-center justify-center py-16 text-center glass rounded-[2rem] px-4 transition-all duration-500 hover:shadow-primary/5">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-gradient drop-shadow-sm">
          Análise de Margem
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl mb-10 max-w-2xl font-medium">
          Consulte o CPF do servidor para obter margens, contratos ativos e simulações das melhores oportunidades de crédito.
        </p>
        
        <form onSubmit={handleSearch} className="flex w-full max-w-lg gap-3 relative z-10">
          <Input
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            placeholder="Digite o CPF (apenas números)"
            className="h-14 text-lg shadow-inner bg-background/50 backdrop-blur-sm border-border/80 focus-visible:ring-primary focus-visible:ring-2 rounded-xl"
            maxLength={14}
          />
          <Button type="submit" className="h-14 px-8 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 hover:scale-105 transition-all duration-300 font-semibold text-md" disabled={loading || cpf.replace(/\D/g, '').length < 11}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5 mr-2" />}
            {loading ? '' : 'Consultar'}
          </Button>
        </form>

        {historico.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2 justify-center max-w-2xl no-print animate-in slide-in-from-bottom-2">
            <span className="text-sm font-semibold text-muted-foreground self-center mr-3 uppercase tracking-wider">Buscas Recentes:</span>
            {historico.slice(0, 5).map((h, i) => (
              <Badge 
                key={i} 
                variant="secondary" 
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground hover:scale-105 hover:-translate-y-0.5 transition-all px-4 py-2 border border-border shadow-sm rounded-lg font-medium"
                onClick={() => executarBusca(h.cpf)}
              >
                {h.nome.split(' ')[0]} ({formatCpf(h.cpf)})
              </Badge>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-8 opacity-60">
          Dica: Em modo Mock, use 42942942942 para testar limites ou 00000000000 para erros.
        </p>

        {error && (
          <div className="mt-8 p-4 bg-destructive/10 text-destructive rounded-xl flex items-center max-w-md w-full border border-destructive/20 text-sm font-medium animate-in fade-in slide-in-from-top-4 shadow-sm backdrop-blur-sm">
            <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
            <span className="text-left">{error}</span>
          </div>
        )}
      </div>

      {result && (
        <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-700">
          
          {/* Cabeçalho do Cliente & Perfil */}
          <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center glass-card p-8 rounded-[2rem]">
            <div>
              <p className="text-sm font-bold text-primary uppercase tracking-widest mb-2 opacity-80">Servidor</p>
              <h2 className="text-3xl font-extrabold tracking-tight">{result.nome}</h2>
              <p className="text-muted-foreground mt-2 font-medium">CPF: {formatCpf(result.cpf)} &bull; Matrícula: {result.margens[0]?.matricula}</p>
            </div>
            
            <div className="flex flex-col items-start md:items-end gap-4 text-left md:text-right p-5 bg-background/40 rounded-2xl border border-white/10 shadow-inner w-full md:w-auto backdrop-blur-md">
              <div className="flex gap-2 w-full md:w-auto justify-start md:justify-end mb-2 no-print">
                <Button variant="outline" size="sm" onClick={handleCopyResumo} className="hover:border-primary/50 hover:bg-primary/5 transition-colors">
                  <Copy className="w-4 h-4 mr-2" /> Copiar Resumo
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.print()} className="hover:border-primary/50 hover:bg-primary/5 transition-colors">
                  <Printer className="w-4 h-4 mr-2" /> Imprimir
                </Button>
              </div>
              
              {perfil && (
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Classificação de Perfil</p>
                  <Badge className={`${perfil.corBadge || 'bg-primary text-primary-foreground'} mb-3 text-sm px-4 py-1.5 shadow-md rounded-lg font-bold tracking-wide uppercase`}>{perfil.nome}</Badge>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xs font-medium">{perfil.descricao}</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Coluna Esquerda: Margens e Simulação */}
            <div className="lg:col-span-1 space-y-8">
              {/* Oportunidades no Topo */}
              <Card className="glass-card break-inside-avoid overflow-hidden hover:-translate-y-1 shadow-primary/10 shadow-lg border-primary/20">
                <CardHeader className="bg-primary/10 pb-4 border-b border-primary/20 backdrop-blur-md">
                  <CardTitle className="text-lg flex items-center gap-2 font-extrabold text-primary">
                    <DollarSign className="w-6 h-6" /> Oportunidades
                  </CardTitle>
                  <CardDescription className="font-semibold text-primary/80">Valor liberado para saque</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {simulacoes.length > 0 ? (
                    <div className="flex flex-col items-center justify-center space-y-6">
                      <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl w-full relative overflow-hidden group shadow-inner">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1 relative z-10">
                          Estimativa de Saque
                        </p>
                        <p className="text-5xl md:text-6xl font-black text-primary drop-shadow-sm scale-100 transition-transform duration-300 relative z-10 py-2">
                          {formatCurrency(simulacoes[selectedSimIndex]?.valorLiberado || 0)}
                        </p>
                      </div>

                      <div className="w-full">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                          Alterar Banco e Prazo
                        </label>
                        <select 
                          className="flex h-12 w-full items-center justify-between rounded-xl border-2 border-primary/20 bg-background/80 px-3 py-2 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer"
                          value={selectedSimIndex}
                          onChange={(e) => setSelectedSimIndex(Number(e.target.value))}
                        >
                          {simulacoes.map((sim, idx) => (
                            <option key={idx} value={idx}>
                              {sim.bancoNome} • {sim.prazo}x ({sim.taxa ? `Taxa: ${sim.taxa}% | ` : ''}Fator: {sim.fator})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground font-medium">
                      <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      Nenhuma simulação disponível para a margem atual.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Margens abaixo das oportunidades */}
              <h3 className="text-xl font-bold flex items-center gap-2 tracking-tight mt-10"><Briefcase className="w-6 h-6 text-primary drop-shadow-md" /> Serviços e Margens</h3>
              {result.margens.map((margem, idx) => {
                const percentualTomado = calcularPercentualTomado([margem], margem.servico);
                return (
                  <Card key={idx} className="glass-card hover:-translate-y-1 break-inside-avoid overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full filter blur-3xl -z-10"></div>
                    <CardHeader className="pb-3 border-b border-border/30">
                      <CardTitle className="text-lg font-bold">{margem.servico}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5 pt-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-semibold text-muted-foreground">Utilizado</span>
                          <span className="font-extrabold">{percentualTomado.toFixed(1)}%</span>
                        </div>
                        <Progress value={percentualTomado} className="h-2.5 bg-muted/50 rounded-full overflow-hidden shadow-inner" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-wider opacity-80">Total</p>
                          <p className="font-semibold">{formatCurrency(margem.margemTotal)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-wider opacity-80">Disponível</p>
                          <p className="font-extrabold text-primary text-xl drop-shadow-sm">{formatCurrency(margem.margemDisponivel)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Coluna Direita: Contratos */}
            <div className="lg:col-span-2">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold flex items-center gap-2 tracking-tight">
                    <FileText className="w-6 h-6 text-primary drop-shadow-md" /> Contratos Ativos
                  </h3>
                  <Badge variant="outline" className="text-sm px-4 py-1.5 glass shadow-sm font-bold">{filteredContratos.length} Contratos</Badge>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Buscar ADE ou Banco..." 
                      className="pl-9 bg-background/50 h-10 w-full sm:w-[200px]"
                      value={filtroContrato}
                      onChange={(e) => setFiltroContrato(e.target.value)}
                    />
                  </div>
                  <select
                    className="flex h-10 w-full sm:w-[160px] items-center justify-between rounded-md border border-input bg-background/50 px-3 py-2 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
                    value={filtroSituacao}
                    onChange={(e) => setFiltroSituacao(e.target.value)}
                  >
                    <option value="Todas">Todas Situações</option>
                    <option value="Deferida">Deferida</option>
                    <option value="Quitada">Quitada</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </div>
              </div>
              
              <Card className="glass-card overflow-hidden transition-colors">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-primary/5 border-b border-border/50">
                      <TableRow>
                        <TableHead className="font-bold text-xs uppercase tracking-wider">Consignatária</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-wider">Situação</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-wider">Prestação</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-wider">Pagas</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-wider">Datas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredContratos.map((contrato, idx) => (
                        <TableRow key={idx} className="hover:bg-primary/5 transition-colors border-b border-border/20 last:border-0">
                          <TableCell className="font-bold">
                            {contrato.consignataria}
                            <div className="text-xs text-muted-foreground mt-1.5 font-medium opacity-80">ADE: {contrato.ade}</div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={contrato.situacao.toLowerCase() === 'quitada' ? 'secondary' : 
                                      contrato.situacao.toLowerCase() === 'cancelada' ? 'outline' : 'default'}
                              className={
                                contrato.situacao.toLowerCase() === 'deferida' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold border-blue-500/20 shadow-sm' :
                                contrato.situacao.toLowerCase() === 'quitada' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border-emerald-500/20 shadow-sm' : 'font-bold shadow-sm'
                              }
                            >
                              {contrato.situacao}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-extrabold text-primary/80">
                            {formatCurrency(contrato.prestacao)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <span className="text-sm font-bold">{contrato.pagas}</span>
                              <span className="text-muted-foreground text-xs font-semibold">/</span>
                              <span className="text-sm text-muted-foreground font-semibold">{contrato.prestacoes}</span>
                            </div>
                            <Progress value={(contrato.pagas / (contrato.prestacoes || 1)) * 100} className="h-2 w-16 bg-muted/50 print-color-adjust-exact shadow-inner" />
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground space-y-1.5 font-medium opacity-90">
                            {contrato.deferimento && <div><span className="font-bold mr-1 opacity-70">DEF:</span>{new Date(contrato.deferimento).toLocaleDateString('pt-BR')}</div>}
                            {contrato.ultimoDesconto && <div><span className="font-bold mr-1 opacity-70">DESC:</span>{new Date(contrato.ultimoDesconto).toLocaleDateString('pt-BR')}</div>}
                            {contrato.quitacao && <div><span className="font-bold mr-1 opacity-70">QUIT:</span>{new Date(contrato.quitacao).toLocaleDateString('pt-BR')}</div>}
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredContratos.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-16 text-muted-foreground font-medium">
                            <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            Nenhum contrato encontrado para este servidor.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
