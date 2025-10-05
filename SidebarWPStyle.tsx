'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Ticket, Package, ListChecks, ChartLine, UserRound, Bot } from 'lucide-react';

export default function SidebarWPStyle() {
  const pathname = usePathname();
  const items = [
    { href: '/admin', label: 'Dashboard', icon: Home },
    { href: '/admin/coupons', label: 'Cupons & Links', icon: Ticket },
    { href: '/admin/assets', label: 'Arsenal', icon: Package },
    { href: '/admin/missions', label: 'Missões', icon: ListChecks },
    { href: '/admin/analytics', label: 'Análises', icon: ChartLine },
    { href: '/admin/users', label: 'Usuários', icon: UserRound },
    { href: '/admin/sophai', label: 'SOPHAI', icon: Bot },
  ];
  return (
    <aside className="w-64 bg-black/50 card-glass border-r border-white/10 h-screen sticky top-0 p-4">
      <div className="text-xl font-bold mb-4">TAVER TECH</div>
      <nav className="space-y-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={`flex items-center gap-2 p-2 rounded transition-colors ${active ? 'bg-white/10 text-cyan-300' : 'hover:bg-white/5'}`}
            >
              <Icon size={18} className={active ? 'text-cyan-300' : 'text-cyan-300/70'} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}