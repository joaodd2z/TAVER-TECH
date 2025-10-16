export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import fs from 'fs';

export async function GET() {
  const seed = JSON.parse(fs.readFileSync('seed.json','utf8'));
  const events = seed.analytics_events || [];
  const total_clicks = events.filter((e:any)=> e.event_type === 'short_click').length;
  const posts = events.filter((e:any)=> e.event_type === 'post_sent').length;
  const users = 1;
  const xp_total = seed.admin?.profile?.xp || 0;
  const missions_active = (seed.missions || []).filter((m:any)=> m.status !== 'posted').length;
  return NextResponse.json({ total_clicks, posts, users, xp_total, missions_active });
}