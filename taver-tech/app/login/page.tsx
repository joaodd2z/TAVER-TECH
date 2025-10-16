'use client'

import { useEffect, useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@gamehouse.local');
  const [password, setPassword] = useState('changeme');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error('Falha no login');
      window.location.href = '/admin/coupons';
    } catch (err: any) {
      setError(err.message || 'Erro ao logar');
    } finally {
      setLoading(false);
    }
  }

  // Google Sign-In (Identity Services)
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string | undefined;
    if (!clientId) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      type GoogleAccountsID = {
        initialize: (cfg: { client_id: string; callback: (resp: { credential: string }) => void }) => void;
        renderButton: (el: HTMLElement, opts: any) => void;
        prompt: () => void;
      };
      type WinGoogle = { accounts?: { id?: GoogleAccountsID } };
      const w = window as unknown as { google?: WinGoogle };
      const idAPI = w.google?.accounts?.id;
      if (idAPI) {
        idAPI.initialize({
          client_id: clientId,
          callback: async (response: { credential: string }) => {
            try {
              setLoading(true);
              setError('');
              const res = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ credential: response.credential })
              });
              if (!res.ok) throw new Error('Falha no login Google');
              window.location.href = '/admin/coupons';
            } catch (err: any) {
              setError(err.message || 'Erro no login Google');
            } finally {
              setLoading(false);
            }
          },
        });
        const el = document.getElementById('googleBtn');
        if (el) idAPI.renderButton(el, { theme: 'filled_black', size: 'large', text: 'signin_with', width: 320 });
        idAPI.prompt();
      }
    };
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="flex flex-col items-center mb-6">
          <svg width="96" height="96" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-3">
            <circle cx="64" cy="64" r="60" fill="#0f172a" stroke="#22d3ee" strokeWidth="3"/>
            <path d="M64 20 L84 68 L44 68 Z" fill="#22d3ee" opacity="0.8"/>
            <circle cx="64" cy="48" r="10" fill="#a855f7"/>
            <path d="M40 88 Q64 70 88 88" stroke="#a855f7" strokeWidth="3" fill="none"/>
            <path d="M30 100 H98" stroke="#22d3ee" strokeWidth="2" strokeDasharray="4 4"/>
          </svg>
          <h1 className="text-2xl font-bold">Painel Administrativo</h1>
          <p className="text-white/70 text-sm">Entre para acessar cupons, arsenal, missões e SOPHAI</p>
          <p className="text-white/50 text-xs mt-1">O Mago Tech saúda você discretamente. ✦</p>
        </div>
        <form onSubmit={login} className="card-glass p-6 rounded space-y-4">
          {error && <div className="bg-red-500/20 text-red-300 p-2 rounded text-sm">{error}</div>}
          <div>
            <label className="text-sm mb-1 block">Email</label>
            <input type="email" value={email} onChange={e=>setEmail((e.target as HTMLInputElement).value)} className="w-full bg-black/40 border border-white/10 rounded p-2" />
          </div>
          <div>
            <label className="text-sm mb-1 block">Senha</label>
            <input type="password" value={password} onChange={e=>setPassword((e.target as HTMLInputElement).value)} className="w-full bg-black/40 border border-white/10 rounded p-2" />
          </div>
          <button disabled={loading} className="w-full px-3 py-2 bg-cyan-400 text-black rounded">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          <div className="flex items-center gap-2 my-2">
            <div className="flex-1 h-px bg-white/10" />
            <div className="text-xs text-white/50">ou</div>
            <div className="flex-1 h-px bg-white/10" />
          </div>
          <div id="googleBtn" className="flex justify-center" />
          <div className="mt-3 text-center">
            <a href="https://drive.google.com" target="_blank" rel="noreferrer" className="text-xs text-cyan-300 hover:text-cyan-200">Abrir Google Drive</a>
          </div>
        </form>
      </div>
    </div>
  );
}