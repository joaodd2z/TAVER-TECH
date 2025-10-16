'use client'

import LayoutAdmin from '@/components/LayoutAdmin';
import { Topbar, Card, Button, Input, TechWizardAssistant } from '@/components/UI/index';
import useSWR from 'swr';
import { useState, useEffect } from 'react';
import { subscribeTaverEvents } from '@/lib/realtime';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function CouponsPage() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [tag, setTag] = useState('');
  const { data, mutate } = useSWR(`/api/coupons?q=${encodeURIComponent(q)}&status=${status}&tag=${tag}`, fetcher);

  useEffect(() => {
    const unsubPromise = subscribeTaverEvents((evt) => {
      if (['coupon_created','coupon_updated','coupon_deleted'].includes(evt.type)) {
        mutate();
      }
    });
    let unsub: any;
    (async () => { unsub = await unsubPromise; })();
    return () => { if (typeof unsub === 'function') unsub(); };
  }, [mutate]);

  async function createCoupon() {
    const body = {
      platform: 'Shopee',
      product_name: 'Novo Produto',
      affiliate_link: 'https://shopee.com/novo',
      coupon_code: 'NEW10',
      discount_percent: 10,
      expires_at: new Date(Date.now() + 86400000 * 7).toISOString(),
      created_by: 'admin',
      tags: ['novo']
    };
    await fetch('/api/coupons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    mutate();
  }

  async function generateShort(id: string) {
    const res = await fetch(`/api/coupons/${id}/generate-short`, { method: 'POST' });
    const json = await res.json();
    alert(`Shortlink: ${json.short_url}`);
    mutate();
  }

  return (
    <LayoutAdmin>
      <Topbar />
      <div className="flex items-center gap-2 mb-4">
        <Button onClick={createCoupon}>+ Novo Cupom</Button>
        <Input placeholder="Busca" value={q} onChange={(e: any) => setQ(e.target.value)} />
        <select className="bg-black/50 p-2 rounded" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Status</option>
          <option value="active">Ativo</option>
          <option value="paused">Pausado</option>
          <option value="expired">Expirado</option>
        </select>
        <Input placeholder="Tag" value={tag} onChange={(e: any) => setTag(e.target.value)} />
      </div>
      <TechWizardAssistant />

      <div className="grid grid-cols-1 gap-2">
        {(data?.data || []).map((c: any) => (
          <Card key={c.id}>
            <div className="flex justify-between items-center">
              <div>
                <div className="font-bold">{c.product_name} • {c.platform}</div>
                <div className="text-sm text-white/60">Cupom: {c.coupon_code} • {c.discount_percent}% • Expira: {new Date(c.expires_at).toLocaleDateString()}</div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => generateShort(c.id)}>Gerar Link Curto</Button>
                <Button variant="secondary" onClick={() => alert('Pausar/Ativar stub')}>Pausar/Ativar</Button>
                <Button variant="danger" onClick={() => alert('Excluir stub')}>Excluir</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </LayoutAdmin>
  );
}