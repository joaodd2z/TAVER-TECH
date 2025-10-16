'use client'

import LayoutAdmin from '@/components/LayoutAdmin';
import { useEffect, useState } from 'react';
import { Topbar, Card, Button, Input, TechWizardAssistant } from '@/components/UI/index';

export default function SophaiPage() {
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [context, setContext] = useState('Conselheira da Guilda: Responda como uma mentora RPG para marketing tech.');
  const [response, setResponse] = useState('');
  const [sending, setSending] = useState(false);
  const [models, setModels] = useState<{ hf: string[]; ollama: string[] }>({ hf: [], ollama: [] });
  const [provider, setProvider] = useState<'hf'|'ollama'>('hf');
  const [model, setModel] = useState<string>('Qwen/Qwen2.5-7B-Instruct');

  // Carregar histórico após montagem no cliente
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('sophai_history') : null;
      if (raw) setHistory(JSON.parse(raw));
    } catch (e) {
      console.warn('Falha ao carregar histórico SOPHAI', e);
    }
  }, []);

  // Persistir histórico quando mudar
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('sophai_history', JSON.stringify(history));
      }
    } catch (e) {
      console.warn('Falha ao salvar histórico SOPHAI', e);
    }
  }, [history]);

  // Carregar modelos disponíveis do backend
  useEffect(() => {
    fetch('/api/sophai/models').then(r=>r.json()).then((j)=>{
      setModels(j);
      if (j.hf?.length) setModel(j.hf[0]);
    }).catch(()=>{});
  }, []);

  async function send() {
    if (!message.trim()) return; // UX: evitar enviar vazio
    setSending(true);
    try {
      const r = await fetch('/api/sophai/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ message, history, context, model_provider: provider, model }) });
      const j = await r.json();
      const text = j.text || (typeof j === 'string' ? j : JSON.stringify(j));
      setHistory((h)=> [...h, message, text]);
      setResponse(text);
      setMessage('');
    } catch (e) {
      setResponse('Erro ao enviar mensagem para SOPHAI. Verifique conexão e variáveis de ambiente.');
      console.error(e);
    } finally {
      setSending(false);
    }
  }

  async function exportDataset() {
    try {
      const res = await fetch('/api/sophai/train', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ title: 'Chat Export', data: history }) });
      const j = await res.json();
      alert('Dataset salvo: '+ (j.entry?.id || 'ok'));
    } catch (e) {
      alert('Falha ao exportar dataset');
      console.error(e);
    }
  }

  return (
    <LayoutAdmin>
      <div className="flex items-center gap-3 mb-4">
        <svg width="40" height="40" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="64" cy="64" r="60" fill="#0f172a" stroke="#22d3ee" strokeWidth="3"/>
          <path d="M64 20 L84 68 L44 68 Z" fill="#22d3ee" opacity="0.8"/>
          <circle cx="64" cy="48" r="10" fill="#a855f7"/>
        </svg>
        <h2 className="text-xl font-semibold">SOPHAI – Conselheira da Guilda</h2>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="card-glass p-3 rounded">
          <div className="font-semibold mb-2">Datasets</div>
          <button className="px-3 py-2 bg-cyan-600 text-black rounded" onClick={exportDataset} disabled={sending}>Exportar Dataset (JSON)</button>
        </div>
        <div className="card-glass p-3 rounded">
          <div className="font-semibold mb-2">Chat da Conselheira</div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="text-xs block mb-1">Provedor</label>
              <select value={provider} onChange={(e)=> setProvider(e.target.value as 'hf'|'ollama')} className="w-full bg-black/40 border border-white/10 rounded p-2">
                <option value="hf">HuggingFace</option>
                <option value="ollama" disabled={!models.ollama?.length}>Ollama (local)</option>
              </select>
            </div>
            <div>
              <label className="text-xs block mb-1">Modelo</label>
              <select value={model} onChange={(e)=> setModel(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded p-2">
                {(provider === 'hf' ? models.hf : models.ollama).map((m)=> (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
          <textarea className="w-full h-24 bg-black/40 border border-white/10 rounded p-2 mb-2" value={context} onChange={(e)=> setContext(e.target.value)} placeholder="Defina o contexto/tonalidade das respostas" />
          <input className="px-3 py-2 rounded bg-black/40 border border-white/10 w-full" value={message} onChange={(e)=>setMessage(e.target.value)} placeholder="Pergunte à SOPHAI" />
          <div className="flex gap-2 mt-2">
            <button onClick={send} className="px-3 py-2 bg-amber-400 text-black rounded" disabled={sending}>{sending ? 'Enviando...' : 'Enviar'}</button>
            <button onClick={()=> { setHistory([]); setResponse(''); }} className="px-3 py-2 bg-white/10 rounded" disabled={sending}>Limpar</button>
          </div>
          <pre className="mt-3 text-xs whitespace-pre-wrap break-words">{response}</pre>
        </div>
        <div className="card-glass p-3 rounded">
          <div className="font-semibold mb-2">Sugestões & Seeds</div>
          <ul className="list-disc pl-4 text-sm text-white/70">
            <li>Tom de guilda RPG: honras, missões, recompensas</li>
            <li>Copy concisa, foco em benefícios e CTA</li>
            <li>Tags por produto para analytics</li>
          </ul>
        </div>
      </div>
      <TechWizardAssistant />
    </LayoutAdmin>
  );
}