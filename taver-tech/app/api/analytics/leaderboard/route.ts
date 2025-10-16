export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import fs from 'fs';

export async function GET() {
  const seed = JSON.parse(fs.readFileSync('seed.json','utf8'));
  const events = seed.analytics_events || [];
  const posts_count = events.filter((e:any)=> e.event_type === 'post_sent').length;
  const admin = { email: seed.admin.email, xp: seed.admin.profile.xp, level: seed.admin.profile.level, posts_count };
  return NextResponse.json({ data: [admin] });
}