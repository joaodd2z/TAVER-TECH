export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { awardXP } from '@/lib/gamification';

export async function GET() {
  const seed = JSON.parse(fs.readFileSync('seed.json','utf8'));
  return NextResponse.json({ data: seed.sophai_training || [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, data = [], text = '', tags = [] } = body;
  if (!title) return NextResponse.json({ ok:false, error:'missing_title' }, { status: 400 });
  const seed = JSON.parse(fs.readFileSync('seed.json','utf8'));
  const entry = { id: 'st'+Date.now(), title, data: text ? [text] : data, tags, created_at: new Date().toISOString() };
  seed.sophai_training = seed.sophai_training || [];
  seed.sophai_training.push(entry);
  seed.analytics_events = seed.analytics_events || [];
  seed.analytics_events.push({ id: `ae-${Date.now()}`, event_type: 'training_added', payload: { id: entry.id }, created_at: new Date().toISOString() });
  fs.writeFileSync('seed.json', JSON.stringify(seed, null, 2));
  await awardXP(10, 'sophai_train');
  return NextResponse.json({ ok: true, entry });
}