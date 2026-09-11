"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from './theme-toggle';
import { doLogout } from '@/actions/auth';
import { LogOut } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/login') return null;

  const handleLogout = async () => {
    await doLogout();
    router.push('/login');
  };

  return (
    <nav className="sticky top-0 z-50 glass no-print">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="font-extrabold text-2xl text-gradient flex items-center gap-2 tracking-tight">
          ConsigView
        </div>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
          <Link href="/config" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">Configurações</Link>
          <div className="pl-4 ml-2 border-l border-border/50 flex items-center gap-4">
            <ThemeToggle />
            <button onClick={handleLogout} className="text-sm font-semibold text-destructive hover:text-destructive/80 transition-colors flex items-center gap-1">
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
