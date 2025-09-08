// src/components/layout/AppSidebar.jsx
import { NavLink } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  History,
  Users,
  Plus,
  Printer,
  LogOut,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import logo from "@/assets/logo.png";
function ThemeToggle() {
  const [mode, setMode] = useState(
    () => localStorage.getItem("ui-theme") || "system"
  );
  useEffect(() => {
    const root = document.documentElement;
    let resolved = mode;
    if (mode === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      resolved = mq.matches ? "dark" : "light";
    }
    root.classList.toggle("dark", resolved === "dark");
    localStorage.setItem("ui-theme", mode);
  }, [mode]);

  return (
    <div className="grid grid-cols-3 gap-1 p-1 rounded-md border">
      <Button
        variant={mode === "light" ? "default" : "ghost"}
        size="icon"
        onClick={() => setMode("light")}
        title="Claro"
      >
        <Sun className="h-4 w-4" />
      </Button>
      <Button
        variant={mode === "dark" ? "default" : "ghost"}
        size="icon"
        onClick={() => setMode("dark")}
        title="Escuro"
      >
        <Moon className="h-4 w-4" />
      </Button>
      <Button
        variant={mode === "system" ? "default" : "ghost"}
        size="icon"
        onClick={() => setMode("system")}
        title="Sistema"
      >
        <Monitor className="h-4 w-4" />
      </Button>
    </div>
  );
}

function Item({ to, icon: Icon, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
          isActive ? "bg-muted font-medium" : "hover:bg-muted"
        )
      }
    >
      <Icon className="h-4 w-4" />
      <span className="truncate">{children}</span>
    </NavLink>
  );
}

export default function AppSidebar({ onNavigate }) {
  const { user, hasRole, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebar:collapsed") === "1"
  );
  useEffect(() => {
    localStorage.setItem("sidebar:collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  const isAdmin = hasRole(["admin"]);
  const isTech = hasRole(["tecnico"]);

  const main = useMemo(
    () => [
      { to: "/", label: "Dashboard", icon: LayoutDashboard, show: true },
      { to: "/toners", label: "Toners", icon: Package, show: true },
      {
        to: "/printers",
        label: "Impressoras",
        icon: Printer,
        show: isAdmin || isTech,
      },

      { to: "/stock", label: "Histórico", icon: History, show: true },
    ],
    []
  );

  const manage = useMemo(
    () => [
      {
        to: "/toners/new",
        label: "Cadastrar toner",
        icon: Plus,
        show: isAdmin || isTech,
      },
      {
        to: "/printers/new",
        label: "Cadastrar impressora",
        icon: Printer,
        show: isAdmin || isTech,
      },
      { to: "/users", label: "Usuários", icon: Users, show: isAdmin },
    ],
    [isAdmin, isTech]
  );

  return (
    <aside
      className={cn(
        // FIX: fixa e não extrapola a altura
        "sticky top-0 h-screen lg:h-[100svh] border-r bg-card text-card-foreground",
        "transition-[width] duration-200",
        collapsed ? "w-[64px]" : "w-[260px]",
        // layout em coluna para controlar scroll interno
        "flex flex-col"
      )}
    >
      {/* Topo (fixo dentro do aside) */}
      <div className="flex items-center justify-between px-3 h-14 shrink-0">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="h-6 w-6" />
          {!collapsed && <div className="font-semibold">TonersFull</div>}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed((v) => !v)}
          title="Colapsar"
        >
          <span className="text-lg">{collapsed ? "»" : "«"}</span>
        </Button>
      </div>
      <Separator className="shrink-0" />

      {/* Miolo navegável (rolagem só aqui) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        <nav className="space-y-1">
          {!collapsed && (
            <div className="px-2 pb-1 text-xs text-muted-foreground">Geral</div>
          )}
          {main
            .filter((i) => i.show)
            .map((i) => (
              <Item key={i.to} to={i.to} icon={i.icon} onClick={onNavigate}>
                {i.label}
              </Item>
            ))}
        </nav>

        {(isAdmin || isTech) && (
          <nav className="space-y-1">
            {!collapsed && (
              <div className="px-2 pb-1 text-xs text-muted-foreground">
                Gestão
              </div>
            )}
            {manage
              .filter((i) => i.show)
              .map((i) => (
                <Item key={i.to} to={i.to} icon={i.icon} onClick={onNavigate}>
                  {i.label}
                </Item>
              ))}
          </nav>
        )}
      </div>

      <Separator className="shrink-0" />

      {/* Rodapé (fixo dentro do aside) */}
      <div className="p-3 space-y-3 shrink-0">
        {!collapsed && (
          <>
            <div className="text-sm">
              <div className="font-medium truncate">
                {user?.name || user?.email}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="truncate">{user?.email}</span>
                {user?.role && (
                  <Badge variant="secondary" className="uppercase">
                    {user.role}
                  </Badge>
                )}
              </div>
            </div>
            <ThemeToggle />
          </>
        )}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => logout()}
          title="Sair"
        >
          <LogOut className="h-4 w-4 mr-2" /> {!collapsed ? "Sair" : ""}
        </Button>
      </div>
    </aside>
  );
}
