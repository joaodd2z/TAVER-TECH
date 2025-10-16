import LayoutAdmin from '@/components/LayoutAdmin';
import { Topbar, TechWizardAssistant } from '@/components/UI/index';

export default function AdminPage() {
  return (
    <LayoutAdmin>
      <Topbar />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="card-glass p-4 rounded">
          <div className="text-sm text-white/70">Cupons ativos</div>
          <div className="text-3xl font-bold">2</div>
        </div>
        <div className="card-glass p-4 rounded">
          <div className="text-sm text-white/70">Cliques (24h)</div>
          <div className="text-3xl font-bold">124</div>
        </div>
        <div className="card-glass p-4 rounded">
          <div className="text-sm text-white/70">Missões ativas</div>
          <div className="text-3xl font-bold">1</div>
        </div>
      </div>
      <TechWizardAssistant />
    </LayoutAdmin>
  );
}