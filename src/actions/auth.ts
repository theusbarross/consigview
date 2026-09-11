"use server";

import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'consigview_auth_token';

// Server Action para realizar o login
export async function doLogin(usuario: string, senhaDigitada: string): Promise<boolean> {
  const authEnv = process.env.AUTH_USERS || '';
  
  if (!authEnv) {
    console.error('AUTH_USERS não está configurado no .env.local');
    return false;
  }

  // O formato no .env.local é "admin:123,amanda@smart.com:Amanda@1020"
  const usuariosPermitidos = authEnv.split(',').map(pair => {
    const [u, p] = pair.split(':');
    return { usuario: u?.trim(), senha: p?.trim() };
  });

  const usuarioEncontrado = usuariosPermitidos.find(u => u.usuario === usuario);

  if (usuarioEncontrado && usuarioEncontrado.senha === senhaDigitada) {
    // Definir cookie seguro
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, 'true', {
      httpOnly: true, // Javascript no navegador não consegue ler (previne XSS)
      secure: process.env.NODE_ENV === 'production', // Apenas HTTPS em produção
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 dias
    });
    return true;
  }

  return false;
}

// Server Action para realizar o logout
export async function doLogout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
