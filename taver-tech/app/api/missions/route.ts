export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { emitTaverEvent } from '@/lib/realtime';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const assignee = searchParams.get('assignee');
  const seed = JSON.parse(fs.readFileSync('seed.json', 'utf8'));
  let list = seed.missions;
  if (status) list = list.filter((m: any) => m.status === status);
  if (assignee) list = list.filter((m: any) => m.assigned_to === assignee);
  return NextResponse.json({ data: list });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = `m${Date.now()}`;
  const seed = JSON.parse(fs.readFileSync('seed.json', 'utf8'));
  const mission = { id, created_at: new Date().toISOString(), status:'todo', ...body };
  seed.missions.push(mission);
  seed.analytics_events.push({ id: `ae-${Date.now()}`, event_type: 'mission_created', payload: { id }, created_at: new Date().toISOString() });
  fs.writeFileSync('seed.json', JSON.stringify(seed, null, 2));
  await emitTaverEvent('mission_created', { id, mission });
  return NextResponse.json({ ok:true, mission });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, status, assigned_to } = body;
  const seed = JSON.parse(fs.readFileSync('seed.json', 'utf8'));
  const idx = seed.missions.findIndex((m: any) => m.id === id);
  if (idx === -1) return NextResponse.json({ ok:false, error:'not_found' }, { status: 404 });
  seed.missions[idx] = { ...seed.missions[idx], status, assigned_to };
  seed.analytics_events.push({ id: `ae-${Date.now()}`, event_type: 'mission_moved', payload: { id, status }, created_at: new Date().toISOString() });
  fs.writeFileSync('seed.json', JSON.stringify(seed, null, 2));
  await emitTaverEvent('mission_moved', { id, status, assigned_to });
  return NextResponse.json({ ok:true, mission: seed.missions[idx] });
}