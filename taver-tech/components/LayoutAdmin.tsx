import SidebarWPStyle from './SidebarWPStyle';

export default function LayoutAdmin({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[16rem_1fr] min-h-screen">
      <SidebarWPStyle />
      <main className="p-6">
        <header className="flex items-center justify-between mb-6 tech-wizard">
          <div className="flex items-center gap-3">
            <svg width="40" height="40" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="64" cy="64" r="60" fill="#0f172a" stroke="#22d3ee" strokeWidth="3"/>
              <path d="M64 20 L84 68 L44 68 Z" fill="#22d3ee" opacity="0.8"/>
              <circle cx="64" cy="48" r="10" fill="#a855f7"/>
            </svg>
            <div>
              <div className="text-lg font-bold">TAVER TECH Admin</div>
              <div className="text-xs text-white/70">Conforto visual • Produtividade • Guilda</div>
            </div>
          </div>
        </header>
        {children}
        {/* Tech Wizard floating assistant */}
        <div>
          {/* Import placed in page files; this container keeps layout spacing consistent */}
        </div>
      </main>
    </div>
  );
}