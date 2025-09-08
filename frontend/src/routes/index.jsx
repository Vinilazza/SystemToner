// src/routes/index.jsx
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import LoginPage from "@/pages/auth/LoginPage";
import HomePage from "@/pages/HomePage";
import TonersListPage from "@/pages/toners/TonersListPage";
import StockListPage from "@/pages/stock/StockListPage";
import RegisterPage from "../pages/auth/RegisterPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import TonerFormPage from "../pages/toners/TonersFormPage";
import PrinterFormPage from "../pages/printers/PrintersFormPage";
import UsersListPage from "../pages/users/UsersListPage";
import UserEditPage from "../pages/users/UserEditPage";
import AppLayout from "../components/layout/AppLayout";
import PrintersListPage from "../pages/printers/PrinterListPage";

function Protected() {
  const { isAuthenticated, loading, bootstrap } = useAuth();
  // 1) Se ainda está carregando E não há indício de sessão -> manda pro login imediatamente
  if (loading && !bootstrap?.hasStoredTokens)
    return <Navigate to="/login" replace />;
  // 2) Se já terminou de carregar e não autenticou -> login
  if (!loading && !isAuthenticated) return <Navigate to="/login" replace />;
  // 3) Caso contrário (tem sessão ou está tentando com tokens) -> segue
  return <Outlet />;
}

function RequireRole({ allowed = [] }) {
  const { user, loading, bootstrap } = useAuth();
  // se está carregando mas nem tokens existem, nem tenta: volta p/ dashboard/login
  if (loading && !bootstrap?.hasStoredTokens)
    return <Navigate to="/" replace />;
  if (!loading && !allowed.includes(user?.role))
    return <Navigate to="/" replace />;
  return <Outlet />;
}

// (opcional) impedir acesso a /login e /register para quem já está logado
function PublicOnly() {
  const { isAuthenticated, loading } = useAuth();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Outlet />;
}

export default function RoutesApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicOnly />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<Protected />}>
          {/* Tudo que tem sidebar/topbar vai dentro do layout */}
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="/toners" element={<TonersListPage />} />
            <Route path="/stock" element={<StockListPage />} />

            <Route element={<RequireRole allowed={["admin", "tecnico"]} />}>
              <Route path="/toners/new" element={<TonerFormPage />} />
              <Route path="/toners/:id/edit" element={<TonerFormPage />} />
              <Route path="/printers" element={<PrintersListPage />} />
              <Route path="/printers/new" element={<PrinterFormPage />} />
              <Route path="/printers/:id/edit" element={<PrinterFormPage />} />
            </Route>

            <Route element={<RequireRole allowed={["admin"]} />}>
              <Route path="/users" element={<UsersListPage />} />
              <Route path="/users/:id/edit" element={<UserEditPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
