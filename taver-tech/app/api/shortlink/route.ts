export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import fs from 'fs';
import { emitTaverEvent } from '@/lib/realtime';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug') || '';
  const seed = JSON.parse(fs.readFileSync('seed.json', 'utf8'));
  const item = seed.shortlinks.find((s: any) => s.slug === slug);
  if (!item) return NextResponse.json({ ok:false, error:'not_found' }, { status: 404 });
  item.clicks++;
  seed.analytics_events.push({ id: `ae-${Date.now()}`, event_type: 'short_click', payload: { slug, coupon_id: item.coupon_id }, created_at: new Date().toISOString() });
  fs.writeFileSync('seed.json', JSON.stringify(seed, null, 2));
  await emitTaverEvent('short_clicked', { slug, target_url: item.target_url });
  return NextResponse.redirect(item.target_url, { status: 302 });
}