'use client'
import LayoutAdmin from '@/components/LayoutAdmin';
import { Topbar, Card, Button, Input, TechWizardAssistant } from '@/components/UI/index';
import useSWR from 'swr';
import { useState, useEffect } from 'react';
import { subscribeTaverEvents } from '@/lib/realtime';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function AssetsPage() {
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [tag, setTag] = useState('');
  const { data, mutate } = useSWR(`/api/assets?q=${encodeURIComponent(q)}&type=${type}&tag=${tag}`, fetcher);

  useEffect(() => {
    const unsubPromise = subscribeTaverEvents((evt)=>{
      if (['asset_uploaded','asset_deleted'].includes(evt.type)) {
        mutate();
      }
    });
    let unsub:any;
    (async()=>{ unsub = await unsubPromise; })();
    return ()=>{ if (typeof unsub==='function') unsub(); };
  }, [mutate]);

  async function uploadStub() {
    const body = { title:'Novo Asset', type:'image', url:'https://example.com/novo.png', uploaded_by:'admin', tags:['Brand'], meta:{ size:10, ext:'png', mime:'image/png' } };
    await fetch('/api/assets', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
    mutate();
  }

  return (
    <LayoutAdmin>
      <Topbar />
      <div className="flex items-center gap-2 mb-4">
        <Button onClick={uploadStub}>Upload (stub)</Button>
        <Input placeholder="Busca" value={q} onChange={(e:any)=>setQ(e.target.value)} />
        <select className="bg-black/50 p-2 rounded" value={type} onChange={(e)=>setType(e.target.value)}>
          <option value="">Tipo</option>
          <option value="image">Imagem</option>
          <option value="video">Vídeo</option>
          <option value="template">Template</option>
          <option value="link">Link</option>
          <option value="doc">Doc</option>
        </select>
        <Input placeholder="Tag" value={tag} onChange={(e:any)=>setTag(e.target.value)} />
      </div>
      {/* Assistente visual */}
      <TechWizardAssistant />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(data?.data||[]).map((a:any)=> (
          <Card key={a.id}>
            <div className="text-sm font-bold">{a.title}</div>
            <div className="text-xs text-white/60">{a.type} • {a.tags?.join(', ')}</div>
            <div className="flex gap-2 mt-2">
              <Button onClick={()=>window.open(a.url, '_blank')}>Abrir</Button>
              <Button variant="danger" onClick={async()=>{ await fetch(`/api/assets?id=${a.id}`, { method:'DELETE' }); mutate(); }}>Excluir</Button>
            </div>
          </Card>
        ))}
      </div>
    </LayoutAdmin>
  );
}