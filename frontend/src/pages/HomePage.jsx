import { useAuth } from "@/providers/AuthProvider";
import { Link } from "react-router-dom";

export default function HomePage() {
  const { user, logout } = useAuth();
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard Toners</h1>
        <button
          onClick={() => logout()}
          className="h-9 px-3 rounded bg-black text-white"
        >
          Sair
        </button>
      </div>

      <div className="text-sm text-muted-foreground">
        Logado como <b>{user?.name}</b> ({user?.role})
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/toners" className="border rounded p-4 hover:bg-accent">
          Gerenciar Toners
        </Link>
        <Link to="/stock" className="border rounded p-4 hover:bg-accent">
          Movimentações
        </Link>
      </div>
    </div>
  );
}
