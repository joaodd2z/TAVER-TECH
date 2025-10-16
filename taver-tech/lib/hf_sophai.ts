import axios from 'axios';

const HF_API_KEY = process.env.HF_API_KEY || '';
const HF_DEFAULT_MODEL = 'Qwen/Qwen2.5-7B-Instruct';

export async function sendMessage({ message, history = [], context = '', model_provider = 'hf', model = HF_DEFAULT_MODEL }: { message: string; history?: string[]; context?: string; model_provider?: 'hf' | 'ollama'; model?: string }) {
  const prompt = `${context ? context + '\n\n' : ''}${history.length ? history.join('\n') + '\n' : ''}${message}`;
  try {
    if (model_provider === 'ollama' && process.env.OLLAMA_HOST) {
      const host = process.env.OLLAMA_HOST!;
      const res = await axios.post(`${host}/api/generate`, { model: model || 'llama3', prompt });
      return { text: res.data?.response ?? '', tokens: res.data?.eval_count ?? 0, model: `ollama:${model}` };
    } else {
      if (!HF_API_KEY) {
        return { text: 'SOPHAI indisponível: configure a variável de ambiente HF_API_KEY para usar o provedor HuggingFace.', tokens: 0, model: `hf:${model}` };
      }
      const url = `https://api-inference.huggingface.co/models/${model}`;
      const res = await axios.post(url, { inputs: prompt }, { headers: { Authorization: `Bearer ${HF_API_KEY}` } });
      const text = Array.isArray(res.data)
        ? res.data[0]?.generated_text ?? JSON.stringify(res.data)
        : (res.data?.generated_text ?? JSON.stringify(res.data));
      return { text, tokens: 0, model: `hf:${model}` };
    }
  } catch (e: any) {
    const msg = e?.response?.data?.error || e?.message || 'Erro desconhecido ao integrar com o provedor do modelo.';
    return { text: `Falha na SOPHAI: ${msg}`, tokens: 0, model: `provider:${model_provider}` };
  }
}

// Backwards compatibility
export async function sophaiChat(prompt: string) {
  return sendMessage({ message: prompt });
}