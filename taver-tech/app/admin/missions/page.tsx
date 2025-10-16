'use client'
import { useEffect } from 'react';
import LayoutAdmin from '@/components/LayoutAdmin';
import { Topbar, Card, Button } from '@/components/UI/index';
import useSWR from 'swr';
import { subscribeTaverEvents } from '@/lib/realtime';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function MissionsPage() {
  const { data, mutate } = useSWR('/api/missions', fetcher);

  useEffect(() => {
    const unsubPromise = subscribeTaverEvents((evt)=>{
      if (['mission_created','mission_moved'].includes(evt.type)) {
        mutate();
      }
    });
    let unsub:any;
    (async()=>{ unsub = await unsubPromise; })();
    return ()=>{ if (typeof unsub==='function') unsub(); };
  }, [mutate]);

  async function move(id: string, status: string) {
    await fetch('/api/missions', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id, status }) });
    mutate();
  }

  const cols = {
    todo: (data?.data||[]).filter((m:any)=>m.status==='todo'),
    inprogress: (data?.data||[]).filter((m:any)=>m.status==='inprogress'),
    posted: (data?.data||[]).filter((m:any)=>m.status==='posted'),
  };

  return (
    <LayoutAdmin>
      <Topbar />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {(['todo','inprogress','posted'] as const).map((col) => (
          <div key={col} className="card-glass p-2 rounded">
            <div className="font-bold mb-2">{col === 'todo' ? 'Pendente' : col === 'inprogress' ? 'In Progress' : 'Postado'}</div>
            {(cols[col]||[]).map((m:any)=> (
              <Card key={m.id}>
                <div className="font-semibold">{m.title}</div>
                <div className="text-xs text-white/60">XP {m.xp_reward} • due {m.due_date ? new Date(m.due_date).toLocaleDateString() : '-'}</div>
                <div className="flex gap-2 mt-2">
                  {col!=='todo' && <Button onClick={()=>move(m.id,'todo')}>← Pendente</Button>}
                  {col!=='inprogress' && <Button onClick={()=>move(m.id,'inprogress')}>→ Em Progresso</Button>}
                  {col!=='posted' && <Button onClick={()=>move(m.id,'posted')}>✓ Postado</Button>}
                </div>
              </Card>
            ))}
          </div>
        ))}
      </div>
    </LayoutAdmin>
  );
}