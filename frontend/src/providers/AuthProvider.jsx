import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import * as auth from "@/services/auth.service";
import { toast } from "@/components/ui/use-toast";

const AuthCtx = createContext(null);

export default function AuthProvider({ children }) {
  const qc = useQueryClient();
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // expõe token em memória para axios
  useEffect(() => {
    window.__ACCESS_TOKEN__ = accessToken || null;
  }, [accessToken]);

  // force logout vindo do axios
  useEffect(() => {
    function handler() {
      logout(true);
    }
    window.addEventListener("auth:force-logout", handler);
    return () => window.removeEventListener("auth:force-logout", handler);
  }, []);

  // bootstrap (tenta pegar /users/me/compact com refresh auto lá no axios)
  useEffect(() => {
    (async () => {
      try {
        const me = await auth.meCompact();
        setUser(me);
      } catch {
        // não logado
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(email, password) {
    const { user, accessToken } = await auth.login(email, password);
    setUser(user);
    setAccessToken(accessToken);
    return user;
  }

  async function logout(silent = false) {
    try {
      await auth.logout();
    } catch {}
    setUser(null);
    setAccessToken(null);
    qc.clear();
    if (!silent) toast({ title: "Sessão encerrada" });
  }

  const value = useMemo(
    () => ({
      user,
      accessToken,
      loading,
      isAuthenticated: !!user,
      hasRole: (roles = []) => (user ? roles.includes(user.role) : false),
      login,
      logout,
      setUser,
    }),
    [user, accessToken, loading]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
