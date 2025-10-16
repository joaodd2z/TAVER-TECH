import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = new URL(req.url);
  if (pathname.startsWith('/admin')) {
    const token = req.cookies.get('token')?.value || '';
    // Simplificação: apenas checa presença de cookie no Edge
    // A verificação criptográfica do JWT deve acontecer nas rotas de API/páginas protegidas do lado servidor
    const valid = Boolean(token);
    if (!valid) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};