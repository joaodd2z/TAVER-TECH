import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change';
const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function middleware(req: NextRequest) {
  const { pathname } = new URL(req.url);
  if (pathname.startsWith('/admin')) {
    const token = req.cookies.get('token')?.value || '';
    let valid = false;
    if (token) {
      try {
        await jwtVerify(token, secretKey);
        valid = true;
      } catch (e) {
        valid = false;
      }
    }
    if (!valid) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};