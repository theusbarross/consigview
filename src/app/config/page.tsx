"use client";

import { useState, useEffect } from 'react';
import { storage, Banco, RegraPerfil, defaultRegras } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Trash2, Plus, Save, Banknote, ShieldAlert } from 'lucide-react';

export default function ConfigPage() {
  const [activeTab, setActiveTab] = useState<'bancos' | 'regras'>('bancos');
  const [bancos, setBancos] = useState<Banco[]>([]);
  const [regras, setRegras] = useState<RegraPerfil[]>([]);

  useEffect(() => {
    setBancos(storage.getBancos());
    setRegras(storage.getRegras());
  }, []);

  const handleSave = () => {
    storage.setBancos(bancos);
    storage.setRegras(regras);
    alert('Configurações salvas com sucesso!');
  };

  const handleResetRegras = () => {
    if (confirm('Tem certeza que deseja restaurar as regras de perfil para o padrão de fábrica?')) {
      setRegras(defaultRegras);
    }
  }

  // Funções de Banco
  const addBanco = () => setBancos([...bancos, { id: Date.now().toString(), nome: 'Novo Banco', prazos: [] }]);
  const removeBanco = (id: string) => setBancos(bancos.filter(b => b.id !== id));
  const updateBancoNome = (id: string, nome: string) => setBancos(bancos.map(b => b.id === id ? { ...b, nome } : b));
  const addPrazo = (bancoId: string) => setBancos(bancos.map(b => b.id === bancoId ? { ...b, prazos: [...b.prazos, { prazo: 96, fator: 1.0, taxa: 1.80 }] } : b));
  const removePrazo = (bancoId: string, index: number) => setBancos(bancos.map(b => b.id === bancoId ? { ...b, prazos: b.prazos.filter((_, i) => i !== index) } : b));
  const updatePrazo = (bancoId: string, index: number, field: 'prazo' | 'fator' | 'taxa', value: number) => {
    setBancos(bancos.map(b => b.id === bancoId ? {
      ...b,
      prazos: b.prazos.map((p, i) => i === index ? { ...p, [field]: value } : p)
    } : b));
  };

  // Funções de Regra
  const addRegra = () => {
    setRegras([...regras, {
      nome: 'Nova Regra',
      minContratosDeferidos: 0,
      maxContratosDeferidos: 0,
      minPercentualTomado: 0,
      maxPercentualTomado: 0,
      descricao: 'Descrição do novo perfil',
      corBadge: 'bg-primary text-primary-foreground',
      condicaoOr: false
    }]);
  };
  const removeRegra = (index: number) => setRegras(regras.filter((_, i) => i !== index));
  const updateRegra = (index: number, field: keyof RegraPerfil, value: any) => {
    setRegras(regras.map((r, i) => i === index ? { ...r, [field]: value } : r));
  };

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-center glass p-6 md:p-8 rounded-[2rem]">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gradient">Configurações</h1>
          <p className="text-muted-foreground text-sm md:text-base mt-2 font-medium">Gerencie bancos, fatores e regras de perfis de cliente.</p>
        </div>
        <Button onClick={handleSave} className="shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 hover:scale-105 transition-all font-bold px-6">
          <Save className="w-4 h-4 mr-2" /> Salvar Tudo
        </Button>
      </div>

      <div className="flex gap-3 border-b border-border/50 pb-4">
        <Button 
          variant={activeTab === 'bancos' ? 'default' : 'ghost'} 
          onClick={() => setActiveTab('bancos')}
          className="rounded-full"
        >
          <Banknote className="w-4 h-4 mr-2" />
          Bancos e Fatores
        </Button>
        <Button 
          variant={activeTab === 'regras' ? 'default' : 'ghost'} 
          onClick={() => setActiveTab('regras')}
          className="rounded-full"
        >
          <ShieldAlert className="w-4 h-4 mr-2" />
          Regras de Perfil
        </Button>
      </div>

      {activeTab === 'bancos' && (
        <section className="space-y-6 animate-in slide-in-from-bottom-2">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold tracking-tight">Bancos e Fatores</h2>
            <Button variant="outline" onClick={addBanco}><Plus className="w-4 h-4 mr-2" /> Adicionar Banco</Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bancos.map(banco => (
              <Card key={banco.id} className="glass-card hover:-translate-y-1 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full filter blur-3xl -z-10"></div>
                <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/30">
                  <Input 
                    value={banco.nome} 
                    onChange={e => updateBancoNome(banco.id, e.target.value)}
                    className="font-semibold text-base w-[80%] border-transparent hover:border-border focus:border-border transition-colors px-2 -ml-2"
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeBanco(banco.id)} className="hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {banco.prazos.map((p, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Prazo (meses)</label>
                        <Input type="number" value={p.prazo} onChange={e => updatePrazo(banco.id, index, 'prazo', Number(e.target.value))} />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Fator</label>
                        <Input type="number" step="0.01" value={p.fator} onChange={e => updatePrazo(banco.id, index, 'fator', Number(e.target.value))} />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Taxa (%)</label>
                        <Input type="number" step="0.01" value={p.taxa || 0} onChange={e => updatePrazo(banco.id, index, 'taxa', Number(e.target.value))} />
                      </div>
                      <Button variant="ghost" size="icon" className="mt-5 text-muted-foreground hover:text-destructive" onClick={() => removePrazo(banco.id, index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="secondary" size="sm" className="w-full mt-2" onClick={() => addPrazo(banco.id)}>
                    <Plus className="w-4 h-4 mr-2" /> Adicionar Prazo
                  </Button>
                </CardContent>
              </Card>
            ))}
            {bancos.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                Nenhum banco cadastrado. Adicione um banco para começar.
              </div>
            )}
          </div>
        </section>
      )}

      {activeTab === 'regras' && (
        <section className="space-y-6 animate-in slide-in-from-bottom-2">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Regras de Perfil</h2>
              <p className="text-sm text-muted-foreground mt-1">A ordem das regras importa! A primeira que bater será a escolhida.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleResetRegras}>Restaurar Padrões</Button>
              <Button variant="outline" onClick={addRegra}><Plus className="w-4 h-4 mr-2" /> Adicionar Regra</Button>
            </div>
          </div>

          <div className="space-y-4">
            {regras.map((regra, index) => (
              <Card key={index} className="glass-card hover:-translate-y-1 border-l-4 group relative overflow-hidden" style={{ borderLeftColor: 'hsl(var(--primary))' }}>
                <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full filter blur-3xl -z-10"></div>
                <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/30">
                  <div className="w-1/3">
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Nome do Perfil</label>
                    <Input 
                      value={regra.nome} 
                      onChange={e => updateRegra(index, 'nome', e.target.value)}
                      className="font-semibold"
                    />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeRegra(index)} className="hover:bg-destructive/10 hover:text-destructive text-muted-foreground">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Min. Contratos</label>
                      <Input type="number" value={regra.minContratosDeferidos} onChange={e => updateRegra(index, 'minContratosDeferidos', Number(e.target.value))} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Max. Contratos (vazio = s/ limite)</label>
                      <Input type="number" value={regra.maxContratosDeferidos ?? ''} onChange={e => updateRegra(index, 'maxContratosDeferidos', e.target.value === '' ? null : Number(e.target.value))} placeholder="Ilimitado" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Min. % Margem Tomada</label>
                      <Input type="number" step="0.01" value={regra.minPercentualTomado} onChange={e => updateRegra(index, 'minPercentualTomado', Number(e.target.value))} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Max. % Margem (vazio = s/ limite)</label>
                      <Input type="number" step="0.01" value={regra.maxPercentualTomado ?? ''} onChange={e => updateRegra(index, 'maxPercentualTomado', e.target.value === '' ? null : Number(e.target.value))} placeholder="Ilimitado" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex-1">
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Descrição do Perfil</label>
                      <Input value={regra.descricao} onChange={e => updateRegra(index, 'descricao', e.target.value)} />
                    </div>
                    <div className="w-1/4">
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Classe CSS da Badge</label>
                      <Input value={regra.corBadge || ''} onChange={e => updateRegra(index, 'corBadge', e.target.value)} />
                    </div>
                    <div className="w-auto flex items-center gap-2 mt-5">
                      <input 
                        type="checkbox" 
                        id={`condicaoOr-${index}`}
                        checked={!!regra.condicaoOr} 
                        onChange={e => updateRegra(index, 'condicaoOr', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <label htmlFor={`condicaoOr-${index}`} className="text-sm font-medium cursor-pointer">Usar Regra "OU"</label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {regras.length === 0 && (
              <div className="py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                Nenhuma regra cadastrada. Adicione uma regra ou restaure os padrões.
              </div>
            )}
          </div>
        </section>
      )}

    </div>
  );
}
