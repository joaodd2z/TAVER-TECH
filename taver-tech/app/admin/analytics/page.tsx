'use client';

import { useEffect } from 'react';
import LayoutAdmin from '@/components/LayoutAdmin';
import { Topbar, Card } from '@/components/UI/index';
import useSWR from 'swr';
import { subscribeTaverEvents } from '@/lib/realtime';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AnalyticsPage() {
  const { data: summary, mutate: mSummary } = useSWR('/api/analytics/summary', fetcher);
  const { data: leaderboard, mutate: mBoard } = useSWR('/api/analytics/leaderboard', fetcher);

  useEffect(() => {
    const unsubPromise = subscribeTaverEvents((evt: any) => {
      if (['short_clicked', 'post_sent', 'level_up'].includes(evt.type)) {
        mSummary();
        mBoard();
      }
    });
    let unsub: any;
    (async () => {
      unsub = await unsubPromise;
    })();
    const interval = setInterval(() => {
      mSummary();
      mBoard();
    }, 60000);
    return () => {
      clearInterval(interval);
      if (typeof unsub === 'function') unsub();
    };
  }, [mSummary, mBoard]);

  function exportCSV() {
    const rows = [
      ['metric', 'value'],
      ['total_clicks', summary?.total_clicks ?? 0],
      ['posts', summary?.posts ?? 0],
      ['missions_active', summary?.missions_active ?? 0],
      ['xp_total', summary?.xp_total ?? 0],
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analytics_summary.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <LayoutAdmin>
      <Topbar />
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Análises</h2>
        <button onClick={exportCSV} className="px-3 py-2 bg-cyan-600 text-black rounded">Export CSV</button>
      </div>
      <div className="grid grid-cols-4 gap-3 mb-4">
        <Card>
          <div className="text-white/60">Cliques totais</div>
          <div className="text-2xl font-bold">{summary?.total_clicks ?? 0}</div>
        </Card>
        <Card>
          <div className="text-white/60">Posts enviados</div>
          <div className="text-2xl font-bold">{summary?.posts ?? 0}</div>
        </Card>
        <Card>
          <div className="text-white/60">Missões ativas</div>
          <div className="text-2xl font-bold">{summary?.missions_active ?? 0}</div>
        </Card>
        <Card>
          <div className="text-white/60">XP total</div>
          <div className="text-2xl font-bold">{summary?.xp_total ?? 0}</div>
        </Card>
      </div>

      <Card>
        <div className="font-semibold mb-2">Ranking XP</div>
        <div className="space-y-2">
          {(leaderboard?.data || []).map((u: any) => (
            <div key={u.email} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-600" />
              <div className="flex-1">
                <div className="font-semibold">{u.email}</div>
                <div className="text-white/60 text-sm">
                  Level {u.level} • XP {u.xp} • Posts {u.posts_count}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </LayoutAdmin>
  );
}