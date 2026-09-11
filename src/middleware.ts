import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Lista de caminhos públicos que não exigem login
const publicPaths = ['/login', '/icon.svg', '/favicon.ico'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Permite acesso a recursos estáticos e rotas públicas
  if (
    publicPaths.includes(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/assets') ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg)$/)
  ) {
    return NextResponse.next();
  }

  // Verifica o cookie de segurança criado no login
  const token = request.cookies.get('consigview_auth_token');

  if (!token) {
    // Se for uma requisição para a API, retorna 401 Unauthorized
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'unauthorized', message: 'Acesso negado' }, { status: 401 });
    }
    
    // Se for uma página normal, redireciona para a tela de login
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Configura em quais rotas o middleware vai rodar (bloqueia tudo exceto imagens e arquivos do next)
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
