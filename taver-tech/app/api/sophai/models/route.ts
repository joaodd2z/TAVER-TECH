export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function GET() {
  const models = { hf: ['google/flan-t5-base','tiiuae/falcon-7b-instruct','Qwen/Qwen2.5-7B-Instruct'], ollama: [] as string[] };
  if (process.env.OLLAMA_HOST) {
    models.ollama = ['llama3','qwen2'];
  }
  return NextResponse.json(models);
}