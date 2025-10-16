export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: any) {
  const id = params?.id;
  const points = Array.from({ length: 7 }).map((_, i) => ({ day: i, clicks: Math.floor(Math.random()*20) }));
  return NextResponse.json({ data: points });
}