"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doLogin } from '@/actions/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle, Lock, User, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    const sucesso = await doLogin(usuario, senha);
    if (sucesso) {
      router.push('/');
    } else {
      setErro('Usuário ou senha incorretos.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative p-4 overflow-hidden">
      {/* Background animado idêntico ao do layout principal */}
      <div className="absolute inset-0 -z-10 bg-background overflow-hidden no-print">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/20 blur-[150px] animate-blob animation-delay-2000"></div>
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-purple-500/20 blur-[100px] animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gradient drop-shadow-sm mb-2">
            ConsigView
          </h1>
          <p className="text-muted-foreground font-medium">Acesso Restrito</p>
        </div>

        <Card className="glass-card shadow-2xl shadow-primary/10 border-white/10">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
            <CardDescription className="text-center font-medium">
              Insira suas credenciais para acessar o painel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2 relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Usuário"
                  className="pl-10 h-12 bg-background/50 border-input/50 focus-visible:ring-primary shadow-inner rounded-xl"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Senha"
                  className="pl-10 h-12 bg-background/50 border-input/50 focus-visible:ring-primary shadow-inner rounded-xl"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
              </div>

              {erro && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-lg flex items-center text-sm font-medium animate-in slide-in-from-top-2 border border-destructive/20">
                  <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                  {erro}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-12 rounded-xl text-md font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar no Sistema'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
