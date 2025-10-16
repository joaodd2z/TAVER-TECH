export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { randomSlug } from '@/lib/slug';
import { emitTaverEvent } from '@/lib/realtime';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const q = searchParams.get('q')?.toLowerCase();
  const tag = searchParams.get('tag');
  const page = Number(searchParams.get('page') || 1);

  const seed = JSON.parse(fs.readFileSync('seed.json', 'utf8'));
  let list = seed.coupons;
  if (status) list = list.filter((c: any) => c.status === status);
  if (q) list = list.filter((c: any) => c.product_name.toLowerCase().includes(q) || c.platform.toLowerCase().includes(q));
  if (tag) list = list.filter((c: any) => c.tags?.includes(tag));

  const pageSize = 10;
  const start = (page - 1) * pageSize;
  const data = list.slice(start, start + pageSize);
  return NextResponse.json({ data, total: list.length, page });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  // validações básicas
  const discount = Number(body.discount_percent || 0);
  if (discount < 0 || discount > 100) return NextResponse.json({ ok:false, error:'invalid_discount' }, { status: 400 });
  if (!/^https?:\/\//.test(body.affiliate_link)) return NextResponse.json({ ok:false, error:'invalid_url' }, { status: 400 });
  if (new Date(body.expires_at).getTime() <= Date.now()) return NextResponse.json({ ok:false, error:'date_in_past' }, { status: 400 });

  const seed = JSON.parse(fs.readFileSync('seed.json', 'utf8'));
  const id = `c${Date.now()}`;
  const coupon = { id, usage_count: 0, status: 'active', created_at: new Date().toISOString(), ...body };
  seed.coupons.push(coupon);
  seed.analytics_events.push({ id: `ae-${Date.now()}`, event_type: 'coupon_created', payload: { id }, created_at: new Date().toISOString() });
  fs.writeFileSync('seed.json', JSON.stringify(seed, null, 2));
  await emitTaverEvent('coupon_created', { id, coupon });
  return NextResponse.json({ ok:true, coupon });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...changes } = body;
  const seed = JSON.parse(fs.readFileSync('seed.json', 'utf8'));
  const idx = seed.coupons.findIndex((c: any) => c.id === id);
  if (idx === -1) return NextResponse.json({ ok:false, error:'not_found' }, { status: 404 });
  seed.coupons[idx] = { ...seed.coupons[idx], ...changes };
  seed.analytics_events.push({ id: `ae-${Date.now()}`, event_type: 'coupon_updated', payload: { id }, created_at: new Date().toISOString() });
  fs.writeFileSync('seed.json', JSON.stringify(seed, null, 2));
  await emitTaverEvent('coupon_updated', { id, coupon: seed.coupons[idx] });
  return NextResponse.json({ ok:true, coupon: seed.coupons[idx] });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const seed = JSON.parse(fs.readFileSync('seed.json', 'utf8'));
  const idx = seed.coupons.findIndex((c: any) => c.id === id);
  if (idx === -1) return NextResponse.json({ ok:false, error:'not_found' }, { status: 404 });
  const removed = seed.coupons.splice(idx, 1)[0];
  seed.analytics_events.push({ id: `ae-${Date.now()}`, event_type: 'coupon_deleted', payload: { id }, created_at: new Date().toISOString() });
  fs.writeFileSync('seed.json', JSON.stringify(seed, null, 2));
  await emitTaverEvent('coupon_deleted', { id });
  return NextResponse.json({ ok:true, coupon: removed });
}

export async function POST_generate_short(req: NextRequest) {
  const body = await req.json();
  const { id } = body;
  const seed = JSON.parse(fs.readFileSync('seed.json', 'utf8'));
  const idx = seed.coupons.findIndex((c: any) => c.id === id);
  if (idx === -1) return NextResponse.json({ ok:false, error:'not_found' }, { status: 404 });
  const slug = randomSlug();
  const short_url = `${process.env.VERCEL_URL || 'http://localhost:3000'}/s/${slug}`;
  seed.shortlinks.push({ slug, target_url: seed.coupons[idx].affiliate_link, created_by: 'admin', clicks: 0, created_at: new Date().toISOString() });
  fs.writeFileSync('seed.json', JSON.stringify(seed, null, 2));
  return NextResponse.json({ ok:true, slug, short_url });
}