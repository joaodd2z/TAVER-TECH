import LayoutAdmin from '@/components/LayoutAdmin';

export default function UsersPage() {
  return (
    <LayoutAdmin>
      <h2 className="text-xl font-semibold mb-4">Usuários</h2>
      <div className="text-white/70">Admin pode criar novos usuários</div>
    </LayoutAdmin>
  );
}