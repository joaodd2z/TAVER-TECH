export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const credential = body?.credential as string | undefined;
  if (!credential) return NextResponse.json({ ok: false, error: 'missing_credential' }, { status: 400 });

  try {
    // Validate Google ID Token using tokeninfo endpoint
    const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
    if (!verifyRes.ok) {
      return NextResponse.json({ ok: false, error: 'invalid_google_token' }, { status: 401 });
    }
    const info = await verifyRes.json();

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
    const aud = info.aud as string | undefined;
    const email = info.email as string | undefined;
    const email_verified = info.email_verified === true || info.email_verified === 'true';

    if (!clientId || aud !== clientId || !email || !email_verified) {
      return NextResponse.json({ ok: false, error: 'unauthorized_google' }, { status: 401 });
    }

    const token = signToken({ id: `google:${info.sub}`, email, role: 'publisher' });
    const res = NextResponse.json({ ok: true, user: { email, role: 'publisher', provider: 'google' } });
    res.cookies.set('token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 2 });
    return res;
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: 'google_auth_error', message: err.message }, { status: 500 });
  }
}