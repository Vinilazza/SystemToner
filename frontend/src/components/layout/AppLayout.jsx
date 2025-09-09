import AppSidebar from "./AppSidebar";
import AppTopbar from "./AppTopBar";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="grid lg:grid-cols-[260px_1fr] grid-cols-1 min-h-dvh">
      {/* Sidebar fixa no desktop, escondida no mobile */}
      <div className="hidden lg:block">
        <AppSidebar />
      </div>

      {/* Coluna de conteúdo */}
      <div className="flex flex-col min-w-0">
        <AppTopbar />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
