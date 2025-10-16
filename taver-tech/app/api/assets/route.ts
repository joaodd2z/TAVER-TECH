export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { emitTaverEvent } from '@/lib/realtime';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.toLowerCase();
  const type = searchParams.get('type');
  const tag = searchParams.get('tag');
  const page = Number(searchParams.get('page') || 1);
  const seed = JSON.parse(fs.readFileSync('seed.json', 'utf8'));
  let list = seed.assets;
  if (q) list = list.filter((a: any) => a.title.toLowerCase().includes(q));
  if (type) list = list.filter((a: any) => a.type === type);
  if (tag) list = list.filter((a: any) => a.tags?.includes(tag));
  const pageSize = 12;
  const start = (page - 1) * pageSize;
  const data = list.slice(start, start + pageSize);
  return NextResponse.json({ data, total: list.length, page });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const seed = JSON.parse(fs.readFileSync('seed.json', 'utf8'));
  const id = `a${Date.now()}`;
  const asset = { id, created_at: new Date().toISOString(), ...body };
  seed.assets.push(asset);
  seed.analytics_events.push({ id: `ae-${Date.now()}`, event_type: 'asset_uploaded', payload: { id }, created_at: new Date().toISOString() });
  fs.writeFileSync('seed.json', JSON.stringify(seed, null, 2));
  await emitTaverEvent('asset_uploaded', { id: asset.id, asset });
  return NextResponse.json({ ok:true, asset });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const seed = JSON.parse(fs.readFileSync('seed.json', 'utf8'));
  const idx = seed.assets.findIndex((a: any) => a.id === id);
  if (idx === -1) return NextResponse.json({ ok:false, error:'not_found' }, { status: 404 });
  const removed = seed.assets.splice(idx, 1)[0];
  seed.analytics_events.push({ id: `ae-${Date.now()}`, event_type: 'asset_deleted', payload: { id }, created_at: new Date().toISOString() });
  fs.writeFileSync('seed.json', JSON.stringify(seed, null, 2));
  await emitTaverEvent('asset_deleted', { id });
  return NextResponse.json({ ok:true, asset: removed });
}