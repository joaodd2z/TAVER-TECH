'use client'

import LayoutAdmin from '@/components/LayoutAdmin';
import { Topbar, Card, Button, Input, TechWizardAssistant } from '@/components/UI/index';
import useSWR from 'swr';
import { useEffect, useMemo, useState } from 'react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function PublishPage() {
  const [couponId, setCouponId] = useState('');
  const [assetId, setAssetId] = useState('');
  const [copy, setCopy] = useState('');
  const { data: coupons } = useSWR('/api/coupons', fetcher);
  const { data: assets } = useSWR('/api/assets', fetcher);

  async function generateCopy() {
    const prompt = `Gere um texto curto e empolgante em PT-BR para promover ${selectedCoupon?.product_name} com ${selectedCoupon?.discount_percent}% de desconto. Use tom guilda RPG.`;
    const r = await fetch('/api/sophai/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ message: prompt })});
    const j = await r.json();
    setCopy(j.text || JSON.stringify(j));
  }

  const selectedCoupon = useMemo(()=> (coupons?.data || []).find((c: any)=> c.id === couponId), [coupons, couponId]);
  const selectedAsset = useMemo(()=> (assets?.data || []).find((a: any)=> a.id === assetId), [assets, assetId]);

  async function send(channels: string[]) {
    const payloadChannels = channels.map((c)=> ({ type: c }));
    const res = await fetch('/api/publish', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ coupon_id: couponId, asset_id: assetId, copy, channels: payloadChannels })});
    const j = await res.json();
    alert(`Enviado! WhatsApp: ${j.whatsapp_link}`);
  }

  return (
    <LayoutAdmin>
      <Topbar />
      <h2 className="text-xl font-semibold mb-4">Publicar</h2>
      <TechWizardAssistant />
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <div className="font-semibold mb-2">Cupom</div>
          <select className="bg-black/50 p-2 rounded w-full" value={couponId} onChange={(e)=> setCouponId(e.target.value)}>
            <option value="">Selecione…</option>
            {(coupons?.data || []).map((c: any)=> (<option key={c.id} value={c.id}>{c.product_name} • {c.platform} • {c.discount_percent}%</option>))}
          </select>
          <div className="mt-2 font-semibold">Asset</div>
          <select className="bg-black/50 p-2 rounded w-full" value={assetId} onChange={(e)=> setAssetId(e.target.value)}>
            <option value="">Selecione…</option>
            {(assets?.data || []).map((a: any)=> (<option key={a.id} value={a.id}>{a.title} • {a.type}</option>))}
          </select>
        </Card>
        <Card>
          <div className="font-semibold mb-2">Copy</div>
          <textarea className="w-full h-48 bg-black/40 border border-white/10 rounded p-2" value={copy} onChange={(e)=> setCopy(e.target.value)} />
          <div className="flex gap-2 mt-2">
            <Button onClick={generateCopy}>Gerar Copy (SOPHAI)</Button>
            <Button onClick={()=> setCopy('')}>Limpar</Button>
          </div>
        </Card>
        <Card>
          <div className="font-semibold mb-2">Preview</div>
          <pre className="text-xs whitespace-pre-wrap break-words">{selectedCoupon && selectedAsset ? `${selectedCoupon.platform} • ${selectedCoupon.product_name}
Cupom: ${selectedCoupon.coupon_code} (${selectedCoupon.discount_percent}% off)
Link: ${selectedCoupon.affiliate_link}
Asset: ${selectedAsset.title} (${selectedAsset.type}) ${selectedAsset.url}

${copy}` : 'Selecione Cupom e Asset'}</pre>
          <div className="flex gap-2 mt-3">
            <Button onClick={()=> send(['telegram'])}>Enviar Telegram</Button>
            <Button onClick={()=> send(['discord'])}>Enviar Discord</Button>
            <Button onClick={()=> send(['whatsapp'])}>Gerar WhatsApp</Button>
          </div>
        </Card>
      </div>
    </LayoutAdmin>
  );
}