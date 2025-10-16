export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { signToken, verifyPassword } from '@/lib/auth';
import fs from 'fs';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password } = body;

  // naive seed reading
  const seedPath = 'seed.json';
  const seedRaw = fs.readFileSync(seedPath, 'utf8');
  const seed = JSON.parse(seedRaw);
  console.log('[auth/login] body.email=', email, 'seed.admin.email=', seed.admin?.email);

  if (email === seed.admin.email) {
    const ok = await verifyPassword(password, seed.admin.password_hash);
    console.log('[auth/login] bcrypt compare ->', ok);
    if (ok) {
      const token = signToken({ id: 'admin-1', email, role: 'admin' });
      const res = NextResponse.json({ ok: true, user: { email, role: 'admin' } });
      res.cookies.set('token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 2 });
      return res;
    }
  }
  return NextResponse.json({ ok: false, error: 'invalid_credentials' }, { status: 401 });
}