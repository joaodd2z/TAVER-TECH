'use client'

import React from 'react';
import Link from 'next/link';


export function Button({ children, className = '', variant = 'primary', ...props }: React.ComponentProps<'button'> & { className?: string; variant?: 'primary' | 'secondary' | 'danger' }) {
  const base = 'px-3 py-2 rounded font-medium';
  const variants: Record<string, string> = {
    primary: 'bg-cyan-600 hover:bg-cyan-500 text-black',
    secondary: 'bg-white/10 hover:bg-white/20 text-white',
    danger: 'bg-red-600 hover:bg-red-500 text-white',
  };
  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Input(props: React.ComponentProps<'input'>) {
  return <input {...props} className={`px-3 py-2 rounded bg-black/40 border border-white/10 focus:outline-none focus:border-cyan-400 ${props.className || ''}`} />
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`card-glass rounded p-4 ${className}`}>{children}</div>;
}

export function Modal({ title, children, open, onClose }: { title: string; children: React.ReactNode; open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="card-glass rounded w-full max-w-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-white/70 hover:text-white">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Topbar() {
  const [toast, setToast] = React.useState<string>('');
  React.useEffect(() => {
    let unsub: any;
    (async () => {
      const { subscribeTaverEvents } = await import('@/lib/realtime');
      unsub = await subscribeTaverEvents((evt) => {
        if (evt.type === 'level_up') {
          const lvl = evt.payload?.level || evt.payload?.payload?.level;
          setToast(`Parabéns! Level ${lvl} atingido.`);
          setTimeout(() => setToast(''), 4500);
        }
      });
    })();
    return () => { if (typeof unsub === 'function') unsub(); };
  }, []);

  return (
    <div className="sticky top-0 z-20 bg-black/40 backdrop-blur border-b border-white/10 px-4 py-2 flex items-center gap-2">
      <Link href="/admin" className="font-bold text-cyan-300">TAVER TECH</Link>
      <div className="flex-1" />
      <XPBar />
      <input placeholder="Buscar..." className="px-3 py-2 rounded bg-black/40 border border-white/10" />
      {toast && (
        <div className="fixed bottom-4 right-4 card-glass border border-amber-400/40 bg-black/60 px-4 py-2 rounded shadow-lg">
          <div className="text-amber-300 font-semibold">{toast}</div>
        </div>
      )}
    </div>
  );
}

function XPBar() {
  const [profile, setProfile] = React.useState<{ xp: number; level: number } | null>(null);
  React.useEffect(() => {
    fetch('/api/users/profile').then(r=> r.json()).then((j)=> setProfile(j.profile));
  }, []);
  if (!profile) return null;
  const next = profile.level * 150;
  const pct = Math.min(100, Math.round((profile.xp / next) * 100));
  return (
    <div className="flex items-center gap-2">
      <div className="text-xs text-white/70">Lv {profile.level}</div>
      <div className="w-40 h-2 bg-white/10 rounded overflow-hidden">
        <div className="h-2 bg-amber-400" style={{ width: `${pct}%` }} />
      </div>
      <div className="text-xs text-white/70">{profile.xp}/{next}</div>
    </div>
  );
}

export function TechWizardAssistant() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Toggle button */}
      <button
        aria-label={open ? 'Fechar assistente' : 'Abrir assistente'}
        onClick={() => setOpen((v) => !v)}
        className="button-soft flex items-center gap-2 px-3 py-2 rounded shadow-md"
      >
        <svg width="24" height="24" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-float">
          <circle cx="64" cy="64" r="60" fill="#0f172a" stroke="#22d3ee" strokeWidth="3" />
          <path d="M64 20 L84 68 L44 68 Z" fill="#22d3ee" opacity="0.8" />
          <circle cx="64" cy="48" r="10" fill="#a855f7" />
        </svg>
        <span className="text-sm font-semibold text-cyan-300">Mago Tech</span>
      </button>

      {/* Panel */}
      {open && (
        <div className="mt-3 w-[20rem] card-glass border border-white/10 rounded p-3 shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <svg width="28" height="28" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="64" cy="64" r="60" fill="#0f172a" stroke="#22d3ee" strokeWidth="3" />
              <path d="M64 20 L84 68 L44 68 Z" fill="#22d3ee" opacity="0.8" />
              <circle cx="64" cy="48" r="10" fill="#a855f7" />
            </svg>
            <div>
              <div className="text-sm font-bold">Conselhos do Mago</div>
              <div className="text-xs text-white/60">Dicas rápidas para produtividade</div>
            </div>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="text-white/80">• Use o arsenal para manter assets tagueados e fáceis de encontrar.</li>
            <li className="text-white/80">• Gere copy com a SOPHAI e ajuste o tom no preview antes de publicar.</li>
            <li className="text-white/80">• Pausar/ativar cupons ajuda a manter campanhas organizadas.</li>
          </ul>
          <div className="mt-3 flex items-center gap-2">
            <a href="/admin/sophai" className="px-2 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-black text-xs font-semibold">Ir para SOPHAI</a>
            <a href="/admin/assets" className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-semibold">Abrir Arsenal</a>
          </div>
        </div>
      )}
    </div>
  );
}