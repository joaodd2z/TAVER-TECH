export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import fs from 'fs';

export async function GET() {
  const seed = JSON.parse(fs.readFileSync('seed.json','utf8'));
  const profile = seed.admin?.profile || { xp: 0, level: 1 };
  return NextResponse.json({ profile, email: seed.admin.email });
}