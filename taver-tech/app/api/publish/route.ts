export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import axios from 'axios';
import { awardXP } from '@/lib/gamification';

function formatMsg(coupon: any, asset: any, copy: string) {
  const lines = [
    `🔥 ${coupon.platform} • ${coupon.product_name}`,
    `Cupom: ${coupon.coupon_code} (${coupon.discount_percent}% off)`,
    `Link: ${coupon.affiliate_link}`,
    asset ? `Asset: ${asset.title} (${asset.type}) ${asset.url}` : '',
    '',
    copy
  ].filter(Boolean);
  return lines.join('\n');
}

export async function GET() {
  const seed = JSON.parse(fs.readFileSync('seed.json','utf8'));
  const history = (seed.analytics_events || []).filter((e: any) => e.event_type === 'post_sent').sort((a: any,b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return NextResponse.json({ data: history });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { coupon_id, asset_id, copy = '', channels = [] } = body;
  const seed = JSON.parse(fs.readFileSync('seed.json','utf8'));
  const coupon = seed.coupons.find((c: any) => c.id === coupon_id);
  const asset = seed.assets.find((a: any) => a.id === asset_id);
  if (!coupon) return NextResponse.json({ ok:false, error:'coupon_not_found' }, { status: 404 });
  const text = formatMsg(coupon, asset, copy);

  const results: any[] = [];
  // Telegram
  const tgCfg = channels.find((c: any) => c.type === 'telegram');
  const tgToken = process.env.TELEGRAM_BOT_TOKEN;
  const tgChat = tgCfg?.chat_id || process.env.TELEGRAM_CHAT_ID;
  if (tgToken && tgChat) {
    try {
      const r = await axios.post(`https://api.telegram.org/bot${tgToken}/sendMessage`, { chat_id: tgChat, text });
      results.push({ channel: 'telegram', ok: true, id: r.data?.result?.message_id });
    } catch (err: any) {
      results.push({ channel: 'telegram', ok: false, error: err.message });
    }
  }

  // Discord
  const discordCfg = channels.find((c: any) => c.type === 'discord');
  const webhook = discordCfg?.webhook || process.env.DISCORD_WEBHOOK_URL;
  if (webhook) {
    try {
      const r = await axios.post(webhook, { content: text });
      results.push({ channel: 'discord', ok: true, status: r.status });
    } catch (err: any) {
      results.push({ channel: 'discord', ok: false, error: err.message });
    }
  }

  const whatsapp_link = `https://wa.me/?text=${encodeURIComponent(text)}`;
  results.push({ channel: 'whatsapp', ok: true, link: whatsapp_link });

  seed.analytics_events.push({ id: `ae-${Date.now()}`, event_type: 'post_sent', payload: { coupon_id, asset_id, channels: results }, created_at: new Date().toISOString() });
  fs.writeFileSync('seed.json', JSON.stringify(seed, null, 2));
  await awardXP(20, 'publish');

  return NextResponse.json({ ok: true, results, whatsapp_link });
}