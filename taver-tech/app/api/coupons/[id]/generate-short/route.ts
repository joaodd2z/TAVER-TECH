import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { randomSlug } from '@/lib/slug';

export async function POST(req: NextRequest, { params }: any) {
  const id = params?.id;
  const seed = JSON.parse(fs.readFileSync('seed.json', 'utf8'));
  const idx = seed.coupons.findIndex((c: any) => c.id === id);
  if (idx === -1) return NextResponse.json({ ok:false, error:'not_found' }, { status: 404 });
  const slug = randomSlug();
  const short_url = `${process.env.VERCEL_URL || 'http://localhost:3000'}/s/${slug}`;
  seed.shortlinks.push({ slug, target_url: seed.coupons[idx].affiliate_link, created_by: 'admin', clicks: 0, created_at: new Date().toISOString() });
  fs.writeFileSync('seed.json', JSON.stringify(seed, null, 2));
  return NextResponse.json({ ok:true, slug, short_url });
}