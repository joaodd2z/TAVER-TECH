export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { sendMessage } from '@/lib/hf_sophai';
import { awardXP } from '@/lib/gamification';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { message, history = [], context = '', model_provider = 'hf', model } = body || {};
  const out = await sendMessage({ message, history, context, model_provider, model });
  await awardXP(2, 'sophai_chat');
  return NextResponse.json(out);
}